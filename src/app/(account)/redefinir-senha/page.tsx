import { updatePasswordAction } from '@/app/auth/actions'
import { AuthSubmitButton } from '@/components/AuthSubmitButton'
import Link from 'next/link'
import Image from 'next/image'
import styles from '../account.module.scss'

export default function ResetPasswordPage() {
  return <main className={styles.page}><section className={styles.card}><Link className={styles.brand} href="/"><Image src="/images/logo.png" alt="FEGEPI" width={175} height={37} /></Link><h1 className={styles.title}>Criar nova senha</h1><p className={styles.intro}>Use pelo menos oito caracteres e escolha uma senha diferente da anterior.</p><form className={styles.form} action={updatePasswordAction}><label className={styles.field}>Nova senha<input required name="password" type="password" minLength={8} autoComplete="new-password" /></label><label className={styles.field}>Confirmar nova senha<input required name="confirmPassword" type="password" minLength={8} autoComplete="new-password" /></label><p className={styles.help}>Ao salvar, você entrará automaticamente com a senha nova.</p><AuthSubmitButton className={styles.submit} pendingChildren="Salvando nova senha…">Salvar nova senha</AuthSubmitButton></form></section></main>
}
