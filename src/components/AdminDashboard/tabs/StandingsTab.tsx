import Link from 'next/link'
import { CalendarDays, ChartNoAxesCombined, Plus, Trophy, UsersRound } from 'lucide-react'
import {
  addTeamToSeasonAction,
  createSeasonAction,
  updateRankingEntryAction,
} from '@/app/admin/actions'
import styles from '@/app/admin/page.module.scss'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import AdminGameSeasonSelector from '../AdminGameSeasonSelector'
import { adminHref } from '../navigation'
import { DeleteButton, gameName, SectionTitle } from '../shared'
import type { AdminData } from '../types'

export default function StandingsTab({ data }: { data: AdminData }) {
  const selectedSeason = data.selectedSeason
  const selectedGame = data.selectedGame
  const gameSeasons = data.seasons.filter((season) => season.game_id === selectedGame?.id)
  const participatingTeamIds = new Set(data.seasonEntries.map((entry) => entry.team_id))
  const eligibleTeams = selectedGame
    ? data.teams.filter((team) =>
      data.teamGames.some((item) => item.team_id === team.id && item.game_id === selectedGame.id && item.active)
      && !participatingTeamIds.has(team.id))
    : []

  return (
    <>
      <SectionTitle
        eyebrow="Campeonatos"
        title="Temporadas e tabela"
        description="Organize as temporadas e atualize a mesma classificação exibida na página inicial."
      />

      <AdminGameSeasonSelector
        games={data.games}
        seasons={data.seasons}
        gameId={selectedGame?.id}
        seasonId={selectedSeason?.id}
      />

      <div className={styles.seasonLayout}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div><p className={styles.eyebrow}>Nova temporada</p><h2>Preparar campeonato</h2></div>
            <CalendarDays size={21} />
          </div>
          <form action={createSeasonAction} className={styles.form}>
            <input type="hidden" name="gameId" value={selectedGame?.id ?? ''} />
            <p className={styles.contextInfo}>Criando para <strong>{selectedGame?.name ?? 'o jogo selecionado'}</strong></p>
            <input name="label" required placeholder="Ex.: Temporada 2026" />
            <label className={styles.check}>
              <input name="isCurrent" type="checkbox" /> Definir como temporada atual
            </label>
            <AdminSubmitButton className={styles.primaryButton} pendingLabel="Criando temporada...">
              <Plus size={16} /> Criar temporada
            </AdminSubmitButton>
          </form>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div><p className={styles.eyebrow}>Participantes</p><h2>Adicionar time à tabela</h2></div>
            <UsersRound size={21} />
          </div>
          <form action={addTeamToSeasonAction} className={styles.form}>
            <input type="hidden" name="seasonId" value={selectedSeason?.id ?? ''} />
            <input type="hidden" name="gameId" value={selectedGame?.id ?? ''} />
            <p className={styles.contextInfo}>{selectedSeason ? <>Tabela: <strong>{selectedSeason.label}</strong></> : 'Crie uma temporada primeiro.'}</p>
            <select name="teamId" required defaultValue="">
              <option value="" disabled>Selecione o time</option>
              {eligibleTeams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <div className={styles.statsInputs}>
              <label>Vitórias<input name="wins" type="number" min="0" defaultValue="0" /></label>
              <label>Empates<input name="draws" type="number" min="0" defaultValue="0" /></label>
              <label>Derrotas<input name="losses" type="number" min="0" defaultValue="0" /></label>
              <label>Pontos<input name="points" type="number" min="0" defaultValue="0" /></label>
            </div>
            <input name="previousPosition" type="number" min="0" defaultValue="0" placeholder="Posição anterior" />
            <label className={styles.recentFormLabel}>
              Últimas 5 partidas
              <span>V = vitória, E = empate, D = derrota</span>
              <div className={styles.recentFormEditor}>
                {Array.from({ length: 5 }, (_, index) => (
                  <select key={index} name="recentForm" defaultValue="" aria-label={`Resultado da ${index + 1}ª partida mais recente`}>
                    <option value="">—</option>
                    <option value="W">V</option>
                    <option value="D">E</option>
                    <option value="L">D</option>
                  </select>
                ))}
              </div>
            </label>
            <AdminSubmitButton className={styles.primaryButton} pendingLabel="Incluindo time..." disabled={!selectedSeason || !eligibleTeams.length}>
              <Plus size={16} /> Incluir na tabela
            </AdminSubmitButton>
          </form>
        </section>
      </div>

      <section className={`${styles.panel} ${styles.standingsPanel}`}>
        <div className={`${styles.panelHead} ${styles.rankingManagerHead}`}>
          <div>
            <p className={styles.eyebrow}>Classificação</p>
            <h2>
              {selectedSeason
                ? `${gameName(selectedSeason.games)} — ${selectedSeason.label}`
              : 'Escolha ou crie uma temporada'}
            </h2>
            <p className={styles.managerHint}>Edite os números abaixo e salve cada linha individualmente.</p>
          </div>
          {selectedSeason?.is_current && <span className={styles.currentBadge}>Temporada atual</span>}
        </div>

        <div className={styles.seasonTabs}>
          {gameSeasons.map((season) => (
            <Link
              key={season.id}
              href={adminHref('tabela', season.id, selectedGame?.id)}
              className={season.id === selectedSeason?.id ? styles.activeSeason : ''}
            >
              {gameName(season.games)}
              <strong>{season.label}</strong>
            </Link>
          ))}
        </div>

        {selectedSeason ? data.seasonEntries.length ? (
          <>
            <div className={styles.rankingSummary}>
              <span><Trophy size={16} /><strong>{data.seasonEntries[0]?.teams?.name}</strong> líder atual</span>
              <span><UsersRound size={16} /><strong>{data.seasonEntries.length}</strong> times participantes</span>
              <span><ChartNoAxesCombined size={16} />Ordenação automática por pontos e vitórias</span>
            </div>
            <div className={`${styles.tableWrap} ${styles.rankingAdminTable}`}>
            <table>
              <thead>
                <tr><th>#</th><th>Equipe</th><th>Vitórias</th><th>Empates</th><th>Derrotas</th><th>Pontos</th><th>Pos. anterior</th><th>Últimas 5</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {data.seasonEntries.map((entry, index) => (
                  <tr key={entry.id}>
                    <td><span className={styles.position}>{index + 1}</span></td>
                    <td>
                      <div className={styles.tableTeam}>
                        {entry.teams?.crest_url
                          ? <img src={entry.teams.crest_url} alt="" />
                          : <span>{entry.teams?.initials}</span>}
                        <div>
                          <strong>{entry.teams?.name}</strong>
                          <small>{entry.teams?.city || 'Piauí'}</small>
                        </div>
                      </div>
                    </td>
                    <td><input form={`entry-${entry.id}`} name="wins" type="number" min="0" defaultValue={entry.wins} aria-label={`Vitórias de ${entry.teams?.name}`} /></td>
                    <td><input form={`entry-${entry.id}`} name="draws" type="number" min="0" defaultValue={entry.draws} aria-label={`Empates de ${entry.teams?.name}`} /></td>
                    <td><input form={`entry-${entry.id}`} name="losses" type="number" min="0" defaultValue={entry.losses} aria-label={`Derrotas de ${entry.teams?.name}`} /></td>
                    <td><input form={`entry-${entry.id}`} name="points" type="number" min="0" defaultValue={entry.points} aria-label={`Pontos de ${entry.teams?.name}`} /></td>
                    <td><input form={`entry-${entry.id}`} name="previousPosition" type="number" min="0" defaultValue={entry.previous_position} aria-label={`Posição anterior de ${entry.teams?.name}`} /></td>
                    <td>
                      <div className={styles.recentFormEditor}>
                        {Array.from({ length: 5 }, (_, resultIndex) => (
                          <select
                            key={resultIndex}
                            form={`entry-${entry.id}`}
                            name="recentForm"
                            defaultValue={entry.recent_form?.[resultIndex] ?? ''}
                            aria-label={`${resultIndex + 1}º resultado recente de ${entry.teams?.name}`}
                          >
                            <option value="">—</option>
                            <option value="W">V</option>
                            <option value="D">E</option>
                            <option value="L">D</option>
                          </select>
                        ))}
                      </div>
                    </td>
                    <td>
                      <form id={`entry-${entry.id}`} action={updateRankingEntryAction}>
                        <input type="hidden" name="entryId" value={entry.id} />
                        <input type="hidden" name="seasonId" value={selectedSeason.id} />
                        <input type="hidden" name="gameId" value={selectedGame?.id ?? ''} />
                        <button className={styles.saveRow}>Salvar linha</button>
                      </form>
                      <DeleteButton table="ranking_entries" id={entry.id} tab="tabela" label="Remover" gameId={selectedGame?.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <div className={styles.empty}><p>Nenhum time participa desta temporada ainda.</p></div>
        ) : (
          <div className={styles.empty}><p>Crie a primeira temporada para montar a tabela.</p></div>
        )}
      </section>
    </>
  )
}
