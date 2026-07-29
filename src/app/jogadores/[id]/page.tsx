import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, Gamepad2, ShieldCheck, Trophy } from 'lucide-react'
import ManagedNavbar from '@/components/ManagedNavbar/ManagedNavbar'
import { getCurrentUser } from '@/lib/auth'
import { getPublicPlayer } from '@/lib/players'
import { getProfileAvatar } from '@/lib/profile'
import styles from '../page.module.scss'

const roleLabels = { player: 'Jogador', captain: 'Capitão', coach: 'Treinador', reserve: 'Reserva' }

export default async function PublicPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [user, result] = await Promise.all([getCurrentUser(), getPublicPlayer(id)])
  if (!result.player) notFound()
  const { player, memberships } = result
  const current = memberships.filter((item) => !item.ended_at)
  const history = memberships.filter((item) => item.ended_at)

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <ManagedNavbar user={user} />
        <Link className={styles.back} href="/jogadores"><ArrowLeft size={16} /> Todos os jogadores</Link>

        <header className={styles.playerHero}>
          <img src={getProfileAvatar(player.avatar_url, player.gender)} alt={`Avatar de ${player.full_name || 'jogador'}`} />
          <div>
            <span><ShieldCheck size={15} /> Perfil público</span>
            <h1>{player.full_name || 'Jogador FEGEPI'}</h1>
            <strong>{player.player_tag ? `@${player.player_tag}` : 'Membro FEGEPI'}</strong>
            {player.bio && <p>{player.bio}</p>}
          </div>
        </header>

        <div className={styles.profileGrid}>
          <section className={styles.panel}>
            <div className={styles.panelTitle}><Trophy size={19} /><div><small>Agora</small><h2>Times atuais</h2></div></div>
            <div className={styles.currentTeams}>
              {current.map((item) => (
                <article key={item.id}>
                  {item.teams?.crest_url ? <img src={item.teams.crest_url} alt="" /> : <span>{item.teams?.initials}</span>}
                  <div><h3>{item.teams?.name}</h3><p><Gamepad2 size={14} /> {item.games?.name} · {roleLabels[item.role]}</p></div>
                </article>
              ))}
              {!current.length && <p className={styles.muted}>Este jogador não está em um elenco atualmente.</p>}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelTitle}><CalendarDays size={19} /><div><small>Carreira</small><h2>Histórico de times</h2></div></div>
            <div className={styles.timeline}>
              {history.map((item) => (
                <article key={item.id}>
                  <i />
                  <div>
                    <span>{item.games?.short_name} · {roleLabels[item.role]}</span>
                    <h3>{item.teams?.name}</h3>
                    <p>{new Date(`${item.started_at}T00:00:00`).toLocaleDateString('pt-BR')} — {item.ended_at && new Date(`${item.ended_at}T00:00:00`).toLocaleDateString('pt-BR')}</p>
                  </div>
                </article>
              ))}
              {!history.length && <p className={styles.muted}>O histórico aparecerá após a primeira transferência.</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
