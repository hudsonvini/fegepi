/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EventCarouselItem } from '@/components/EventsCarrossel/EventsCarrossel'
import type { EventGalleryAlbum, EventGalleryPhoto } from '@/components/LatestEventGallery/LatestEventGallery'
import type { RankingGame } from '@/components/GameArea/GameArea'
import type { HeroCarouselSlide } from '@/components/Carrossel/Carrossel'
import { displayMediaUrl } from './media-url'
import { hasSupabaseConfig } from './supabase/config'
import { createClient } from './supabase/server'

type ContentData = {
  heroSlides?: HeroCarouselSlide[]
  games?: RankingGame[]
  events?: EventCarouselItem[]
  gallery?: { eyebrow: string; title: string; albums: EventGalleryAlbum[] }
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
    const [heroQuery, gamesWithRecentFormQuery, eventsQuery, galleryEventsQuery, settingsQuery, photosQuery] = await Promise.all([
      supabase.from('hero_slides').select('id, image_url, alt_text, link_url').eq('active', true).order('display_order'),
      supabase.from('games').select('id, name, short_name, theme, image_url, ranking_seasons(id, label, is_current, ranking_entries(id, points, wins, draws, losses, recent_form, previous_position, teams(id, name, city, crest_url, initials)))').eq('active', true).order('display_order'),
      supabase.from('events').select('*').eq('active', true).order('display_order'),
      supabase.from('events').select('*').order('starts_at', { ascending: false }),
      supabase.from('gallery_settings').select('*').maybeSingle(),
      supabase.from('gallery_photos').select('*').eq('active', true).order('display_order'),
    ])
    const gamesQuery = gamesWithRecentFormQuery.error
      ? await supabase.from('games').select('id, name, short_name, theme, image_url, ranking_seasons(id, label, is_current, ranking_entries(id, points, wins, draws, losses, previous_position, teams(id, name, city, crest_url, initials)))').eq('active', true).order('display_order')
      : gamesWithRecentFormQuery
    const heroSlides: HeroCarouselSlide[] = (heroQuery.data ?? []).map((slide: any) => ({
      id: slide.id,
      imageSrc: displayMediaUrl(slide.image_url) as string,
      imageAlt: slide.alt_text,
      href: slide.link_url || undefined,
    }))
    const games: RankingGame[] = (gamesQuery.data ?? []).map((game: any) => ({
      id: game.id, name: game.name, shortName: game.short_name, cardLabel: game.name, theme: game.theme, imageSrc: displayMediaUrl(game.image_url) as string,
      seasons: (game.ranking_seasons ?? []).sort((a: any, b: any) => Number(b.is_current) - Number(a.is_current)).map((season: any) => ({
        id: season.id, label: season.label,
        entries: (season.ranking_entries ?? []).map((entry: any) => ({
          id: entry.id,
          teamName: entry.teams?.name ?? 'Time',
          country: entry.teams?.city ?? 'Piauí',
          points: entry.points,
          wins: entry.wins,
          draws: entry.draws,
          losses: entry.losses,
          recentForm: (entry.recent_form ?? []).map((result: string) => ({
            W: 'win',
            D: 'draw',
            L: 'loss',
          }[result])).filter(Boolean),
          previousPosition: entry.previous_position,
          logoText: entry.teams?.initials ?? 'TM',
          crestSrc: displayMediaUrl(entry.teams?.crest_url) ?? undefined,
          tone: 'navy',
        })),
      })),
    })).filter((game) => game.seasons.length > 0)
    const events: EventCarouselItem[] = (eventsQuery.data ?? []).map((event: any) => ({
      id: event.id, title: event.title, startsAt: event.starts_at, dateLabel: formatDate(event.starts_at, event.ends_at), subtitle: event.subtitle ?? undefined,
      statusLabel: event.status_label, statusTone: event.status_tone, imageSrc: displayMediaUrl(event.image_url) as string, imageAlt: `Imagem do evento ${event.title}`,
      featuredVideoSrc: event.featured_media_url?.endsWith('.mp4') ? displayMediaUrl(event.featured_media_url) ?? undefined : undefined,
      featuredImageSrc: event.featured_media_url && !event.featured_media_url.endsWith('.mp4') ? displayMediaUrl(event.featured_media_url) ?? undefined : undefined,
      featuredImageAlt: `Imagem em destaque do evento ${event.title}`, href: event.registration_url || '#', ctaLabel: event.cta_label,
    }))
    const settings = settingsQuery.data
    const galleryPhotos: EventGalleryPhoto[] = (photosQuery.data ?? []).map((photo: any) => ({
      id: photo.id,
      src: displayMediaUrl(photo.image_url) as string,
      alt: photo.alt_text,
      downloadUrl: displayMediaUrl(photo.download_url || photo.image_url) as string,
    }))
    const todayInSaoPaulo = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
    const recentGalleryEvents = [...(galleryEventsQuery.data ?? [])]
      .filter((event: any) => String(event.ends_at || event.starts_at) < todayInSaoPaulo)
      .sort((first: any, second: any) => String(second.starts_at).localeCompare(String(first.starts_at)))
      .slice(0, 3)
    const albums: EventGalleryAlbum[] = recentGalleryEvents.map((event: any) => ({
      id: event.id,
      eventDate: event.starts_at,
      banner: {
        title: event.title,
        description: event.subtitle || `Confira os registros e os melhores momentos de ${event.title}.`,
        imageSrc: displayMediaUrl(event.featured_media_url && !String(event.featured_media_url).endsWith('.mp4') ? event.featured_media_url : event.image_url) as string,
        imageAlt: `Fotos do evento ${event.title}`,
      },
      photos: galleryPhotos,
      driveUrl: settings?.drive_url || undefined,
    }))
    const albumsWithLegacy = albums.length ? albums : settings?.banner_image_url ? [{
      id: 'legacy-gallery',
      banner: { title: settings.banner_title, description: settings.banner_description, imageSrc: displayMediaUrl(settings.banner_image_url) as string, imageAlt: settings.banner_image_alt },
      photos: galleryPhotos,
      driveUrl: settings.drive_url || undefined,
    }] : []
    const gallery = albumsWithLegacy.length ? {
      eyebrow: settings?.eyebrow || 'Memórias da comunidade',
      title: settings?.title || 'Fotos dos eventos',
      albums: albumsWithLegacy,
    } : undefined
    return {
      heroSlides: heroSlides.length ? heroSlides : undefined,
      games: games.length ? games : undefined,
      events: events.length ? events : undefined,
      gallery,
    }
  } catch { return {} }
}
