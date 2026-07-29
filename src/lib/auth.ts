import { cache } from 'react'
import { hasSupabaseConfig } from './supabase/config'
import { createClient } from './supabase/server'

export type CurrentUser = {
  id: string
  email: string
  profileEmail: string | null
  fullName: string
  avatarUrl: string | null
  address: string | null
  team: string | null
  teamId: string | null
  whatsapp: string | null
  gender: string | null
  favoriteGame: string | null
  playerTag: string | null
  bio: string | null
  publicProfile: boolean
  createdAt: string | null
  role: 'admin' | 'member'
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!hasSupabaseConfig()) return null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url, address, team, team_id, whatsapp, gender, favorite_game, player_tag, bio, public_profile, created_at, role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email ?? '',
    profileEmail: profile?.email ?? user.email ?? null,
    fullName: profile?.full_name || user.user_metadata.full_name || user.email?.split('@')[0] || 'Membro',
    avatarUrl: profile?.avatar_url ?? null,
    address: profile?.address ?? null,
    team: profile?.team ?? null,
    teamId: profile?.team_id ?? null,
    whatsapp: profile?.whatsapp ?? null,
    gender: profile?.gender ?? null,
    favoriteGame: profile?.favorite_game ?? null,
    playerTag: profile?.player_tag ?? null,
    bio: profile?.bio ?? null,
    publicProfile: profile?.public_profile ?? true,
    createdAt: profile?.created_at ?? null,
    role: profile?.role === 'admin' ? 'admin' : 'member',
  }
})

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') throw new Error('Acesso restrito à administração.')
  return user
}
