import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, BadgeCheck, Gamepad2, MapPin, MessageCircle, ShieldCheck, Trophy, UserRound } from 'lucide-react'
import { signOutAction } from '@/app/auth/actions'
import { getCurrentUser } from '@/lib/auth'
import { getProfileAvatar } from '@/lib/profile'
import { updateProfileAction } from './actions'
import { ProfileAvatarPicker } from './ProfileAvatarPicker'
import styles from './page.module.scss'

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ erro?: string; mensagem?: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const joinedAt = user.createdAt
    ? new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(user.createdAt)).replace('.', '')
    : 'Comunidade FEGEPI'
  const avatar = getProfileAvatar(user.avatarUrl, user.gender)

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/" aria-label="Ir para a página inicial da FEGEPI">
            <img src="/images/logo.png" alt="FEGEPI" />
          </Link>
          <Link className={styles.back} href="/"><ArrowLeft size={17} /> Voltar ao site</Link>
        </header>

        <section className={styles.profileHero} aria-labelledby="profile-title">
          <div className={styles.heroGlow} />
          <div className={styles.identity}>
            <div className={styles.avatarFrame}><img src={avatar} alt={`Avatar de ${user.fullName}`} /></div>
            <div className={styles.identityCopy}>
              <span className={styles.memberTag}><BadgeCheck size={16} /> Membro FEGEPI</span>
              <h1 id="profile-title">{user.fullName}</h1>
              <p>{user.email}</p>
              <div className={styles.quickMeta}>
                <span><Trophy size={15} /> {user.team || 'Sem time definido'}</span>
                <span><Gamepad2 size={15} /> {user.favoriteGame || 'Gamer FEGEPI'}</span>
              </div>
            </div>
          </div>
          <span className={`${styles.role} ${user.role === 'admin' ? styles.adminRole : ''}`}><ShieldCheck size={15} /> {user.role === 'admin' ? 'Administrador' : 'Membro'}</span>
        </section>

        {params.erro && <p className={`${styles.notice} ${styles.error}`} role="alert">{params.erro}</p>}
        {params.mensagem && <p className={`${styles.notice} ${styles.success}`} role="status">{params.mensagem}</p>}

        <div className={styles.contentGrid}>
          <section className={styles.card} aria-labelledby="details-title">
            <div className={styles.cardTitle}>
              <div className={styles.titleIcon}><UserRound size={20} /></div>
              <div><p className={styles.eyebrow}>Perfil do jogador</p><h2 id="details-title">Seus dados</h2></div>
            </div>

            <form className={styles.form} action={updateProfileAction}>
              <ProfileAvatarPicker initialGender={user.gender} customAvatarUrl={user.avatarUrl} />

              <div className={styles.formSection}>
                <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Informações pessoais</p><h2>Como a comunidade vê você</h2></div></div>
                <div className={styles.fieldsGrid}>
                  <label className={`${styles.field} ${styles.fieldWide}`}>Nome completo<input name="fullName" required autoComplete="name" defaultValue={user.fullName} /></label>
                  <label className={styles.field}>WhatsApp<input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" defaultValue={user.whatsapp ?? ''} placeholder="(86) 99999-9999" /></label>
                  <label className={styles.field}>Time / organização<input name="team" defaultValue={user.team ?? ''} placeholder="Ex.: Piauí Gaming" /></label>
                  <label className={`${styles.field} ${styles.fieldWide}`}>Endereço<input name="address" autoComplete="street-address" defaultValue={user.address ?? ''} placeholder="Cidade, bairro ou endereço" /></label>
                  <label className={styles.field}>Jogo favorito<input name="favoriteGame" defaultValue={user.favoriteGame ?? ''} placeholder="Ex.: EA FC 26" /></label>
                  <label className={styles.field}>Foto pessoal (opcional)<input name="avatarUrl" type="url" defaultValue={user.avatarUrl ?? ''} placeholder="https://..." /><small>Ao preencher, ela substitui o avatar padrão.</small></label>
                </div>
              </div>

              <div className={styles.formFooter}>
                <p>Seus dados ficam associados apenas à sua conta FEGEPI.</p>
                <button className={styles.button}>Salvar perfil</button>
              </div>
            </form>
          </section>

          <aside className={styles.sidebar}>
            <section className={`${styles.card} ${styles.summaryCard}`} aria-labelledby="summary-title">
              <div className={styles.cardTitle}>
                <div className={styles.titleIcon}><Gamepad2 size={20} /></div>
                <div><p className={styles.eyebrow}>Seu espaço</p><h2 id="summary-title">Resumo de jogador</h2></div>
              </div>
              <div className={styles.summaryList}>
                <div><span className={styles.summaryIcon}><Trophy size={17} /></span><p><small>Time</small><strong>{user.team || 'Ainda não informado'}</strong></p></div>
                <div><span className={styles.summaryIcon}><MapPin size={17} /></span><p><small>Localização</small><strong>{user.address || 'Ainda não informado'}</strong></p></div>
                <div><span className={styles.summaryIcon}><MessageCircle size={17} /></span><p><small>WhatsApp</small><strong>{user.whatsapp || 'Ainda não informado'}</strong></p></div>
              </div>
              <div className={styles.joined}><span>Na FEGEPI desde</span><strong>{joinedAt}</strong></div>
            </section>

            <section className={`${styles.card} ${styles.accountCard}`} aria-labelledby="account-title">
              <p className={styles.eyebrow}>Conta e segurança</p>
              <h2 id="account-title">Ações rápidas</h2>
              <Link className={styles.secondary} href="/esqueci-a-senha">Alterar senha</Link>
              {user.role === 'admin' && <Link className={styles.secondary} href="/admin">Painel administrativo</Link>}
              <form action={signOutAction}><button className={styles.logout}>Sair da conta</button></form>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}
