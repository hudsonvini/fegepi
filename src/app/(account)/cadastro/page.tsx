import Link from 'next/link'
import { signUpAction } from '@/app/auth/actions'
import styles from '../account.module.scss'

export default async function CadastroPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams
  return <><h1 className={styles.title}>Criar conta</h1><p className={styles.intro}>Participe da comunidade da Federação de Games e E-Sports do Piauí.</p>{erro && <p className={`${styles.notice} ${styles.error}`}>{erro}</p>}<form className={styles.form} action={signUpAction}><label className={styles.field}>Nome completo<input required name="fullName" autoComplete="name" /></label><label className={styles.field}>E-mail<input required name="email" type="email" autoComplete="email" /></label><label className={styles.field}>Senha<input required name="password" type="password" minLength={8} autoComplete="new-password" /></label><button className={styles.submit}>Criar conta</button></form><div className={styles.links}><p>Já possui uma conta? <Link href="/login">Entrar</Link></p></div></>
}
