'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react'
import { CheckCircle2 } from 'lucide-react'
import styles from './AdminFormControls.module.scss'

type ValidationKind = 'text' | 'url' | 'number' | 'date'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  label: string
  optional?: boolean
  helpText?: string
  kind?: ValidationKind
  type?: 'text' | 'number' | 'date'
  debounceMs?: number
}

function validLink(value: string) {
  if (value.startsWith('/') || value.startsWith('#')) return true
  try {
    const url = new URL(value)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)
  } catch {
    return false
  }
}

function validateValue({
  value,
  label,
  required,
  kind,
  minLength,
  min,
}: {
  value: string
  label: string
  required?: boolean
  kind: ValidationKind
  minLength?: number
  min?: string | number
}) {
  const normalized = value.trim()

  if (!normalized) return required ? `${label} é obrigatório.` : ''
  if (minLength && normalized.length < minLength) return `${label} deve ter pelo menos ${minLength} caracteres.`
  if (kind === 'url' && !validLink(normalized)) {
    return 'Informe uma URL completa ou um caminho interno iniciado por /.'
  }
  if (kind === 'number') {
    const parsed = Number(normalized)
    if (!Number.isFinite(parsed)) return 'Informe um número válido.'
    if (min !== undefined && parsed < Number(min)) return `O valor mínimo é ${min}.`
  }
  if (kind === 'date' && Number.isNaN(new Date(`${normalized}T00:00:00`).getTime())) {
    return 'Informe uma data válida.'
  }
  return ''
}

export default function ValidatedField({
  label,
  optional = false,
  helpText,
  kind = 'text',
  type = kind === 'number' ? 'number' : kind === 'date' ? 'date' : 'text',
  debounceMs = 350,
  required,
  minLength,
  min,
  defaultValue,
  className,
  ...inputProps
}: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [error, setError] = useState('')
  const [valid, setValid] = useState(false)
  const [touched, setTouched] = useState(false)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const runValidation = (value: string, immediate = false) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const message = validateValue({
      value,
      label,
      required,
      kind,
      minLength,
      min,
    })
    inputRef.current?.setCustomValidity(message)

    const showValidation = () => {
      setError(message)
      setValid(Boolean(value.trim()) && !message)
    }

    if (immediate) showValidation()
    else timerRef.current = setTimeout(showValidation, debounceMs)
  }

  return (
    <label className={`${styles.field} ${className ?? ''}`} htmlFor={inputId}>
      <span className={styles.label}>
        {label}
        {optional && <small>Opcional</small>}
      </span>
      <span className={styles.control}>
        <input
          {...inputProps}
          ref={inputRef}
          id={inputId}
          type={type}
          required={required}
          minLength={minLength}
          min={min}
          defaultValue={defaultValue}
          aria-invalid={Boolean(error)}
          aria-describedby={`${inputId}-message`}
          onChange={(event) => {
            setTouched(true)
            runValidation(event.currentTarget.value)
          }}
          onBlur={(event) => {
            setTouched(true)
            runValidation(event.currentTarget.value, true)
          }}
        />
        {touched && valid && <CheckCircle2 className={styles.validIcon} size={17} aria-hidden />}
      </span>
      <span
        id={`${inputId}-message`}
        className={error ? styles.error : styles.help}
        aria-live="polite"
      >
        {error || helpText || '\u00a0'}
      </span>
    </label>
  )
}
