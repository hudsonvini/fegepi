'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const fullName = z.string().trim().min(2, 'Informe seu nome completo.').safeParse(formData.get('fullName'))
  if (!fullName.success) redirect(`/perfil?erro=${encodeURIComponent(fullName.error.issues[0].message)}`)
  const avatarUrl = z.string().trim().url().or(z.literal('')).safeParse(formData.get('avatarUrl'))
  if (!avatarUrl.success) redirect('/perfil?erro=Informe%20uma%20URL%20de%20foto%20válida.')

  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ full_name: fullName.data, avatar_url: avatarUrl.data || null }).eq('id', user.id)
  if (error) redirect('/perfil?erro=Não%20foi%20possível%20salvar%20o%20perfil.')
  revalidatePath('/', 'layout')
  redirect('/perfil?mensagem=Perfil%20atualizado%20com%20sucesso.')
}
