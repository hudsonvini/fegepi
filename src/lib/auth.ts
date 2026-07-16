import { cache } from 'react'
import { hasSupabaseConfig } from './supabase/config'
import { createClient } from './supabase/server'

export type CurrentUser = {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
  role: 'admin' | 'member'
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!hasSupabaseConfig()) return null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name || user.user_metadata.full_name || user.email?.split('@')[0] || 'Membro',
    avatarUrl: profile?.avatar_url ?? null,
    role: profile?.role === 'admin' ? 'admin' : 'member',
  }
})

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') throw new Error('Acesso restrito à administração.')
  return user
}
