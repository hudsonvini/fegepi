import { createClient } from './supabase/server'
import type {
  AdminData,
  Event,
  GalleryPhoto,
  GallerySettings,
  Game,
  HeroSlide,
  Profile,
  RankingEntry,
  Season,
  Team,
  TeamGame,
  PlayerTeamMembership,
} from '@/components/AdminDashboard/types'

export async function getAdminData(selectedSeasonId?: string, selectedGameId?: string): Promise<AdminData> {
  const supabase = await createClient()
  const [
    { data: heroSlides },
    { data: games },
    { data: seasons },
    { data: teams },
    { data: entriesWithRecentForm, error: entriesWithRecentFormError },
    { data: events },
    { data: photos },
    { data: gallerySettings },
    { data: profiles },
    { data: teamGames },
    { data: memberships },
  ] = await Promise.all([
    supabase.from('hero_slides').select('id,image_url,alt_text,link_url,active,display_order').order('display_order'),
    supabase.from('games').select('id,name,short_name,theme,image_url,active,display_order').order('display_order'),
    supabase.from('ranking_seasons').select('id,label,is_current,game_id,games(name)').order('created_at', { ascending: false }),
    supabase.from('teams').select('id,name,city,crest_url,initials').order('name'),
    supabase.from('ranking_entries').select('id,season_id,team_id,points,wins,draws,losses,recent_form,previous_position,teams(id,name,city,crest_url,initials)'),
    supabase.from('events').select('id,title,starts_at,ends_at,subtitle,status_label,status_tone,active,image_url,featured_media_url,registration_url,cta_label,display_order').order('display_order'),
    supabase.from('gallery_photos').select('id,alt_text,active,image_url,download_url,display_order').order('display_order'),
    supabase.from('gallery_settings').select('*').maybeSingle(),
    supabase.from('profiles').select('id,full_name,email,avatar_url,team,team_id,role,gender,whatsapp,address,favorite_game,player_tag,bio,public_profile,is_featured,featured_order,created_at').order('created_at', { ascending: false }),
    supabase.from('team_games').select('team_id,game_id,active,created_at'),
    supabase.from('player_team_memberships').select('id,profile_id,team_id,game_id,role,started_at,ended_at,created_at').order('started_at', { ascending: false }),
  ])

  const entries = entriesWithRecentFormError
    ? (await supabase.from('ranking_entries').select('id,season_id,team_id,points,wins,draws,losses,previous_position,teams(id,name,city,crest_url,initials)')).data
    : entriesWithRecentForm
  const allGames = (games ?? []) as Game[]
  const allSeasons = (seasons ?? []) as unknown as Season[]
  const allEntries = (entries ?? []) as unknown as RankingEntry[]
  const seasonFromParam = allSeasons.find((season) => season.id === selectedSeasonId)
  const selectedGame = selectedGameId === 'all'
    ? undefined
    : allGames.find((game) => game.id === selectedGameId)
      ?? allGames.find((game) => game.id === seasonFromParam?.game_id)
      ?? allGames.find((game) => game.active)
      ?? allGames[0]
  const gameSeasons = selectedGame
    ? allSeasons.filter((season) => season.game_id === selectedGame.id)
    : allSeasons
  const selectedSeason = gameSeasons.find((season) => season.id === selectedSeasonId)
    ?? gameSeasons.find((season) => season.is_current)
    ?? gameSeasons[0]
  const seasonEntries = selectedSeason
    ? allEntries
      .filter((entry) => entry.season_id === selectedSeason.id)
      .sort((a, b) => b.points - a.points || b.wins - a.wins || (a.teams?.name ?? '').localeCompare(b.teams?.name ?? ''))
    : []

  const allTeams = (teams ?? []) as Team[]
  const allProfiles = (profiles ?? []) as Profile[]
  const hydratedMemberships = (memberships ?? []).map((membership) => ({
    ...membership,
    profiles: allProfiles.find((profile) => profile.id === membership.profile_id) ?? null,
    teams: allTeams.find((team) => team.id === membership.team_id) ?? null,
    games: allGames.find((game) => game.id === membership.game_id) ?? null,
  })) as unknown as PlayerTeamMembership[]

  return {
    heroSlides: (heroSlides ?? []) as HeroSlide[],
    games: allGames,
    seasons: allSeasons,
    teams: allTeams,
    entries: allEntries,
    events: (events ?? []) as Event[],
    photos: (photos ?? []) as GalleryPhoto[],
    gallerySettings: (gallerySettings as GallerySettings | null) ?? null,
    profiles: allProfiles,
    teamGames: (teamGames ?? []) as TeamGame[],
    memberships: hydratedMemberships,
    selectedGame,
    selectedSeason,
    seasonEntries,
  }
}
