'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { profileGenders } from '@/lib/profile'

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const fullName = z.string().trim().min(2, 'Informe seu nome completo.').max(90, 'Use no máximo 90 caracteres no nome.').safeParse(formData.get('fullName'))
  if (!fullName.success) redirect(`/perfil?erro=${encodeURIComponent(fullName.error.issues[0].message)}`)
  const avatarUrl = z.string().trim().url().or(z.literal('')).safeParse(formData.get('avatarUrl'))
  if (!avatarUrl.success) redirect('/perfil?erro=Informe%20uma%20URL%20de%20foto%20válida.')
  const address = z.string().trim().max(180, 'Use no máximo 180 caracteres no endereço.').safeParse(formData.get('address'))
  const team = z.string().trim().max(70, 'Use no máximo 70 caracteres no time.').safeParse(formData.get('team'))
  const favoriteGame = z.string().trim().max(70, 'Use no máximo 70 caracteres no jogo favorito.').safeParse(formData.get('favoriteGame'))
  const whatsapp = z.string().trim().regex(/^[0-9+() .-]{0,24}$/, 'Informe um WhatsApp válido.').safeParse(formData.get('whatsapp'))
  const gender = z.enum(profileGenders).safeParse(formData.get('gender'))
  if (!address.success || !team.success || !favoriteGame.success || !whatsapp.success || !gender.success) {
    const issue = address.error?.issues[0] ?? team.error?.issues[0] ?? favoriteGame.error?.issues[0] ?? whatsapp.error?.issues[0] ?? gender.error?.issues[0]
    redirect(`/perfil?erro=${encodeURIComponent(issue?.message ?? 'Verifique as informações do perfil.')}`)
  }

  const supabase = await createClient()
  const { data: selectedTeam } = team.data
    ? await supabase.from('teams').select('id').eq('name', team.data).maybeSingle()
    : { data: null }
  const { error } = await supabase.from('profiles').update({
    full_name: fullName.data,
    avatar_url: avatarUrl.data || null,
    address: address.data || null,
    team: team.data || null,
    team_id: selectedTeam?.id ?? null,
    whatsapp: whatsapp.data || null,
    gender: gender.data,
    favorite_game: favoriteGame.data || null,
  }).eq('id', user.id)
  if (error) redirect('/perfil?erro=Não%20foi%20possível%20salvar%20o%20perfil.')
  revalidatePath('/', 'layout')
  redirect('/perfil?mensagem=Perfil%20atualizado%20com%20sucesso.')
}
