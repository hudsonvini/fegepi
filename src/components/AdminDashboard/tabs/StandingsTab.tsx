import Link from 'next/link'
import AdminModal from '@/components/AdminModal/AdminModal'
import ui from './ChampionshipsTab.module.scss'
import { ChartNoAxesCombined, Plus, Trophy, UsersRound } from 'lucide-react'
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
    ? data.teams.filter((team) => team.active &&
      data.teamGames.some((item) => item.team_id === team.id && item.game_id === selectedGame.id && item.active)
      && !participatingTeamIds.has(team.id))
    : []

  return (
    <>
      <SectionTitle
        eyebrow="Campeonatos"
        title="Temporadas e tabela"
        description="Crie temporadas e inclua times. A pontuação vem dos campeonatos concluídos."
      />

      {!data.championshipsAvailable && <p role="alert">A integração de campeonatos ainda precisa ser ativada no banco. A pontuação será exibida após a configuração.</p>}
      <Link href={adminHref('campeonatos', selectedSeason?.id, selectedGame?.id)}>Administrar campeonatos →</Link>
      <AdminGameSeasonSelector
        games={data.games}
        seasons={data.seasons}
        gameId={selectedGame?.id}
        seasonId={selectedSeason?.id}
      />

      <div className={ui.toolbar}>
        <div><h2>Organizar temporada</h2><p>Cadastre a temporada e escolha as equipes participantes.</p></div>
        <div className={ui.actions}>
        <AdminModal key={`season-${selectedSeason?.id}`} title="Preparar temporada" triggerLabel="Nova temporada" description="Crie uma temporada para a modalidade selecionada.">
          <form action={createSeasonAction} className={styles.form}>
            <input type="hidden" name="gameId" value={selectedGame?.id ?? ''} />
            <p className={styles.contextInfo}>Criando para <strong>{selectedGame?.name ?? 'o jogo selecionado'}</strong></p>
            <label>Nome da temporada<input name="label" required placeholder="Ex.: Temporada 2026" /></label>
            <label className={styles.check}>
              <input name="isCurrent" type="checkbox" /> Definir como temporada atual
            </label>
            <AdminSubmitButton className={styles.primaryButton} pendingLabel="Criando temporada...">
              <Plus size={16} /> Criar temporada
            </AdminSubmitButton>
          </form>
        </AdminModal>
        <AdminModal key={`team-${selectedSeason?.id}-${data.seasonEntries.length}`} title="Adicionar time à tabela" triggerLabel="Adicionar time" description="Selecione uma equipe vinculada à modalidade desta temporada.">
          <form action={addTeamToSeasonAction} className={styles.form}>
            <input type="hidden" name="seasonId" value={selectedSeason?.id ?? ''} />
            <input type="hidden" name="gameId" value={selectedGame?.id ?? ''} />
            <p className={styles.contextInfo}>{selectedSeason ? <>Tabela: <strong>{selectedSeason.label}</strong></> : 'Crie uma temporada primeiro.'}</p>
            <select name="teamId" aria-label="Time participante" required defaultValue="">
              <option value="" disabled>Selecione o time</option>
              {eligibleTeams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <p className={styles.automaticHint}>
              O time começa com zero pontos. Cadastre os campeonatos e suas colocações na aba Campeonatos.
            </p>
            <AdminSubmitButton className={styles.primaryButton} pendingLabel="Incluindo time..." disabled={!selectedSeason || !eligibleTeams.length}>
              <Plus size={16} /> Incluir na tabela
            </AdminSubmitButton>
          </form>
        </AdminModal>
        </div>
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
            <p className={styles.managerHint}>1º: 250 · 2º: 200 · 3º: 100 · 4º: 80 · 5º: 60 · 6º: 40 · 7º: 20 · 8º: 10 pts. Os resultados são administrados nos campeonatos.</p>
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
              <span><ChartNoAxesCombined size={16} />Desempate por títulos e nome do time</span>
            </div>
            <div className={`${styles.tableWrap} ${styles.automaticRankingTable}`}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Equipe</th>
                    <th>Títulos</th>
                    <th>Participações</th>
                    <th>Pts</th>
                    <th>Últimos 5 campeonatos</th>
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
