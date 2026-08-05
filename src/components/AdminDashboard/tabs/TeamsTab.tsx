import Link from 'next/link'
import { ChevronRight, Filter, Plus, Trophy } from 'lucide-react'
import { createTeamAction } from '@/app/admin/actions'
import styles from '@/app/admin/page.module.scss'
import { EditTeamModal } from '@/components/AdminEditForms/AdminEditForms'
import AdminModal from '@/components/AdminModal/AdminModal'
import MediaUploadField from '@/components/AdminFormControls/MediaUploadField'
import ValidatedField from '@/components/AdminFormControls/ValidatedField'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import TeamRosterManager from '@/components/TeamRosterManager/TeamRosterManager'
import { adminHref } from '../navigation'
import { DeleteButton, SectionTitle } from '../shared'
import type { AdminData } from '../types'

export default function TeamsTab({ data }: { data: AdminData }) {
  const selectedGame = data.selectedGame
  const visibleTeams = selectedGame
    ? data.teams.filter((team) => data.teamGames.some((item) => item.team_id === team.id && item.game_id === selectedGame.id && item.active))
    : data.teams
  const userTeamCount = (teamId: string) => new Set(
    data.memberships
      .filter((membership) => membership.team_id === teamId && !membership.ended_at)
      .map((membership) => membership.profile_id),
  ).size
  const teamSeasonCount = (teamId: string) => data.entries.filter((entry) => entry.team_id === teamId).length
  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      <SectionTitle
        eyebrow="Comunidade competitiva"
        title="Times e organizações"
        description="Mantenha a base de times atualizada antes de incluí-los em uma temporada ou atribuí-los a membros."
      />

      <div className={styles.teamToolbar}>
        <div>
          {/* <p className={styles.eyebrow}>Gestão de times</p> */}
          <h2>Times cadastrados</h2>
          <p>Crie uma equipe pelo botão e use os cards para editar seus dados ou administrar o elenco.</p>
        </div>
        <AdminModal
          title="Cadastrar time"
          description="Informe a identidade da equipe e selecione todas as modalidades em que ela atua."
          triggerLabel="Novo time"
        >
          <form action={createTeamAction} className={styles.form}>
            <ValidatedField name="teamName" label="Nome do time" required minLength={2} />
            <div className={styles.pair}>
              <ValidatedField name="city" label="Cidade" optional />
              <ValidatedField name="initials" label="Sigla" required minLength={2} maxLength={4} />
            </div>
            <MediaUploadField name="crest" label="Escudo do time" description="PNG, JPG, WebP ou GIF. Fundo transparente recomendado." />
            <fieldset className={styles.gameFieldset}>
              <legend>Jogos do time</legend>
              <p>Selecione uma ou mais modalidades.</p>
              <div>
                {data.games.map((game) => (
                  <label key={game.id}>
                    <input name="gameIds" type="checkbox" value={game.id} defaultChecked={game.id === selectedGame?.id} />
                    <span>{game.name}<small>{game.short_name}</small></span>
                  </label>
                ))}
              </div>
            </fieldset>
            <AdminSubmitButton className={styles.primaryButton} pendingLabel="Cadastrando time...">
              <Plus size={16} /> Cadastrar time
            </AdminSubmitButton>
          </form>
        </AdminModal>
        <Link className={styles.teamSeasonLink} href={adminHref('tabela')}>
          <Trophy size={16} /> Temporadas e tabela <ChevronRight size={15} />
        </Link>
      </div>

      <div className={styles.gameFilterBar}>
        <span><Filter size={16} /> Filtrar por jogo</span>
        <div>
          <Link
            href={adminHref('times', undefined, 'all')}
            className={!selectedGame ? styles.activeGameFilter : ''}
          >
            Todos
          </Link>
          {data.games.map((game) => (
            <Link
              key={game.id}
              href={adminHref('times', undefined, game.id)}
              className={game.id === selectedGame?.id ? styles.activeGameFilter : ''}
            >
              {game.name}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.teamCards}>
        {visibleTeams.map((team) => {
          const teamGameIds = data.teamGames.filter((item) => item.team_id === team.id && item.active).map((item) => item.game_id)
          return (
            <article className={styles.teamCard} key={team.id}>
              <div className={styles.teamCrest}>
                {team.crest_url
                  ? <img src={team.crest_url} alt={`Escudo do ${team.name}`} />
                  : <span>{team.initials}</span>}
              </div>
              <div className={styles.teamInfo}><h2>{team.name}</h2><p>{team.city}</p></div>
              <div className={styles.teamGameBadges}>
                {data.games.filter((game) => teamGameIds.includes(game.id)).map((game) => <span key={game.id}>{game.short_name}</span>)}
              </div>
              <div className={styles.teamStats}>
                <span><strong>{userTeamCount(team.id)}</strong> membros</span>
                <span><strong>{teamSeasonCount(team.id)}</strong> temporadas</span>
              </div>
              <div className={styles.teamCardActions}>
                <TeamRosterManager
                  team={team}
                  games={data.games}
                  teamGames={data.teamGames}
                  profiles={data.profiles}
                  memberships={data.memberships}
                  today={today}
                />
                <EditTeamModal
                  team={team}
                  games={data.games}
                  activeGameIds={teamGameIds}
                />
                <DeleteButton table="teams" id={team.id} tab="times" label="Excluir time" gameId={selectedGame?.id} />
              </div>
            </article>
          )
        })}
        {!visibleTeams.length && <div className={styles.empty}><p>Nenhum time cadastrado para este jogo.</p></div>}
      </div>
    </>
  )
}
