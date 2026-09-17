import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import sharp from 'sharp'
import { z } from 'zod'

function load(file, dependencies = {}) {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } })
  const exports = {}
  vm.runInNewContext(outputText, { exports, Buffer, File, Uint8Array, console, require(name) {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`)
    return dependencies[name]
  } })
  return exports
}
const rules = load('src/lib/avatar-rules.ts')
const { compressAvatar } = load('src/lib/avatar-image.ts', { sharp, './avatar-rules': rules })

test('3 MB is checked before decoding, including exact boundary', async () => {
  assert.equal(rules.avatarFileError({ size: rules.MAX_AVATAR_BYTES, type: 'image/jpeg' }), null)
  const oversized = new File([new Uint8Array(rules.MAX_AVATAR_BYTES + 1)], 'large.jpg', { type: 'image/jpeg' })
  await assert.rejects(compressAvatar(oversized), /3 MB/)
  await assert.rejects(compressAvatar(new File([], 'empty.png', { type: 'image/png' })), /válida/)
})

test('real images become static WebP capped at 768 px and 256 KB, without metadata', async () => {
  for (const format of ['jpeg', 'png', 'webp']) {
    const original = await sharp({ create: { width: 1800, height: 1200, channels: 3, background: '#1664aa' } })
      .withMetadata({ orientation: 6 }).toFormat(format).toBuffer()
    const output = await compressAvatar(new File([original], `photo.${format}`, { type: `image/${format}` }))
    const metadata = await sharp(Buffer.from(await output.arrayBuffer())).metadata()
    assert.equal(output.type, 'image/webp')
    assert.ok(output.size <= 256 * 1024)
    assert.ok(metadata.width <= 768 && metadata.height <= 768)
    assert.equal(metadata.exif, undefined)
    assert.equal(metadata.orientation, undefined)
    if (format === 'jpeg') assert.ok(metadata.height > metadata.width)
  }
})

test('rejects damaged files and SVG disguised as JPEG', async () => {
  for (const content of ['not an image', '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>']) {
    await assert.rejects(compressAvatar(new File([content], 'fake.jpg', { type: 'image/jpeg' })), /processar/)
  }
})

test('rejects decompression-heavy images even when compressed input is under 3 MB', async () => {
  const huge = await sharp({ create: { width: 5100, height: 5100, channels: 3, background: '#fff' } }).png().toBuffer()
  assert.ok(huge.length < rules.MAX_AVATAR_BYTES)
  await assert.rejects(compressAvatar(new File([huge], 'huge.png', { type: 'image/png' })), /25 megapixels/)
})

test('small images are not enlarged', async () => {
  const original = await sharp({ create: { width: 64, height: 32, channels: 4, background: '#ff000080' } }).png().toBuffer()
  const output = await compressAvatar(new File([original], 'small.png', { type: 'image/png' }))
  const metadata = await sharp(Buffer.from(await output.arrayBuffer())).metadata()
  assert.equal(metadata.width, 64)
  assert.equal(metadata.height, 32)
  assert.equal(metadata.hasAlpha, true)
})

function profileAction({ user = { id: 'owner', avatarUrl: '/api/media/avatars/old.webp' }, saveError = null } = {}) {
  const calls = []
  const db = { from() { return db }, update(value) { calls.push(['update', value]); return db }, eq(field, value) { calls.push(['owner', field, value]); return db }, select() { return db }, async maybeSingle() { return { data: saveError ? null : { id: 'owner' }, error: saveError } } }
  const { updateProfileAction } = load('src/app/perfil/actions.ts', {
    'next/cache': { revalidatePath() {} },
    'next/navigation': { redirect(url) { throw new Error(`redirect:${url}`) } }, zod: { z },
    '@/lib/auth': { getCurrentUser: async () => user },
    '@/lib/supabase/server': { createClient: async () => db },
    '@/lib/profile': { profileGenders: ['masculino', 'feminino', 'indiferente'] },
    '@/lib/avatar-image': { compressAvatar: async file => { calls.push(['compress']); return file } },
    '@/lib/r2': {
      uploadR2Media: async (file, folder) => { calls.push(['upload', folder]); return '/api/media/avatars/owner/new.webp' },
      deleteR2MediaByUrl: async url => calls.push(['cleanup', url]),
    },
  })
  return { updateProfileAction, calls }
}

function form(mode) {
  const data = new FormData()
  for (const [key, value] of Object.entries({ fullName: 'Test Player', address: '', favoriteGame: '', playerTag: 'test', bio: '', whatsapp: '', gender: 'indiferente', avatarMode: mode })) data.set(key, value)
  if (mode === 'upload') data.set('avatarFile', new File(['test'], 'test.webp', { type: 'image/webp' }))
  return data
}

test('unauthenticated request never uploads or writes a profile', async () => {
  const action = profileAction({ user: null })
  await assert.rejects(action.updateProfileAction(form('upload')), /redirect:\/login/)
  assert.equal(action.calls.length, 0)
})

test('keeping the photo preserves server-owned internal URL instead of trusting submitted URL', async () => {
  const action = profileAction()
  const data = form('keep')
  data.set('avatarUrl', 'https://untrusted.test/replacement.jpg')
  await assert.rejects(action.updateProfileAction(data), /redirect:.*mensagem=/)
  assert.equal(action.calls.find(x => x[0] === 'update')[1].avatar_url, '/api/media/avatars/old.webp')
  assert.equal(action.calls.some(x => x[0] === 'upload'), false)
})

test('compresses before R2, scopes writes to current user and cleans failed upload', async () => {
  const action = profileAction({ saveError: { code: '23505' } })
  await assert.rejects(action.updateProfileAction(form('upload')), /redirect:.*erro=/)
  assert.deepEqual(action.calls.slice(0, 2), [['compress'], ['upload', 'avatars/owner']])
  assert.deepEqual(action.calls.find(x => x[0] === 'owner'), ['owner', 'id', 'owner'])
  assert.deepEqual(action.calls.at(-1), ['cleanup', '/api/media/avatars/owner/new.webp'])
})
