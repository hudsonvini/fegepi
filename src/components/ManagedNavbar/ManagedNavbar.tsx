import Link from 'next/link'
import { LogIn, UserPlus, UserRound } from 'lucide-react'
import type { CurrentUser } from '@/lib/auth'
import styles from './ManagedNavbar.module.scss'

export default function ManagedNavbar({ user }: { user: CurrentUser | null }) {
  return <nav className={styles.nav} aria-label="Navegação principal"><Link className={styles.logo} href="/"><img src="/images/logo.png" alt="FEGEPI" /></Link><ul className={styles.links}><li><Link href="/">Home</Link></li><li><a href="#eventos">Eventos</a></li><li><a href="#ranking">Ranking</a></li><li><a href="#galeria">Galeria</a></li></ul><div className={styles.access}>{user ? <Link className={`${styles.button} ${styles.primary}`} href="/perfil"><UserRound size={16} /> {user.fullName.split(' ')[0]}</Link> : <><Link className={`${styles.button} ${styles.primary}`} href="/cadastro"><UserPlus size={16} /> Cadastro</Link><Link className={styles.button} href="/login"><LogIn size={16} /> Login</Link></>}</div></nav>
}
