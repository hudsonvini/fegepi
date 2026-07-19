import Link from 'next/link'
import { LayoutDashboard, LogIn, Trophy, UserPlus, UserRound } from 'lucide-react'
import type { CurrentUser } from '@/lib/auth'
import { getProfileAvatar } from '@/lib/profile'
import styles from './ManagedNavbar.module.scss'

export default function ManagedNavbar({ user }: { user: CurrentUser | null }) {
  const avatar = user ? getProfileAvatar(user.avatarUrl, user.gender) : null

  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      <Link className={styles.logo} href="/"><img src="/images/logo.png" alt="FEGEPI" /></Link>
      <ul className={styles.links}>
        <li><Link href="/">Início</Link></li>
        <li><a href="#eventos">Eventos</a></li>
        <li><a href="#ranking"><Trophy size={14} /> Ranking</a></li>
        <li><a href="#galeria">Galeria</a></li>
      </ul>
      <div className={styles.access}>
        {user ? <>
          {user.role === 'admin' && <Link className={styles.dashboard} href="/admin"><LayoutDashboard size={16} /> <span>Dashboard</span></Link>}
          <Link className={styles.account} href="/perfil"><img src={avatar!} alt="" /><span><small>Minha conta</small>{user.fullName.split(' ')[0]}</span><UserRound size={16} /></Link>
        </> : <>
          <Link className={`${styles.button} ${styles.primary}`} href="/cadastro"><UserPlus size={16} /> Cadastro</Link>
          <Link className={styles.button} href="/login"><LogIn size={16} /> Login</Link>
        </>}
      </div>
    </nav>
  )
}
