'use client'

import { LoaderCircle } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import type { ReactNode } from 'react'
import styles from './AdminSubmitButton.module.scss'

type Props = {
  children: ReactNode
  pendingLabel?: string
  className: string
  disabled?: boolean
}

export default function AdminSubmitButton({
  children,
  pendingLabel = 'Enviando...',
  className,
  disabled = false,
}: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      className={className}
      type="submit"
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
      aria-busy={pending}
    >
      {pending ? <><LoaderCircle className={styles.spinner} size={16} /> {pendingLabel}</> : children}
    </button>
  )
}
