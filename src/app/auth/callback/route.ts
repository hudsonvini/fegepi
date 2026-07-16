import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseConfig } from '@/lib/supabase/config'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next')
  const safeNext = next === '/perfil' || next === '/redefinir-senha' ? next : '/perfil'
  const { url: supabaseUrl, key } = getSupabaseConfig()
  let response = NextResponse.redirect(new URL(safeNext, url.origin))

  if (!code) return NextResponse.redirect(new URL('/login?erro=Link%20inválido.', url.origin))

  const supabase = createServerClient(supabaseUrl, key, {
    cookies: {
      getAll: () => request.headers.get('cookie')?.split('; ').map((value) => {
        const [name, ...rest] = value.split('=')
        return { name, value: rest.join('=') }
      }) ?? [],
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    const destination = safeNext === '/redefinir-senha'
      ? '/esqueci-a-senha?erro=O%20link%20de%20recuperação%20expirou%20ou%20já%20foi%20usado.%20Solicite%20outro.'
      : '/login?erro=Link%20expirado%20ou%20inválido.'
    response = NextResponse.redirect(new URL(destination, url.origin))
  }
  return response
}
