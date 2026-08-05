import { createClient } from './supabase/server'

export type PublicPlayer = {
  id: string
  full_name: string | null
  player_tag: string | null
  avatar_url: string | null
  gender: string | null
  favorite_game: string | null
  bio: string | null
  created_at: string | null
}

export type PublicMembership = {
  id: string
  profile_id: string
  role: 'player' | 'captain' | 'coach' | 'reserve'
  started_at: string
  ended_at: string | null
  teams: { id: string; name: string; initials: string; crest_url: string | null } | null
  games: { id: string; name: string; short_name: string; image_url: string } | null
}

type MembershipRow = Omit<PublicMembership, 'teams' | 'games'> & {
  team_id: string
  game_id: string
}

async function getHydratedMemberships(profileId: string) {
  const supabase = await createClient()
  const [
    { data: memberships },
    { data: teams },
    { data: games },
  ] = await Promise.all([
    supabase.from('player_team_memberships')
      .select('id,profile_id,team_id,game_id,role,started_at,ended_at')
      .eq('profile_id', profileId)
      .order('started_at', { ascending: false }),
    supabase.from('teams').select('id,name,initials,crest_url'),
    supabase.from('games').select('id,name,short_name,image_url'),
  ])

  return ((memberships ?? []) as MembershipRow[]).map((membership) => ({
    id: membership.id,
    profile_id: membership.profile_id,
    role: membership.role,
    started_at: membership.started_at,
    ended_at: membership.ended_at,
    teams: teams?.find((team) => team.id === membership.team_id) ?? null,
    games: games?.find((game) => game.id === membership.game_id) ?? null,
  })) as PublicMembership[]
}

export async function getPublicPlayers(query?: string) {
  const supabase = await createClient()
  let request = supabase.from('player_directory').select('*').order('full_name')
  const normalized = query?.trim()
  if (normalized) request = request.or(`full_name.ilike.%${normalized.replace(/[,%()]/g, '')}%,player_tag.ilike.%${normalized.replace(/[,%()]/g, '')}%`)
  const { data } = await request
  return (data ?? []) as PublicPlayer[]
}

export async function getPublicPlayer(id: string) {
  const supabase = await createClient()
  const [{ data: player }, memberships] = await Promise.all([
    supabase.from('player_directory').select('*').eq('id', id).maybeSingle(),
    getHydratedMemberships(id),
  ])
  return {
    player: player as PublicPlayer | null,
    memberships,
  }
}

export async function getOwnMemberships(profileId: string) {
  return getHydratedMemberships(profileId)
}
