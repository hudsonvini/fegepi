import { Trophy } from 'lucide-react'
import { placementLabel, type RecentPlacement } from '@/lib/championships'
import styles from './ChampionshipPlacements.module.scss'

export default function ChampionshipPlacements({ results = [] }: { results?: RecentPlacement[] }) {
  return <div className={styles.placements} aria-label="Últimos cinco campeonatos, do mais recente ao mais antigo">
    {Array.from({ length: 5 }, (_, index) => {
      const result = results[index]
      const place = result?.placement
      const highlighted = place != null && place >= 1 && place <= 8
      return <span key={result?.id ?? index} className={`${styles.badge} ${highlighted ? styles[`place${place}`] : styles.empty}`} title={placementLabel(result)} aria-label={placementLabel(result)}>
        <Trophy size={13} aria-hidden="true" /><b>{highlighted ? `${place}º` : '—'}</b>
      </span>
    })}
  </div>
}
