/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EventCarouselItem } from '@/components/EventsCarrossel/EventsCarrossel'
import type { EventGalleryBanner, EventGalleryPhoto } from '@/components/LatestEventGallery/LatestEventGallery'
import type { RankingGame } from '@/components/GameArea/GameArea'
import { hasSupabaseConfig } from './supabase/config'
import { createClient } from './supabase/server'

type ContentData = {
  games?: RankingGame[]
  events?: EventCarouselItem[]
  gallery?: { eyebrow: string; title: string; banner: EventGalleryBanner; photos: EventGalleryPhoto[] }
}

function formatDate(date: string, endDate?: string | null) {
  const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', timeZone: 'UTC' })
  const start = formatter.format(new Date(`${date}T00:00:00Z`))
  if (!endDate || endDate === date) return start
  return `${start} a ${formatter.format(new Date(`${endDate}T00:00:00Z`))}`
}

export async function getPublicContent(): Promise<ContentData> {
  if (!hasSupabaseConfig()) return {}
  try {
    const supabase = await createClient()
    const [gamesQuery, eventsQuery, settingsQuery, photosQuery] = await Promise.all([
      supabase.from('games').select('id, name, short_name, theme, image_url, ranking_seasons(id, label, is_current, ranking_entries(id, points, previous_position, teams(id, name, city, crest_url, initials)))').eq('active', true).order('display_order'),
      supabase.from('events').select('*').eq('active', true).order('display_order'),
      supabase.from('gallery_settings').select('*').maybeSingle(),
      supabase.from('gallery_photos').select('*').eq('active', true).order('display_order'),
    ])
    const games: RankingGame[] = (gamesQuery.data ?? []).map((game: any) => ({
      id: game.id, name: game.name, shortName: game.short_name, cardLabel: game.name, theme: game.theme, imageSrc: game.image_url,
      seasons: (game.ranking_seasons ?? []).sort((a: any, b: any) => Number(b.is_current) - Number(a.is_current)).map((season: any) => ({
        id: season.id, label: season.label,
        entries: (season.ranking_entries ?? []).map((entry: any) => ({ id: entry.id, teamName: entry.teams?.name ?? 'Time', country: entry.teams?.city ?? 'PiauÃ­', points: entry.points, previousPosition: entry.previous_position, logoText: entry.teams?.initials ?? 'TM', crestSrc: entry.teams?.crest_url ?? undefined, tone: 'navy' })),
      })),
    })).filter((game) => game.seasons.length > 0)
    const events: EventCarouselItem[] = (eventsQuery.data ?? []).map((event: any) => ({
      id: event.id, title: event.title, dateLabel: formatDate(event.starts_at, event.ends_at), subtitle: event.subtitle ?? undefined,
      statusLabel: event.status_label, statusTone: event.status_tone, imageSrc: event.image_url, imageAlt: `Imagem do evento ${event.title}`,
      featuredVideoSrc: event.featured_media_url?.endsWith('.mp4') ? event.featured_media_url : undefined,
      featuredImageSrc: event.featured_media_url && !event.featured_media_url.endsWith('.mp4') ? event.featured_media_url : undefined,
      featuredImageAlt: `Imagem em destaque do evento ${event.title}`, href: event.registration_url || '#', ctaLabel: event.cta_label,
    }))
    const settings = settingsQuery.data
    const gallery = settings?.banner_image_url ? {
      eyebrow: settings.eyebrow, title: settings.title,
      banner: { title: settings.banner_title, description: settings.banner_description, imageSrc: settings.banner_image_url, imageAlt: settings.banner_image_alt },
      photos: (photosQuery.data ?? []).map((photo: any) => ({ id: photo.id, src: photo.image_url, alt: photo.alt_text, downloadUrl: photo.download_url || photo.image_url })),
    } : undefined
    return { games: games.length ? games : undefined, events: events.length ? events : undefined, gallery }
  } catch { return {} }
}

