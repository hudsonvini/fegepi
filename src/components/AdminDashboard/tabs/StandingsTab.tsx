import Link from 'next/link'
import { CalendarDays, ChartNoAxesCombined, Plus, Trophy, UsersRound } from 'lucide-react'
import {
  addTeamToSeasonAction,
  createSeasonAction,
} from '@/app/admin/actions'
import styles from '@/app/admin/page.module.scss'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import RankingEntryManager from '@/components/RankingEntryManager/RankingEntryManager'
import AdminGameSeasonSelector from '../AdminGameSeasonSelector'
import { adminHref } from '../navigation'
import { gameName, SectionTitle } from '../shared'
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
            <p className={styles.automaticHint}>
              O time começa com a pontuação zerada. Vitórias, empates, derrotas, pontos e forma recente serão calculados pelo histórico.
            </p>
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
            <p className={styles.managerHint}>Registre cada resultado e deixe a classificação ser recalculada automaticamente.</p>
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
            <div className={`${styles.tableWrap} ${styles.automaticRankingTable}`}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Equipe</th>
                    <th>V</th>
                    <th>E</th>
                    <th>D</th>
                    <th>Pts</th>
                    <th>Últimas 5</th>
                    <th>Registrar resultado</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.seasonEntries.map((entry, index) => (
                    <RankingEntryManager
                      key={entry.id}
                      entry={entry}
                      position={index + 1}
                      gameId={selectedGame?.id}
                    />
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
