'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useId, useState, type FormEvent, type InvalidEvent } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Gamepad2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  UserPlus,
  UserRound,
} from 'lucide-react'
import { signInAction, signUpAction } from '@/app/auth/actions'
import { AuthSubmitButton } from '@/components/AuthSubmitButton'
import styles from './AuthExperience.module.scss'

type AuthMode = 'login' | 'cadastro'
type Notice = { kind: 'error' | 'success'; message: string }
type MediaSource = { type: 'image' | 'video'; src: string; poster?: string }

type AuthExperienceProps = {
  initialMode: AuthMode
  notice?: Notice
}

const content: Record<AuthMode, {
  eyebrow: string
  title: string
  description: string
  cardTitle: string
  cardDescription: string
  media: MediaSource
}> = {
  login: {
    eyebrow: 'Bem-vindo de volta',
    title: 'O jogo continua daqui.',
    description: 'Acesse seu perfil, acompanhe campeonatos e viva o cenário de e-sports do Piauí.',
    cardTitle: 'Entrar na conta',
    cardDescription: 'Use seus dados para acessar o ambiente FEGEPI.',
    media: { type: 'image', src: '/images/auth/login-arena.png' },
  },
  cadastro: {
    eyebrow: 'Faça parte da comunidade',
    title: 'Seu próximo time começa aqui.',
    description: 'Crie sua conta e conecte-se à comunidade que movimenta os games no Piauí.',
    cardTitle: 'Criar sua conta',
    cardDescription: 'Leva menos de um minuto para começar.',
    media: { type: 'image', src: '/images/auth/cadastro-team.png' },
  },
}

function BackgroundMedia({ source }: { source: MediaSource }) {
  if (source.type === 'video') {
    return <video src={source.src} poster={source.poster} autoPlay muted loop playsInline preload="metadata" />
  }

  return <Image src={source.src} alt="" fill sizes="100vw" loading="eager" aria-hidden="true" />
}

function fieldMessage(input: HTMLInputElement) {
  if (input.validity.valueMissing) return 'Este campo é obrigatório.'
  if (input.validity.typeMismatch) return 'Digite um e-mail válido.'
  if (input.validity.tooShort) return `Use pelo menos ${input.minLength} caracteres.`
  return 'Confira o valor informado.'
}

