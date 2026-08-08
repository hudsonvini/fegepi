'use client'

import Link from 'next/link'
import { CalendarDays, House, Trophy, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import styles from './FloatingDock.module.scss'

const navigationItems = [
  { id: 'inicio', label: 'Home', href: '#inicio', icon: House },
  { id: 'eventos', label: 'Eventos', href: '#eventos', icon: CalendarDays },
  { id: 'jogadores', label: 'Jogadores', href: '#jogadores', icon: UsersRound },
  { id: 'ranking', label: 'Ranking', href: '#ranking', icon: Trophy },
]

export default function FloatingDock({ accountHref }: { accountHref: string }) {
  const [activeSection, setActiveSection] = useState('inicio')

  useEffect(() => {
    const sections = navigationItems
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section))

    if (!sections.length || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visibleEntry) setActiveSection(visibleEntry.target.id)
      },
      { rootMargin: '-18% 0px -58% 0px', threshold: [0, 0.12, 0.3] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <nav className={styles.dock} aria-label="Navegação principal">
      <Link className={styles.brandButton} href={accountHref} aria-label="Acessar minha área">
        <span aria-hidden="true">★</span>
      </Link>

      <ul className={styles.links}>
        {navigationItems.map(({ id, label, href, icon: Icon }) => {
          const isActive = activeSection === id

          return (
            <li key={id}>
              <Link
                className={`${styles.link} ${isActive ? styles.active : ''}`}
                href={href}
                aria-current={isActive ? 'location' : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
