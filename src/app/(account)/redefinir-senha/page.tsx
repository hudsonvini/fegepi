import { updatePasswordAction } from '@/app/auth/actions'
import { AuthSubmitButton } from '@/components/AuthSubmitButton'
import styles from '../account.module.scss'

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams
  return <><h1 className={styles.title}>Criar nova senha</h1><p className={styles.intro}>Use pelo menos oito caracteres e escolha uma senha diferente da anterior.</p>{erro && <p className={`${styles.notice} ${styles.error}`} role="alert">{erro}</p>}<form className={styles.form} action={updatePasswordAction}><label className={styles.field}>Nova senha<input required name="password" type="password" minLength={8} autoComplete="new-password" /></label><label className={styles.field}>Confirmar nova senha<input required name="confirmPassword" type="password" minLength={8} autoComplete="new-password" /></label><p className={styles.help}>Ao salvar, você entrará automaticamente com a senha nova.</p><AuthSubmitButton className={styles.submit} pendingChildren="Salvando nova senha…">Salvar nova senha</AuthSubmitButton></form></>
}
