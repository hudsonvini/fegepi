'use client'

import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { Trash2, TriangleAlert, X } from 'lucide-react'
import { deleteContentAction } from '@/app/admin/actions'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import type { AdminTabId } from '@/components/AdminDashboard/types'
import styles from './ConfirmDeleteButton.module.scss'

export default function ConfirmDeleteButton({
  table,
  id,
  tab,
  section,
  gameId,
  label = 'Remover',
}: {
  table: string
  id: string
  tab: AdminTabId
  section?: string
  gameId?: string
  label?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  return (
    <>
      <button className={styles.trigger} type="button" onClick={() => setIsOpen(true)}>
        <Trash2 size={14} /> {label}
      </button>
      {isOpen && createPortal(
        <div className={styles.overlay} role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className={styles.close} type="button" onClick={() => setIsOpen(false)} aria-label="Fechar">
              <X size={18} />
            </button>
            <span className={styles.warning}><TriangleAlert size={24} /></span>
            <h2 id={titleId}>Confirmar exclusão</h2>
            <p>Esta ação remove o item e pode afetar informações relacionadas. Deseja continuar?</p>
            <form action={deleteContentAction} className={styles.actions}>
              <input type="hidden" name="table" value={table} />
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="tab" value={tab} />
              {section && <input type="hidden" name="contentSection" value={section} />}
              {gameId && <input type="hidden" name="gameId" value={gameId} />}
              <button className={styles.cancel} type="button" onClick={() => setIsOpen(false)}>Cancelar</button>
              <AdminSubmitButton className={styles.confirm} pendingLabel="Excluindo...">
                <Trash2 size={15} /> Sim, excluir
              </AdminSubmitButton>
            </form>
          </section>
        </div>,
        document.body,
      )}
    </>
  )
}
