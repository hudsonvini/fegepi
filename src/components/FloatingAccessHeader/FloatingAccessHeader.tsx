'use client'

import Link from 'next/link'
import { ArrowUpRight, LayoutDashboard, LogIn, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CurrentUser } from '@/lib/auth'
import { getProfileAvatar } from '@/lib/profile'
import styles from './FloatingAccessHeader.module.scss'

export default function FloatingAccessHeader({ user }: { user: CurrentUser | null }) {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    lastScrollY.current = window.scrollY

    function handleScroll() {
      if (frame.current !== null) return

      frame.current = window.requestAnimationFrame(() => {
        const currentScrollY = Math.max(0, window.scrollY)
        const movement = currentScrollY - lastScrollY.current

        if (currentScrollY <= 24) {
          setIsVisible(true)
        } else if (movement > 2) {
          setIsVisible(false)
        } else if (movement < -1) {
          setIsVisible(true)
        }

        lastScrollY.current = currentScrollY
        frame.current = null
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame.current !== null) window.cancelAnimationFrame(frame.current)
    }
  }, [])

  const avatar = user ? getProfileAvatar(user.avatarUrl, user.gender) : null
  const firstName = user?.fullName.trim().split(/\s+/)[0] || 'Perfil'

  return (
    <header className={`${styles.header} ${isVisible ? '' : styles.hidden}`}>
      <nav className={styles.pill} aria-label="Acesso à conta">
        <Link className={styles.logo} href="/" aria-label="Ir para o início">
          <img src="/images/logo fegepi.png" alt="FEGEPI" />
        </Link>

        <span className={styles.divider} aria-hidden="true" />

        {user ? (
          <>
            <Link className={styles.profile} href="/perfil">
              <img src={avatar!} alt="" />
              <span>{firstName}</span>
              <UserRound aria-hidden="true" />
            </Link>

            {user.role === 'admin' && (
              <Link className={styles.dashboard} href="/admin">
                <LayoutDashboard aria-hidden="true" />
                <span>Dashboard</span>
              </Link>
            )}
          </>
        ) : (
          <>
            <Link className={styles.login} href="/login">
              <span className={styles.iconCircle}><UserRound /></span>
              <span>Login</span>
            </Link>
            <Link className={styles.signup} href="/cadastro">
              <span>Cadastro</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
