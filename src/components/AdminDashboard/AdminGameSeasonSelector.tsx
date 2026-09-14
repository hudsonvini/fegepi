'use client'

import { useRouter } from 'next/navigation'
import type { Game, Season } from './types'
import { adminHref } from './navigation'
import styles from './AdminGameSeasonSelector.module.scss'

export default function AdminGameSeasonSelector({
  tab = 'tabela',
  games,
  seasons,
  gameId,
  seasonId,
}: {
  tab?: 'tabela' | 'campeonatos'
  games: Game[]
  seasons: Season[]
  gameId?: string
  seasonId?: string
}) {
  const router = useRouter()
  const gameSeasons = seasons.filter((season) => season.game_id === gameId)

  return (
    <div className={styles.selector}>
      <label>
        <span>Jogo</span>
        <select
          value={gameId ?? ''}
          onChange={(event) => {
            const firstSeason = seasons.find((season) => season.game_id === event.target.value)
            router.push(adminHref(tab, firstSeason?.id, event.target.value))
          }}
        >
          {games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
        </select>
      </label>
      <label>
        <span>Temporada</span>
        <select
          value={seasonId ?? ''}
          onChange={(event) => router.push(adminHref(tab, event.target.value, gameId))}
          disabled={!gameSeasons.length}
        >
          {!gameSeasons.length && <option value="">Nenhuma temporada</option>}
          {gameSeasons.map((season) => <option key={season.id} value={season.id}>{season.label}</option>)}
        </select>
      </label>
    </div>
  )
}
