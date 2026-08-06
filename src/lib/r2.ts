import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { mediaKeyFromFallbackUrl } from './media-url'

type R2Config = {
  accountId: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  publicUrl: string | null
}

const INTERNAL_MEDIA_PATH = '/api/media/'

function usablePublicUrl(value: string | undefined) {
  if (!value) return null

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    if (url.hostname.includes('seudominio.com')) return null
    // A URL da própria aplicação não expõe o bucket. Usá-la como CDN gera
    // links como /image/2026/arquivo.png, que são salvos com sucesso no banco,
    // mas retornam 404 no Next.js.
    if (url.hostname.endsWith('.vercel.app')) return null

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (siteUrl && url.origin === new URL(siteUrl).origin) return null

    return url.toString().replace(/\/$/, '')
  } catch {
    return null
  }
}

function getR2Config(): R2Config | null {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  const bucket = process.env.CLOUDFLARE_R2_BUCKET
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  const publicUrl = usablePublicUrl(process.env.CLOUDFLARE_R2_PUBLIC_URL)

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) return null
  return { accountId, bucket, accessKeyId, secretAccessKey, publicUrl }
}

export function hasR2Config() {
  return getR2Config() !== null
}

function getClient(config: R2Config) {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  })
}

function extensionFor(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (extension) return extension
  if (file.type === 'image/jpeg') return 'jpg'
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  if (file.type === 'video/mp4') return 'mp4'
  return 'bin'
}

function contentTypeFor(file: File) {
  if (file.type && file.type !== 'application/octet-stream') return file.type
  if (extensionFor(file) === 'gif') return 'image/gif'
  return 'application/octet-stream'
}

function mediaUrlFor(config: R2Config, key: string) {
  return config.publicUrl
    ? `${config.publicUrl}/${key}`
    : `${INTERNAL_MEDIA_PATH}${key}`
}

export async function uploadR2Media(file: File, folder = 'media') {
  const config = getR2Config()
  if (!config) throw new Error('Cloudflare R2 não foi configurado. Preencha as variáveis CLOUDFLARE_R2 no ambiente.')

  const key = `${folder}/${new Date().getFullYear()}/${crypto.randomUUID()}.${extensionFor(file)}`
  await getClient(config).send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: contentTypeFor(file),
    CacheControl: 'public, max-age=31536000, immutable',
  }))

  return mediaUrlFor(config, key)
}

export async function getR2Media(key: string, range?: string | null) {
  const config = getR2Config()
  if (!config) throw new Error('Cloudflare R2 não foi configurado.')

  return getClient(config).send(new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Range: range || undefined,
  }))
}

export async function deleteR2MediaByUrl(mediaUrl: string) {
  const config = getR2Config()
  if (!config) throw new Error('Cloudflare R2 não foi configurado.')

  const fallbackKey = mediaKeyFromFallbackUrl(mediaUrl)
  if (fallbackKey) {
    await getClient(config).send(new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: fallbackKey,
    }))
    return true
  }

  if (!config.publicUrl) return false

  let publicRoot: URL
  let media: URL
  try {
    publicRoot = new URL(`${config.publicUrl}/`)
    media = new URL(mediaUrl)
  } catch {
    return false
  }

  if (media.origin !== publicRoot.origin || !media.pathname.startsWith(publicRoot.pathname)) {
    return false
  }

  const key = decodeURIComponent(media.pathname.slice(publicRoot.pathname.length))
  if (!key) return false

  await getClient(config).send(new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: key,
  }))

  return true
}
