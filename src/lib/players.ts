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
  const [{ data: player }, { data: memberships }] = await Promise.all([
    supabase.from('player_directory').select('*').eq('id', id).maybeSingle(),
    supabase.from('player_team_memberships')
      .select('id,profile_id,role,started_at,ended_at,teams(id,name,initials,crest_url),games(id,name,short_name,image_url)')
      .eq('profile_id', id)
      .order('started_at', { ascending: false }),
  ])
  return {
    player: player as PublicPlayer | null,
    memberships: (memberships ?? []) as unknown as PublicMembership[],
  }
}

export async function getOwnMemberships(profileId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('player_team_memberships')
    .select('id,profile_id,role,started_at,ended_at,teams(id,name,initials,crest_url),games(id,name,short_name,image_url)')
    .eq('profile_id', profileId)
    .order('started_at', { ascending: false })
  return (data ?? []) as unknown as PublicMembership[]
}
