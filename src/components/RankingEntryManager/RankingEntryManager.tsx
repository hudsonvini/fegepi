import ConfirmDeleteButton from '@/components/ConfirmDeleteButton/ConfirmDeleteButton'
import ChampionshipPlacements from '@/components/ChampionshipPlacements/ChampionshipPlacements'
import type { RankingEntry } from '@/components/AdminDashboard/types'
import styles from './RankingEntryManager.module.scss'

export default function RankingEntryManager({ entry, position, gameId }: { entry: RankingEntry; position: number; gameId?: string }) {
  return <tr className={styles.row}>
    <td><span className={styles.position}>{position}</span></td>
    <td><div className={styles.team}>
      <div className={styles.crest}>{entry.teams?.crest_url ? <img src={entry.teams.crest_url} alt="" /> : <span>{entry.teams?.initials}</span>}</div>
      <div className={styles.identity}><h3>{entry.teams?.name}</h3><p>{entry.teams?.city || 'Piauí'}</p></div>
    </div></td>
    <td><strong>{entry.titles ?? 0}</strong></td>
    <td>{entry.participations ?? 0}</td>
    <td><strong className={styles.points}>{entry.points}</strong></td>
    <td><ChampionshipPlacements results={entry.recent_placements} /></td>
    <td><ConfirmDeleteButton table="ranking_entries" id={entry.id} tab="tabela" label="Remover" gameId={gameId} /></td>
  </tr>
}
