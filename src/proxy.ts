import { NextResponse, type NextRequest } from 'next/server'
import { hasSupabaseConfig } from '@/lib/supabase/config'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  if (!hasSupabaseConfig()) return NextResponse.next({ request })
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
}

