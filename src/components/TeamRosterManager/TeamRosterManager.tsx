'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CalendarClock, Search, UserPlus, UsersRound } from 'lucide-react'
import {
  assignPlayerToTeamGameAction,
  endPlayerMembershipAction,
  linkRosterProfileAction,
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
  const [nickname, setNickname] = useState('')
  const [useAccount, setUseAccount] = useState(false)

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
      description="Monte o elenco pelos nicks. Vincular uma conta FEGEPI é opcional e pode ser feito depois."
      triggerLabel="Elenco"
      triggerIcon="edit"
    >
      <div className={styles.layout}>
        <section className={styles.section}>
          <div className={styles.heading}>
            <span><UserPlus size={17} /></span>
            <div><h3>Adicionar ao elenco</h3><p>Informe o nick do jogador, mesmo que ele ainda não tenha uma conta.</p></div>
          </div>

          {activeGames.length ? (
            <form action={assignPlayerToTeamGameAction} className={styles.assignForm}>
              <input type="hidden" name="teamId" value={team.id} />
              <input type="hidden" name="profileId" value={useAccount ? selectedProfileId : ''} />
              <label>
                Jogo
                <select name="gameId" required value={selectedGameId} onChange={(event) => setSelectedGameId(event.target.value)}>
                  {activeGames.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
                </select>
              </label>
              <label>Nick do jogador<input name="nickname" required={!useAccount} maxLength={60} value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="Ex.: kinud" /></label>
              <label className={styles.accountToggle}><input type="checkbox" checked={useAccount} onChange={(event) => setUseAccount(event.target.checked)} /><span>Vincular uma conta já cadastrada agora</span></label>
              {useAccount && <label className={styles.searchField}>
                Buscar jogador
                <span><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setSelectedProfileId('') }} placeholder="Nome, nick ou e-mail..." /></span>
              </label>}
              {useAccount && query.trim().length >= 2 && !selectedProfile && (
                <div className={styles.searchResults}>
                  {results.length ? results.map((profile) => (
                    <button key={profile.id} type="button" onClick={() => { setSelectedProfileId(profile.id); setQuery(profile.full_name || profile.player_tag || 'Jogador') }}>
                      <img src={getProfileAvatar(profile.avatar_url, profile.gender)} alt="" />
                      <span><strong>{profile.full_name || 'Membro sem nome'}</strong><small>{profile.player_tag ? `@${profile.player_tag}` : profile.email}</small></span>
                    </button>
                  )) : <p>Nenhum perfil encontrado.</p>}
                </div>
              )}
              {useAccount && selectedProfile && (
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
                pendingLabel="Adicionando jogador..."
                disabled={useAccount ? !selectedProfileId : !nickname.trim().replace(/^@+/, '')}
              >
                <UserPlus size={15} /> Adicionar ao elenco
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
                  <div className={styles.playerInfo}>
                    {membership.profile_id
                      ? <Link href={`/jogadores/${membership.profile_id}`}>@{membership.nickname || membership.profiles?.player_tag || membership.profiles?.full_name || 'Jogador'}</Link>
                      : <strong>@{membership.nickname}</strong>}
                    <span>{roleLabels[membership.role]} · desde {new Date(`${membership.started_at}T00:00:00`).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <form className={styles.endForm} action={endPlayerMembershipAction}>
                    <input type="hidden" name="membershipId" value={membership.id} />
                    <input type="hidden" name="endedAt" value={today} />
                    <button className={styles.endButton}>Encerrar</button>
                  </form>
                    {!membership.profile_id && <form className={styles.linkForm} action={linkRosterProfileAction}>
                      <input type="hidden" name="membershipId" value={membership.id} />
                      <label>Vincular conta (opcional)<select name="profileId" required defaultValue="">
                        <option value="" disabled>Selecione uma conta</option>
                        {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.player_tag ? `@${profile.player_tag} · ` : ''}{profile.full_name || profile.email}</option>)}
                      </select></label>
                      <AdminSubmitButton className={styles.primaryButton} pendingLabel="Vinculando…">Vincular conta</AdminSubmitButton>
                    </form>}
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
                  <strong>{membership.nickname || membership.profiles?.player_tag || membership.profiles?.full_name || 'Jogador'}</strong>
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
