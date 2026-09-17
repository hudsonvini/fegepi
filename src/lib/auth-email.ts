type AuthFailure = { code?: string; status?: number }

export function authEmailError(error: AuthFailure, operation: string) {
  // Never log addresses, passwords, tokens or provider response bodies.
  console.error('[auth-email]', { operation, code: error.code, status: error.status })
  if (error.code === 'over_email_send_rate_limit') {
    return 'O serviço atingiu o limite de envio de e-mails. Tente mais tarde. Se persistir, entre em contato com a FEGEPI.'
  }
  if (error.code === 'over_request_rate_limit' || error.status === 429) {
    return 'Muitas solicitações em pouco tempo. Aguarde antes de tentar novamente.'
  }
  if (error.code === 'email_address_not_authorized' || error.status === 500) {
    return 'O serviço de e-mail está indisponível. A equipe FEGEPI precisa verificar a configuração de envio.'
  }
  if (error.code === 'email_address_invalid') return 'Informe um e-mail válido.'
  if (error.code === 'weak_password') return 'Escolha uma senha mais forte, com letras, números e símbolos.'
  return 'Não foi possível concluir a solicitação. Tente novamente mais tarde.'
}

export function authSiteOrigin(configuredUrl: string | undefined, developmentOrigin: string | null, production: boolean) {
  const url = new URL(configuredUrl || (!production && developmentOrigin) || 'http://localhost:3000')
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      (production && (!configuredUrl || url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
    throw new Error('Configure NEXT_PUBLIC_SITE_URL com o domínio HTTPS público da aplicação.')
  }
  return url.origin
}
