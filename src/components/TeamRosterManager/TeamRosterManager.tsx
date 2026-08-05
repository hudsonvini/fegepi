'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CalendarClock, Search, UserPlus, UsersRound } from 'lucide-react'
import {
  assignPlayerToTeamGameAction,
  endPlayerMembershipAction,
} from '@/app/admin/actions'
import AdminModal from '@/components/AdminModal/AdminModal'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import { getProfileAvatar } from '@/lib/profile'
import type {
  Game,
  PlayerTeamMembership,
  Profile,
  Team,
  TeamGame,
} from '@/components/AdminDashboard/types'
import styles from './TeamRosterManager.module.scss'

const roleLabels = {
  player: 'Jogador',
  captain: 'Capitão',
  coach: 'Treinador',
  reserve: 'Reserva',
} as const

export default function TeamRosterManager({
  team,
  games,
  teamGames,
  profiles,
  memberships,
  today,
}: {
  team: Team
  games: Game[]
  teamGames: TeamGame[]
  profiles: Profile[]
  memberships: PlayerTeamMembership[]
  today: string
}) {
  const activeGameIds = teamGames.filter((item) => item.team_id === team.id && item.active).map((item) => item.game_id)
  const activeGames = games.filter((game) => activeGameIds.includes(game.id))
  const [selectedGameId, setSelectedGameId] = useState(activeGames[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [selectedProfileId, setSelectedProfileId] = useState('')

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR')
    if (normalized.length < 2) return []
    return profiles
      .filter((profile) => {
        const haystack = `${profile.full_name ?? ''} ${profile.player_tag ?? ''} ${profile.email ?? ''}`.toLocaleLowerCase('pt-BR')
        return haystack.includes(normalized)
      })
      .slice(0, 8)
  }, [profiles, query])

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId)
  const currentRoster = memberships.filter((item) => item.team_id === team.id && item.game_id === selectedGameId && !item.ended_at)
  const history = memberships.filter((item) => item.team_id === team.id && item.game_id === selectedGameId && item.ended_at)

  return (
    <AdminModal
      title={`Elenco · ${team.name}`}
      description="Encontre jogadores da plataforma, vincule-os por modalidade e acompanhe as passagens pelo time."
      triggerLabel="Elenco"
      triggerIcon="edit"
    >
      <div className={styles.layout}>
        <section className={styles.section}>
          <div className={styles.heading}>
            <span><UserPlus size={17} /></span>
            <div><h3>Vincular jogador</h3><p>O vínculo é específico para um jogo e gera uma passagem no histórico.</p></div>
          </div>

          {activeGames.length ? (
            <form action={assignPlayerToTeamGameAction} className={styles.assignForm}>
              <input type="hidden" name="teamId" value={team.id} />
              <input type="hidden" name="profileId" value={selectedProfileId} />
              <label>
                Jogo
                <select name="gameId" required value={selectedGameId} onChange={(event) => setSelectedGameId(event.target.value)}>
                  {activeGames.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
                </select>
              </label>
              <label className={styles.searchField}>
                Buscar jogador
                <span><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setSelectedProfileId('') }} placeholder="Nome, nick ou e-mail..." /></span>
              </label>
              {query.trim().length >= 2 && !selectedProfile && (
                <div className={styles.searchResults}>
                  {results.length ? results.map((profile) => (
                    <button key={profile.id} type="button" onClick={() => { setSelectedProfileId(profile.id); setQuery(profile.full_name || profile.player_tag || 'Jogador') }}>
                      <img src={getProfileAvatar(profile.avatar_url, profile.gender)} alt="" />
                      <span><strong>{profile.full_name || 'Membro sem nome'}</strong><small>{profile.player_tag ? `@${profile.player_tag}` : profile.email}</small></span>
                    </button>
                  )) : <p>Nenhum perfil encontrado.</p>}
                </div>
              )}
              {selectedProfile && (
                <div className={styles.selectedPlayer}>
                  <img src={getProfileAvatar(selectedProfile.avatar_url, selectedProfile.gender)} alt="" />
                  <span><strong>{selectedProfile.full_name}</strong><small>{selectedProfile.player_tag ? `@${selectedProfile.player_tag}` : 'Perfil FEGEPI'}</small></span>
                  <button type="button" onClick={() => { setSelectedProfileId(''); setQuery('') }}>Trocar</button>
                </div>
              )}
              <div className={styles.formRow}>
                <label>
                  Função
                  <select name="membershipRole" defaultValue="player">
                    {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label>Entrada<input name="startedAt" type="date" required defaultValue={today} /></label>
              </div>
              <AdminSubmitButton
                className={styles.primaryButton}
                pendingLabel="Vinculando jogador..."
                disabled={!selectedProfileId}
              >
                <UserPlus size={15} /> Vincular ao elenco
              </AdminSubmitButton>
            </form>
          ) : (
            <p className={styles.empty}>Edite o time e selecione pelo menos uma modalidade antes de montar o elenco.</p>
          )}
        </section>

        {activeGames.length > 0 && (
          <section className={styles.section}>
            <div className={styles.heading}>
              <span><UsersRound size={17} /></span>
              <div><h3>Elenco atual</h3><p>{activeGames.find((game) => game.id === selectedGameId)?.name}</p></div>
            </div>
            <div className={styles.roster}>
              {currentRoster.length ? currentRoster.map((membership) => (
                <article key={membership.id}>
                  <img src={getProfileAvatar(membership.profiles?.avatar_url, membership.profiles?.gender)} alt="" />
                  <div>
                    <Link href={`/jogadores/${membership.profile_id}`}>{membership.profiles?.full_name || 'Jogador'}</Link>
                    <span>{roleLabels[membership.role]} · desde {new Date(`${membership.started_at}T00:00:00`).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <form action={endPlayerMembershipAction}>
                    <input type="hidden" name="membershipId" value={membership.id} />
                    <input type="hidden" name="endedAt" value={today} />
                    <button>Encerrar</button>
                  </form>
                </article>
              )) : <p className={styles.empty}>Nenhum jogador ativo neste jogo.</p>}
            </div>
          </section>
        )}

        {history.length > 0 && (
          <section className={styles.section}>
            <div className={styles.heading}>
              <span><CalendarClock size={17} /></span>
              <div><h3>Histórico neste time</h3><p>Passagens encerradas ficam preservadas.</p></div>
            </div>
            <div className={styles.history}>
              {history.map((membership) => (
                <p key={membership.id}>
                  <strong>{membership.profiles?.full_name || 'Jogador'}</strong>
                  <span>{roleLabels[membership.role]} · {new Date(`${membership.started_at}T00:00:00`).toLocaleDateString('pt-BR')} a {new Date(`${membership.ended_at}T00:00:00`).toLocaleDateString('pt-BR')}</span>
                </p>
              ))}
            </div>
          </section>
        )}
      </div>
    </AdminModal>
  )
}
