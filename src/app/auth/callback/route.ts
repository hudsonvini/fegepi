import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseConfig } from '@/lib/supabase/config'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  const tokenType = type === 'email' || type === 'recovery' ? type : null
  const next = url.searchParams.get('next')
  const safeNext = tokenHash
    ? (tokenType === 'recovery' ? '/redefinir-senha' : '/perfil')
    : (next === '/redefinir-senha' ? next : '/perfil')
  const { url: supabaseUrl, key } = getSupabaseConfig()
  const response = NextResponse.redirect(new URL(safeNext, url.origin))
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')

  if (url.searchParams.has('error') || (tokenHash ? !tokenType : !code)) {
    const destination = safeNext === '/redefinir-senha'
      ? '/esqueci-a-senha?erro=O%20link%20de%20recuperação%20é%20inválido%20ou%20expirou.%20Solicite%20outro.'
      : '/confirmar-email?erro=Link%20inválido.%20Solicite%20outro.'
    response.headers.set('location', new URL(destination, url.origin).toString())
    return response
  }

  const supabase = createServerClient(supabaseUrl, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { error } = tokenHash && tokenType
    ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tokenType })
    : await supabase.auth.exchangeCodeForSession(code!)
  if (error) {
    console.error('[auth-email]', { operation: 'callback', code: error.code, status: error.status })
    const destination = safeNext === '/redefinir-senha'
      ? '/esqueci-a-senha?erro=O%20link%20de%20recuperação%20expirou%20ou%20já%20foi%20usado.%20Solicite%20outro.'
      : '/confirmar-email?erro=Link%20expirado%20ou%20inválido.%20Solicite%20outro.'
    response.headers.set('location', new URL(destination, url.origin).toString())
  }
  return response
}
