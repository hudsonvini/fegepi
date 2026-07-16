import Link from 'next/link'
import { signInAction } from '@/app/auth/actions'
import styles from '../account.module.scss'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string; mensagem?: string }> }) {
  const params = await searchParams
  return <><h1 className={styles.title}>Boas-vindas</h1><p className={styles.intro}>Entre para acessar o seu perfil FEGEPI.</p>{params.erro && <p className={`${styles.notice} ${styles.error}`}>{params.erro}</p>}{params.mensagem && <p className={`${styles.notice} ${styles.success}`}>{params.mensagem}</p>}<form className={styles.form} action={signInAction}><label className={styles.field}>E-mail<input required name="email" type="email" autoComplete="email" /></label><label className={styles.field}>Senha<input required name="password" type="password" autoComplete="current-password" /></label><button className={styles.submit}>Entrar</button></form><div className={styles.links}><Link href="/esqueci-a-senha">Esqueci minha senha</Link><p>Não tem uma conta? <Link href="/cadastro">Cadastre-se</Link></p></div></>
}
