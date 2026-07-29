import { getR2Media } from '@/lib/r2'

export const runtime = 'nodejs'

function safeKey(parts: string[]) {
  if (parts.length === 0 || parts.some((part) => !part || part === '.' || part === '..')) return null
  return parts.join('/')
}

export async function GET(
  request: Request,
  context: RouteContext<'/api/media/[...key]'>,
) {
  const { key: parts } = await context.params
  const key = safeKey(parts)
  if (!key) return new Response('Arquivo não encontrado.', { status: 404 })

  try {
    const object = await getR2Media(key, request.headers.get('range'))
    if (!object.Body) return new Response('Arquivo não encontrado.', { status: 404 })

    const headers = new Headers({
      'Accept-Ranges': object.AcceptRanges ?? 'bytes',
      'Cache-Control': object.CacheControl ?? 'public, max-age=31536000, immutable',
      'Content-Type': object.ContentType ?? 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    })

    if (object.ContentLength !== undefined) headers.set('Content-Length', String(object.ContentLength))
    if (object.ContentRange) headers.set('Content-Range', object.ContentRange)
    if (object.ETag) headers.set('ETag', object.ETag)
    if (object.LastModified) headers.set('Last-Modified', object.LastModified.toUTCString())

    return new Response(object.Body.transformToWebStream(), {
      status: object.ContentRange ? 206 : 200,
      headers,
    })
  } catch (error) {
    const status = typeof error === 'object' && error && '$metadata' in error
      ? (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
      : undefined

    if (status === 404) return new Response('Arquivo não encontrado.', { status: 404 })
    console.error('Falha ao ler mídia do R2.', error)
    return new Response('Não foi possível carregar o arquivo.', { status: 500 })
  }
}
