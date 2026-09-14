import Link from 'next/link'
import Image from 'next/image'
import { requestPasswordResetAction } from '@/app/auth/actions'
import { AuthSubmitButton } from '@/components/AuthSubmitButton'
import styles from '../account.module.scss'

type ForgotPasswordPageProps = {
  searchParams: Promise<{ erro?: string; mensagem?: string }>
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { erro, mensagem } = await searchParams
  return <main className={styles.page}><section className={styles.card}><Link className={styles.brand} href="/"><Image src="/images/logo.png" alt="FEGEPI" width={175} height={37} /></Link><h1 className={styles.title}>Recuperar senha</h1><p className={styles.intro}>Informe seu e-mail e enviaremos um link seguro para criar uma nova senha.</p>{erro && <p className={`${styles.notice} ${styles.error}`} role="alert">{erro}</p>}{mensagem && <p className={`${styles.notice} ${styles.success}`} role="status">{mensagem}</p>}<form className={styles.form} action={requestPasswordResetAction}><label className={styles.field}>E-mail<input required name="email" type="email" autoComplete="email" inputMode="email" /></label><p className={styles.help}>O link expira e só pode ser usado uma vez. Caso peça mais de um, use apenas o mais recente.</p><AuthSubmitButton className={styles.submit} pendingChildren="Enviando link…">Enviar link de recuperação</AuthSubmitButton></form><div className={styles.links}><Link href="/login">Voltar ao login</Link></div></section></main>
}
