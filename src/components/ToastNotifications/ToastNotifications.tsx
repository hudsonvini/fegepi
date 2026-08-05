'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'
import styles from './ToastNotifications.module.scss'

export type ToastDetail = {
  type: 'success' | 'error'
  message: string
}

export function notify(detail: ToastDetail) {
  window.dispatchEvent(new CustomEvent<ToastDetail>('fegepi:toast', { detail }))
}

export default function ToastNotifications() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlToast = useMemo<ToastDetail | null>(() => {
    const error = searchParams.get('erro')
    const success = searchParams.get('mensagem')
    if (error) return { type: 'error', message: error }
    if (success) return { type: 'success', message: success }
    return null
  }, [searchParams])
  const [eventToast, setEventToast] = useState<ToastDetail | null>(null)
  const toast = eventToast ?? urlToast

  const dismissUrlToast = () => {
    const next = new URLSearchParams(searchParams.toString())
    next.delete('erro')
    next.delete('mensagem')
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const dismiss = () => {
    if (eventToast) setEventToast(null)
    else if (urlToast) dismissUrlToast()
  }

  useEffect(() => {
    const receiveToast = (event: Event) => {
      setEventToast((event as CustomEvent<ToastDetail>).detail)
    }
    window.addEventListener('fegepi:toast', receiveToast)
    return () => window.removeEventListener('fegepi:toast', receiveToast)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => {
      if (eventToast) setEventToast(null)
      else dismissUrlToast()
    }, 4500)
    return () => window.clearTimeout(timeout)
    // A troca do nonce da notificação deve reiniciar o temporizador.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.message, toast?.type, eventToast])

  if (!toast) return null
  const Icon = toast.type === 'success' ? CheckCircle2 : CircleAlert

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`} role={toast.type === 'error' ? 'alert' : 'status'}>
      <span className={styles.icon}><Icon size={20} /></span>
      <div>
        <strong>{toast.type === 'success' ? 'Tudo certo' : 'Algo deu errado'}</strong>
        <p>{toast.message}</p>
      </div>
      <button type="button" onClick={dismiss} aria-label="Fechar notificação"><X size={17} /></button>
    </div>
  )
}
