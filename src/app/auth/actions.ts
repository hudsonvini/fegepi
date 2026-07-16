'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const credentialsSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
})

function withMessage(path: string, message: string) {
  return `${path}?erro=${encodeURIComponent(message)}`
}

function withSuccess(path: string, message: string) {
  return `${path}?mensagem=${encodeURIComponent(message)}`
}

export async function signInAction(formData: FormData) {
  const parsed = credentialsSchema.safeParse({ email: formData.get('email'), password: formData.get('password') })
  if (!parsed.success) redirect(withMessage('/login', parsed.error.issues[0].message))

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) redirect(withMessage('/login', 'E-mail ou senha inválidos.'))
  redirect('/perfil')
}

export async function signUpAction(formData: FormData) {
  const parsed = credentialsSchema.extend({
    fullName: z.string().trim().min(2, 'Informe seu nome completo.'),
  }).safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) redirect(withMessage('/cadastro', parsed.error.issues[0].message))

  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/perfil`,
    },
  })
  if (error) redirect(withMessage('/cadastro', error.message))
  redirect('/login?mensagem=Confira seu e-mail para confirmar o cadastro.')
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = z.string().trim().email('Informe um e-mail válido.').safeParse(formData.get('email'))
  if (!email.success) redirect(withMessage('/esqueci-a-senha', email.error.issues[0].message))

  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
  })
  if (error) redirect(withMessage('/esqueci-a-senha', 'Não foi possível enviar o e-mail agora.'))
  redirect(withSuccess('/esqueci-a-senha', 'Se houver uma conta para este e-mail, enviamos um link seguro. Abra apenas o e-mail mais recente.'))
}

export async function updatePasswordAction(formData: FormData) {
  const password = z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.').safeParse(formData.get('password'))
  if (!password.success) redirect(withMessage('/redefinir-senha', password.error.issues[0].message))
  if (password.data !== formData.get('confirmPassword')) redirect(withMessage('/redefinir-senha', 'As senhas não coincidem.'))

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(withMessage('/esqueci-a-senha', 'Sua sessão de recuperação expirou. Solicite um novo link.'))

  const { error } = await supabase.auth.updateUser({ password: password.data })
  if (error) {
    const detail = error.message.toLowerCase()
    if (detail.includes('different')) redirect(withMessage('/redefinir-senha', 'Escolha uma senha diferente da senha anterior.'))
    if (detail.includes('session') || detail.includes('jwt') || detail.includes('expired')) {
      redirect(withMessage('/esqueci-a-senha', 'Sua sessão de recuperação expirou. Solicite um novo link.'))
    }
    redirect(withMessage('/redefinir-senha', 'Não foi possível atualizar a senha agora. Tente novamente.'))
  }
  redirect('/perfil?mensagem=Senha atualizada com sucesso.')
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
