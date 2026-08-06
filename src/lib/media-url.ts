const INTERNAL_MEDIA_PATH = '/api/media/'
const MANAGED_MEDIA_KEY = /^(?:banner|crest|featured|image|media)\/\d{4}\/[^/]+$/

function fallbackR2Key(value: string) {
  if (value.startsWith(INTERNAL_MEDIA_PATH)) return value.slice(INTERNAL_MEDIA_PATH.length)

  try {
    const url = new URL(value)
    const key = url.pathname.replace(/^\/+/, '')
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const isConfiguredSite = configuredSiteUrl
      ? url.origin === new URL(configuredSiteUrl).origin
      : false
    const isApplicationUrl = url.hostname.includes('seudominio.com')
      || url.hostname.endsWith('.vercel.app')
      || isConfiguredSite

    // Corrige URLs antigas gravadas com o domínio da aplicação no lugar do
    // domínio público do R2, sem transformar outros assets do site em mídia R2.
    return isApplicationUrl && MANAGED_MEDIA_KEY.test(key) ? key : null
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
