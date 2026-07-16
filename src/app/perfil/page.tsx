import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/app/auth/actions'
import { getCurrentUser } from '@/lib/auth'
import { updateProfileAction } from './actions'
import styles from './page.module.scss'

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ erro?: string; mensagem?: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const params = await searchParams
  return <main className={styles.page}><div className={styles.shell}><div className={styles.top}><Link href="/"><img src="/images/logo.png" alt="FEGEPI" /></Link><Link className={styles.back} href="/">← Voltar ao site</Link></div><section className={styles.card}><div className={styles.header}><div><h1>Meu perfil</h1><p>{user.email}</p></div><span className={styles.role}>{user.role === 'admin' ? 'Administrador' : 'Membro'}</span></div>{params.erro && <p className={`${styles.notice} ${styles.error}`}>{params.erro}</p>}{params.mensagem && <p className={`${styles.notice} ${styles.success}`}>{params.mensagem}</p>}<form className={styles.form} action={updateProfileAction}><label className={styles.field}>Nome completo<input name="fullName" required defaultValue={user.fullName} /></label><label className={styles.field}>URL da foto de perfil (opcional)<input name="avatarUrl" type="url" defaultValue={user.avatarUrl ?? ''} placeholder="https://..." /></label><button className={styles.button}>Salvar alterações</button></form><div className={styles.accountActions}><Link className={styles.secondary} href="/esqueci-a-senha">Alterar senha</Link>{user.role === 'admin' && <Link className={styles.secondary} href="/admin">Painel administrativo</Link>}<form action={signOutAction}><button className={styles.logout}>Sair da conta</button></form></div></section></div></main>
}
