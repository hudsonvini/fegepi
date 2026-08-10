'use client'

import { Pencil, Plus, X } from 'lucide-react'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './AdminModal.module.scss'

type Props = {
  title: string
  description?: string
  triggerLabel: string
  triggerIcon?: 'plus' | 'edit'
  children: ReactNode
}

export default function AdminModal({ title, description, triggerLabel, triggerIcon = 'plus', children }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const titleId = useId()
  const TriggerIcon = triggerIcon === 'edit' ? Pencil : Plus

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

  const modal = isOpen ? createPortal(
    <div className={styles.overlay} role="presentation" onMouseDown={() => setIsOpen(false)}>
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-lenis-prevent="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Fechar modal">
            <X size={19} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </section>
    </div>,
    document.body,
  ) : null

  return (
    <>
      <button className={styles.trigger} type="button" onClick={() => setIsOpen(true)}>
        <TriggerIcon size={14} /> {triggerLabel}
      </button>
      {modal}
    </>
  )
}
