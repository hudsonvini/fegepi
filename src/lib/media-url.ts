const INTERNAL_MEDIA_PATH = '/api/media/'

function fallbackR2Key(value: string) {
  if (value.startsWith(INTERNAL_MEDIA_PATH)) return value.slice(INTERNAL_MEDIA_PATH.length)

  try {
    const url = new URL(value)
    if (!url.hostname.includes('seudominio.com')) return null
    return url.pathname.replace(/^\/+/, '')
  } catch {
    return null
  }
}

export function mediaKeyFromFallbackUrl(value: string) {
  const encodedKey = fallbackR2Key(value)
  if (!encodedKey) return null

  try {
    const key = decodeURIComponent(encodedKey)
    if (!key || key.split('/').some((part) => !part || part === '.' || part === '..')) return null
    return key
  } catch {
    return null
  }
}

export function displayMediaUrl(value: string | null | undefined) {
  if (!value) return value
  const key = mediaKeyFromFallbackUrl(value)
  return key ? `${INTERNAL_MEDIA_PATH}${key}` : value
}
