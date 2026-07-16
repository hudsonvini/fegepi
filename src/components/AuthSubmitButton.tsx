'use client'

import { useFormStatus } from 'react-dom'

type AuthSubmitButtonProps = {
  children: string
  pendingChildren: string
  className: string
}

export function AuthSubmitButton({ children, pendingChildren, className }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button className={className} type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? pendingChildren : children}
    </button>
  )
}
