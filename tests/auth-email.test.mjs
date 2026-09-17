import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
import vm from 'node:vm'

function load(file, dependencies = {}) {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } })
  const exports = {}
  vm.runInNewContext(outputText, { exports, URL, console: { error() {} }, require(name) {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`)
    return dependencies[name]
  } })
  return exports
}

test('production links require a configured public HTTPS origin', () => {
  const { authSiteOrigin } = load('src/lib/auth-email.ts')
  for (const invalid of [undefined, 'http://localhost:3000', 'https://localhost', 'http://fegepi.test', 'https://user:pass@fegepi.test', 'invalid']) {
    assert.throws(() => authSiteOrigin(invalid, 'https://untrusted.test', true))
  }
  assert.equal(authSiteOrigin('https://fegepi.test/', 'https://untrusted.test', true), 'https://fegepi.test')
  assert.equal(authSiteOrigin(undefined, 'http://localhost:3001', false), 'http://localhost:3001')
})

function callback(authError = null) {
  const calls = []
  const { GET } = load('src/app/auth/callback/route.ts', {
    'next/server': { NextResponse: { redirect(url) {
      const response = new Response(null, { status: 307, headers: { location: url.toString() } })
      response.cookies = { set(name, value) { response.headers.append('set-cookie', `${name}=${value}`) } }
      return response
    } } },
    '@/lib/supabase/config': { getSupabaseConfig: () => ({ url: 'https://project.supabase.co', key: 'test' }) },
    '@supabase/ssr': { createServerClient(url, key, { cookies }) {
      return { auth: Object.fromEntries(['verifyOtp', 'exchangeCodeForSession'].map(method => [method, async value => {
        calls.push({ method, value })
        cookies.setAll([{ name: 'session', value: 'test-session', options: {} }])
        return { error: authError }
      }])) }
    } },
  })
  return { calls, get: query => GET({ url: `https://fegepi.test/auth/callback?${query}`, cookies: { getAll: () => [] } }) }
}

test('recovery token works without initiating browser cookies and ignores external redirects', async () => {
  const { get, calls } = callback()
  const response = await get('token_hash=test&type=recovery&next=https://evil.test')
  assert.equal(response.headers.get('location'), 'https://fegepi.test/redefinir-senha')
  assert.equal(calls[0].method, 'verifyOtp')
  assert.equal(calls[0].value.type, 'recovery')
  assert.match(response.headers.get('set-cookie'), /session=test-session/)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer')
})

test('confirmation token cannot choose password reset destination', async () => {
  const { get } = callback()
  assert.equal((await get('token_hash=test&type=email&next=/redefinir-senha')).headers.get('location'), 'https://fegepi.test/perfil')
})

test('missing, unsupported and provider-error links never verify a session', async () => {
  const { get, calls } = callback()
  for (const query of ['', 'token_hash=test&type=invite', 'code=test&error=access_denied']) {
    assert.match((await get(query)).headers.get('location'), /confirmar-email\?erro=/)
  }
  assert.equal(calls.length, 0)
})

test('expired recovery returns to recovery request and preserves cookie updates', async () => {
  const { get } = callback({ code: 'otp_expired', status: 403 })
  const response = await get('token_hash=test&type=recovery')
  assert.match(response.headers.get('location'), /esqueci-a-senha\?erro=/)
  assert.match(response.headers.get('set-cookie'), /session=/)
})

test('existing PKCE links remain supported with safe destinations', async () => {
  const { get, calls } = callback()
  assert.equal((await get('code=legacy&next=//evil.test')).headers.get('location'), 'https://fegepi.test/perfil')
  assert.equal(calls[0].method, 'exchangeCodeForSession')
  assert.equal((await get('code=legacy&next=/redefinir-senha')).headers.get('location'), 'https://fegepi.test/redefinir-senha')
})
