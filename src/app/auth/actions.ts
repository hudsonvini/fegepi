'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { authEmailError, authSiteOrigin } from '@/lib/auth-email'

async function emailCallback(path: string, next: '/perfil' | '/redefinir-senha') {
  let origin: string
  try {
    origin = authSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL, (await headers()).get('origin'), process.env.NODE_ENV === 'production')
  } catch {
    console.error('[auth-email]', { operation: 'configuration', code: 'invalid_site_url' })
    redirect(withMessage(path, 'O acesso por e-mail está temporariamente indisponível. A equipe FEGEPI precisa revisar a configuração do site.'))
  }
  return `${origin}/auth/callback?next=${next}`
}

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
  if (error?.code === 'email_not_confirmed') redirect(withMessage('/confirmar-email', 'Confirme seu e-mail para entrar. Você pode solicitar outro link abaixo.'))
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

  const emailRedirectTo = await emailCallback('/cadastro', '/perfil')
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo,
    },
  })
  if (error) redirect(withMessage('/cadastro', authEmailError(error, 'signup')))
  if (data.session) redirect('/perfil')
  redirect(withSuccess('/confirmar-email', 'Solicitação recebida. Se o cadastro precisar de confirmação, você receberá um link por e-mail. Confira também o spam.'))
}

export async function resendConfirmationAction(formData: FormData) {
  const email = z.string().trim().email('Informe um e-mail válido.').safeParse(formData.get('email'))
  if (!email.success) redirect(withMessage('/confirmar-email', email.error.issues[0].message))
  const emailRedirectTo = await emailCallback('/confirmar-email', '/perfil')
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email: email.data, options: { emailRedirectTo } })
  if (error) redirect(withMessage('/confirmar-email', authEmailError(error, 'resend')))
  redirect(withSuccess('/confirmar-email', 'Se houver um cadastro aguardando confirmação, você receberá um novo link. Confira também o spam e use o e-mail mais recente.'))
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = z.string().trim().email('Informe um e-mail válido.').safeParse(formData.get('email'))
  if (!email.success) redirect(withMessage('/esqueci-a-senha', email.error.issues[0].message))

  const redirectTo = await emailCallback('/esqueci-a-senha', '/redefinir-senha')
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo,
  })
  if (error) redirect(withMessage('/esqueci-a-senha', authEmailError(error, 'recovery')))
  redirect(withSuccess('/esqueci-a-senha', 'Se houver uma conta para este e-mail, você receberá um link seguro. Confira também o spam e abra apenas o e-mail mais recente.'))
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