export function AuthExperience({ initialMode, notice }: AuthExperienceProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const titleId = useId()
  const isLogin = mode === 'login'
  const current = content[mode]

  useEffect(() => {
    const handleHistory = () => {
      setMode(window.location.pathname === '/cadastro' ? 'cadastro' : 'login')
      setFieldErrors({})
      setShowPassword(false)
    }

    window.addEventListener('popstate', handleHistory)
    return () => window.removeEventListener('popstate', handleHistory)
  }, [])

  function changeMode(nextMode: AuthMode) {
    if (nextMode === mode) return
    setMode(nextMode)
    setFieldErrors({})
    setShowPassword(false)
    window.history.pushState(null, '', nextMode === 'login' ? '/login' : '/cadastro')
  }

  function handleInvalid(event: InvalidEvent<HTMLInputElement>) {
    event.preventDefault()
    const input = event.currentTarget
    setFieldErrors((errors) => ({ ...errors, [input.name]: fieldMessage(input) }))
  }

  function handleInput(event: FormEvent<HTMLInputElement>) {
    const input = event.currentTarget
    if (fieldErrors[input.name] && input.validity.valid) {
      setFieldErrors((errors) => {
        const next = { ...errors }
        delete next[input.name]
        return next
      })
    }
  }

  return (
    <main className={`${styles.page} ${styles[mode]}`}>
      <div className={styles.backgrounds} aria-hidden="true">
        {(Object.keys(content) as AuthMode[]).map((itemMode) => (
          <div
            className={`${styles.background} ${mode === itemMode ? styles.backgroundActive : ''}`}
            key={itemMode}
          >
            <BackgroundMedia source={content[itemMode].media} />
          </div>
        ))}
        <div className={styles.backdrop} />
      </div>

      <aside className={styles.visualCopy} aria-live="polite">
        {(Object.keys(content) as AuthMode[]).map((itemMode) => (
          <div
            className={`${styles.copyPanel} ${mode === itemMode ? styles.copyPanelActive : ''}`}
            key={itemMode}
            aria-hidden={mode !== itemMode}
          >
            <span className={styles.eyebrow}>{content[itemMode].eyebrow}</span>
            <p className={styles.heroTitle}>{content[itemMode].title}</p>
            <p className={styles.heroDescription}>{content[itemMode].description}</p>
          </div>
        ))}
        <div className={styles.steps}>
          <span className={isLogin ? styles.stepActive : ''} />
          <span className={!isLogin ? styles.stepActive : ''} />
        </div>
      </aside>

      <section className={styles.card} aria-labelledby={titleId}>
        <Link className={styles.brand} href="/" aria-label="Voltar para a página inicial da FEGEPI">
          <Image src="/images/logo.png" alt="FEGEPI" width={175} height={37} loading="eager" />
        </Link>

        <header className={styles.cardHeader}>
          <span className={styles.cardIcon} aria-hidden="true">
            {isLogin ? <LogIn size={21} /> : <UserPlus size={21} />}
          </span>
          <div key={mode} className={styles.headingMotion}>
            <h1 id={titleId}>{current.cardTitle}</h1>
            <p>{current.cardDescription}</p>
          </div>
        </header>

        <div className={styles.modeToggle} role="group" aria-label="Escolha entre entrar e criar uma conta">
          <span className={`${styles.toggleIndicator} ${!isLogin ? styles.toggleIndicatorRight : ''}`} />
          <button type="button" aria-pressed={isLogin} onClick={() => changeMode('login')}>
            <LogIn size={17} />
            Entrar
          </button>
          <button type="button" aria-pressed={!isLogin} onClick={() => changeMode('cadastro')}>
            <UserPlus size={17} />
            Criar conta
          </button>
        </div>

        {notice && initialMode === mode && (
          <p
            className={`${styles.notice} ${notice.kind === 'error' ? styles.error : styles.success}`}
            role={notice.kind === 'error' ? 'alert' : 'status'}
          >
            {notice.kind === 'error' ? <ShieldCheck size={18} /> : <Gamepad2 size={18} />}
            {notice.message}
          </p>
        )}

        <div className={styles.formViewport}>
          <form
            key={mode}
            className={styles.form}
            action={isLogin ? signInAction : signUpAction}
          >
            {!isLogin && (
              <label className={styles.field}>
                <span>Nome completo</span>
                <span className={`${styles.inputShell} ${fieldErrors.fullName ? styles.inputError : ''}`}>
                  <UserRound size={18} />
                  <input
                    required
                    name="fullName"
                    autoComplete="name"
                    placeholder="Como podemos chamar você?"
                    minLength={2}
                    onInvalid={handleInvalid}
                    onInput={handleInput}
                    aria-invalid={Boolean(fieldErrors.fullName)}
                  />
                </span>
                {fieldErrors.fullName && <small role="alert">{fieldErrors.fullName}</small>}
              </label>
            )}

            <label className={styles.field}>
              <span>E-mail</span>
              <span className={`${styles.inputShell} ${fieldErrors.email ? styles.inputError : ''}`}>
                <Mail size={18} />
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="seu.nome@email.com"
                  onInvalid={handleInvalid}
                  onInput={handleInput}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
              </span>
              {fieldErrors.email && <small role="alert">{fieldErrors.email}</small>}
            </label>

            <label className={styles.field}>
              <span>Senha</span>
              <span className={`${styles.inputShell} ${fieldErrors.password ? styles.inputError : ''}`}>
                <LockKeyhole size={18} />
                <input
                  required
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  minLength={8}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder={isLogin ? 'Digite sua senha' : 'Crie uma senha segura'}
                  onInvalid={handleInvalid}
                  onInput={handleInput}
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                <button
                  className={styles.passwordToggle}
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
              {fieldErrors.password
                ? <small role="alert">{fieldErrors.password}</small>
                : !isLogin && <span className={styles.passwordHint}>Use no mínimo 8 caracteres.</span>}
            </label>

            {isLogin && (
              <Link className={styles.forgotPassword} href="/esqueci-a-senha">
                Esqueceu a senha?
              </Link>
            )}

            <AuthSubmitButton
              className={styles.submit}
              pendingChildren={isLogin ? 'Entrando…' : 'Criando conta…'}
            >
              {isLogin ? 'Entrar na FEGEPI' : 'Criar minha conta'}
            </AuthSubmitButton>
          </form>
        </div>

        <p className={styles.switchPrompt}>
          {isLogin ? 'Ainda não faz parte?' : 'Já possui uma conta?'}
          <button type="button" onClick={() => changeMode(isLogin ? 'cadastro' : 'login')}>
            {isLogin ? 'Cadastre-se' : 'Entrar'}
            <ArrowRight size={15} />
          </button>
        </p>
      </section>
    </main>
  )
}
