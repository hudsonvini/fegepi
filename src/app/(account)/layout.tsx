import Link from 'next/link'
import styles from './account.module.scss'

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className={styles.page}><section className={styles.card}><Link className={styles.brand} href="/"><img src="/images/logo.png" alt="FEGEPI" /></Link>{children}</section></main>
}
