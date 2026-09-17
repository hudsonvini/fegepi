'use client'

import { Pencil, Plus, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
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
  const dialogRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const TriggerIcon = triggerIcon === 'edit' ? Pencil : Plus

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]') ?? []).filter((element) => element.getClientRects().length > 0)
    const firstInput = dialogRef.current?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea')
    ;(firstInput ?? focusable()[0])?.focus({ preventScroll: true })
    const trigger = triggerRef.current
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
      if (event.key === 'Tab') {
        const items = focusable()
        const first = items[0]
        const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
      trigger?.focus()
    }
  }, [isOpen])

  const modal = isOpen ? createPortal(
    <div className={styles.overlay} role="presentation" onMouseDown={() => setIsOpen(false)}>
      <section
        ref={dialogRef}
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
      <button ref={triggerRef} className={styles.trigger} type="button" aria-haspopup="dialog" onClick={() => setIsOpen(true)}>
        <TriggerIcon size={14} /> {triggerLabel}
      </button>
      {modal}
    </>
  )
}
