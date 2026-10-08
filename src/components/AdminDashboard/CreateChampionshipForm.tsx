'use client'

import { useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { saveChampionshipAction } from '@/app/admin/championship-actions'
import styles from '@/app/admin/page.module.scss'
import buttonStyles from '@/components/AdminSubmitButton/AdminSubmitButton.module.scss'

type Props = {
  seasonId?: string
  seasonLabel?: string
  gameName?: string
  available: boolean
}

export default function CreateChampionshipForm({ seasonId, seasonLabel, gameName, available }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const submitting = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const disabled = !available || !seasonId

  async function createChampionship() {
    const form = formRef.current
    if (disabled || submitting.current || !form?.reportValidity()) return

    const formData = new FormData(form)
    submitting.current = true
    setPending(true)
    setError('')
    try {
      await saveChampionshipAction(formData)
    } catch {
      setError('Não foi possível confirmar o cadastro. Confira a lista de campeonatos antes de tentar novamente.')
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={(event) => event.preventDefault()} className={styles.form} aria-busy={pending}>
      <input type="hidden" name="seasonId" value={seasonId ?? ''} />
      <input type="hidden" name="status" value="draft" />
      <p className={styles.contextInfo}>{gameName} · {seasonLabel ?? 'Crie uma temporada antes de continuar.'}</p>
      <label>Nome do campeonato<input name="name" required maxLength={120} placeholder="Ex.: Copa Piauí — Etapa 1" /></label>
      <label>Data de encerramento<input type="date" name="playedAt" required /></label>
      <p className={styles.automaticHint}>O campeonato começa em rascunho. A pontuação entra no ranking quando você concluir os resultados.</p>
      {error && <p className={`${styles.notice} ${styles.error}`} role="alert">{error}</p>}
      {/* Native date-picker interactions must never trigger publication implicitly. */}
      <button type="button" onClick={createChampionship} className={styles.primaryButton} disabled={disabled || pending} aria-busy={pending}>
        {pending ? <><LoaderCircle className={buttonStyles.spinner} size={16} /> Cadastrando...</> : 'Cadastrar e selecionar times'}
      </button>
    </form>
  )
}
