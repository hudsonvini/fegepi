import Link from 'next/link'
import { resendConfirmationAction } from '@/app/auth/actions'
import { AuthSubmitButton } from '@/components/AuthSubmitButton'
import styles from '../account.module.scss'

export default async function ConfirmEmailPage({ searchParams }: {
  searchParams: Promise<{ erro?: string; mensagem?: string }>
}) {
  const { erro, mensagem } = await searchParams
  return <main className={styles.page}><section className={styles.card}>
    <h1 className={styles.title}>Confirme seu e-mail</h1>
    <p className={styles.intro}>Abra o link de confirmação para ativar sua conta. Não encontrou? Confira o spam ou solicite outro link.</p>
    {erro && <p className={`${styles.notice} ${styles.error}`} role="alert">{erro}</p>}
    {mensagem && <p className={`${styles.notice} ${styles.success}`} role="status">{mensagem}</p>}
    <form className={styles.form} action={resendConfirmationAction}>
      <label className={styles.field}>E-mail<input required name="email" type="email" autoComplete="email" /></label>
      <p className={styles.help}>Aguarde pelo menos um minuto entre solicitações e use apenas o link mais recente.</p>
      <AuthSubmitButton className={styles.submit} pendingChildren="Solicitando…">Reenviar confirmação</AuthSubmitButton>
    </form>
    <div className={styles.links}><Link href="/login">Voltar ao login</Link></div>
  </section></main>
}
