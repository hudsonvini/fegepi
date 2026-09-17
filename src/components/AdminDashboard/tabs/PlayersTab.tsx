'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, EyeOff, Search, Sparkles, Star, UsersRound } from 'lucide-react'
import { updateFeaturedPlayerAction } from '@/app/admin/actions'
import { getProfileAvatar } from '@/lib/profile'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import type { AdminData } from '../types'
import styles from './PlayersTab.module.scss'

export default function PlayersTab({ data }: { data: AdminData }) {
  const [query, setQuery] = useState('')
  const [teamId, setTeamId] = useState('all')

  const currentMemberships = useMemo(
    () => data.memberships.filter((membership) => !membership.ended_at),
    [data.memberships],
  )

  const players = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR')
    return data.profiles
      .filter((profile) => {
        const membership = currentMemberships.find((item) => item.profile_id === profile.id)
        const playerTeamId = membership?.team_id ?? profile.team_id
        if (teamId !== 'all' && playerTeamId !== teamId) return false
        if (!normalized) return true
        return [profile.full_name, profile.player_tag, profile.favorite_game, membership?.teams?.name, profile.team]
          .some((value) => value?.toLocaleLowerCase('pt-BR').includes(normalized))
      })
      .sort((a, b) => Number(b.is_featured) - Number(a.is_featured)
        || a.featured_order - b.featured_order
        || (a.full_name ?? '').localeCompare(b.full_name ?? '', 'pt-BR'))
  }, [currentMemberships, data.profiles, query, teamId])

  const featuredCount = data.profiles.filter((profile) => profile.is_featured).length

  return (
    <section>
      <header className={styles.heading}>
        <div>
          <span><Sparkles size={15} /> Curadoria da vitrine</span>
          <h1>Jogadores</h1>
          <p>Escolha os talentos que aparecem na seção animada da página inicial.</p>
        </div>
        <div className={styles.counter}>
          <Star size={19} fill="currentColor" />
          <strong>{featuredCount}</strong>
          <span>em destaque</span>
        </div>
      </header>

      {!data.featureManagementAvailable && (
        <div className={styles.migrationWarning} role="alert">
          <AlertTriangle size={19} />
          <div>
            <strong>Configuração de destaques pendente no Supabase</strong>
            <span>Os jogadores já podem ser consultados abaixo, mas é necessário aplicar <code>supabase/featured-players.sql</code> para salvar a vitrine.</span>
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar nome, nick, time ou jogo..."
          />
        </label>
        <label className={styles.select}>
          <UsersRound size={18} />
          <select value={teamId} onChange={(event) => setTeamId(event.target.value)}>
            <option value="all">Todos os times</option>
            {data.teams.filter((team) => team.active).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </label>
      </div>

      <div className={styles.resultLine}>
        <strong>{players.length}</strong> {players.length === 1 ? 'jogador encontrado' : 'jogadores encontrados'}
      </div>

      <div className={styles.grid}>
        {players.map((player) => {
          const membership = currentMemberships.find((item) => item.profile_id === player.id)
          return (
            <article className={`${styles.card} ${player.is_featured ? styles.featured : ''}`} key={player.id}>
              <div className={styles.avatar}>
                <img src={getProfileAvatar(player.avatar_url, player.gender)} alt="" />
                {player.is_featured && <span><Star size={12} fill="currentColor" /></span>}
              </div>
              <div className={styles.identity}>
                <small>
                  {player.player_tag ? `@${player.player_tag}` : 'Jogador FEGEPI'}
                  {!player.public_profile && <span className={styles.privateBadge}><EyeOff size={11} /> Perfil privado</span>}
                </small>
                <h2>{player.full_name || 'Jogador sem nome'}</h2>
                <p>{membership?.teams?.name || player.team || 'Sem time'} <i /> {membership?.games?.short_name || player.favorite_game || 'Sem modalidade'}</p>
              </div>
              <form action={updateFeaturedPlayerAction} className={styles.featureForm}>
                <input type="hidden" name="profileId" value={player.id} />
                <label>
                  Ordem
                  <input
                    type="number"
                    name="featuredOrder"
                    min="0"
                    max="99"
                    defaultValue={player.featured_order}
                    aria-label={`Ordem de ${player.full_name || 'jogador'} na vitrine`}
                  />
                </label>
                <input type="hidden" name="isFeatured" value="on" />
                <AdminSubmitButton
                  className={styles.featureButton}
                  disabled={!data.featureManagementAvailable}
                  pendingLabel="Salvando..."
                >
                  <Star size={15} fill={player.is_featured ? 'currentColor' : 'none'} />
                  {player.is_featured ? 'Salvar ordem' : 'Destacar'}
                </AdminSubmitButton>
                {player.is_featured && <button type="submit" name="operation" value="remove" className={styles.removeButton} disabled={!data.featureManagementAvailable}>Remover destaque</button>}
              </form>
            </article>
          )
        })}
        {!players.length && (
          <div className={styles.empty}>
            <Search size={26} />
            <strong>Nenhum jogador encontrado</strong>
            <span>Tente outro nome ou selecione todos os times.</span>
            {(query || teamId !== 'all') && <button type="button" onClick={() => { setQuery(''); setTeamId('all') }}>Limpar filtros</button>}
          </div>
        )}
      </div>
    </section>
  )
}
