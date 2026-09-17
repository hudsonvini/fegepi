'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { profileGenders } from '@/lib/profile'
import { compressAvatar } from '@/lib/avatar-image'
import { deleteR2MediaByUrl, uploadR2Media } from '@/lib/r2'

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const fullName = z.string().trim().min(2, 'Informe seu nome completo.').max(90, 'Use no máximo 90 caracteres no nome.').safeParse(formData.get('fullName'))
  if (!fullName.success) redirect(`/perfil?erro=${encodeURIComponent(fullName.error.issues[0].message)}`)
  const avatarMode = z.enum(['keep', 'upload', 'default']).safeParse(formData.get('avatarMode') ?? 'keep')
  if (!avatarMode.success) redirect('/perfil?erro=Escolha%20uma%20foto%20válida.')
  const address = z.string().trim().max(180, 'Use no máximo 180 caracteres no endereço.').safeParse(formData.get('address'))
  const favoriteGame = z.string().trim().max(70, 'Use no máximo 70 caracteres no jogo favorito.').safeParse(formData.get('favoriteGame'))
  const playerTag = z.string().trim().max(30, 'Use no máximo 30 caracteres no nick.').regex(/^[a-zA-Z0-9_.-]*$/, 'Use apenas letras, números, ponto, hífen ou underline no nick.').safeParse(formData.get('playerTag'))
  const bio = z.string().trim().max(280, 'Use no máximo 280 caracteres na bio.').safeParse(formData.get('bio'))
  const whatsapp = z.string().trim().regex(/^[0-9+() .-]{0,24}$/, 'Informe um WhatsApp válido.').safeParse(formData.get('whatsapp'))
  const gender = z.enum(profileGenders).safeParse(formData.get('gender'))
  if (!address.success || !favoriteGame.success || !playerTag.success || !bio.success || !whatsapp.success || !gender.success) {
    const issue = address.error?.issues[0] ?? favoriteGame.error?.issues[0] ?? playerTag.error?.issues[0] ?? bio.error?.issues[0] ?? whatsapp.error?.issues[0] ?? gender.error?.issues[0]
    redirect(`/perfil?erro=${encodeURIComponent(issue?.message ?? 'Verifique as informações do perfil.')}`)
  }

  const supabase = await createClient()
  let avatarUrl = avatarMode.data === 'default' ? null : user.avatarUrl
  let uploadedUrl: string | null = null
  if (avatarMode.data === 'upload') {
    const file = formData.get('avatarFile')
    if (!(file instanceof File)) redirect('/perfil?erro=Selecione%20uma%20foto.')
    let compressed: File
    try {
      compressed = await compressAvatar(file)
    } catch (error) {
      redirect(`/perfil?erro=${encodeURIComponent(error instanceof Error ? error.message : 'Foto inválida.')}`)
    }
    try {
      uploadedUrl = await uploadR2Media(compressed, `avatars/${user.id}`)
      avatarUrl = uploadedUrl
    } catch {
      redirect('/perfil?erro=Não%20foi%20possível%20enviar%20a%20foto.%20Tente%20novamente.')
    }
  }
  const { data: saved, error } = await supabase.from('profiles').update({
    full_name: fullName.data,
    avatar_url: avatarUrl,
    address: address.data || null,
    whatsapp: whatsapp.data || null,
    gender: gender.data,
    favorite_game: favoriteGame.data || null,
    player_tag: playerTag.data || null,
    bio: bio.data || null,
    public_profile: formData.get('publicProfile') === 'on',
  }).eq('id', user.id).select('id').maybeSingle()
  if (error || !saved) {
    if (uploadedUrl) {
      try { await deleteR2MediaByUrl(uploadedUrl) } catch { console.error('[profile-avatar] Failed upload cleanup') }
    }
    redirect('/perfil?erro=Não%20foi%20possível%20salvar%20o%20perfil.%20Confira%20se%20o%20nick%20já%20está%20em%20uso.')
  }
  revalidatePath('/', 'layout')
  redirect('/perfil?mensagem=Perfil%20atualizado%20com%20sucesso.')
}
