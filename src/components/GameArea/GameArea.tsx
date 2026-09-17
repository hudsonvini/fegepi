'use client'

import { useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, ChevronRight, Minus, Gamepad2, LockKeyhole } from 'lucide-react'
import ChampionshipPlacements from '@/components/ChampionshipPlacements/ChampionshipPlacements'
import type { RecentPlacement } from '@/lib/championships'
import styles from './GameArea.module.scss'
import RankingExplainer from './RankingExplainer'

type TeamTone = 'navy' | 'green' | 'red' | 'silver' | 'gold'
type GameTheme = 'cs2' | 'valorant' | 'lol' | 'freefire' | 'fc26'

type RankingEntry = {
    id: string
    teamName: string
    country: string
    points: number
    previousPosition: number
    logoText: string
    crestSrc?: string
    tone: TeamTone
    titles?: number
    participations?: number
    recentPlacements?: RecentPlacement[]
    wins?: number
    draws?: number
    losses?: number
    recentForm?: RecentResult[]
}

type RankingSeason = {
    id: string
    label: string
    entries: RankingEntry[]
}

export type RankingGame = {
    id: string
    name: string
    shortName: string
    cardLabel: string
    theme: GameTheme
    imageSrc: string
    seasons: RankingSeason[]
}

type GameAreaProps = {
    games?: RankingGame[]
    defaultGameId?: string
    defaultSeasonId?: string
    rankingLabel?: string
}

type RankingMovement = 'up' | 'down' | 'same'
type RecentResult = 'win' | 'draw' | 'loss'

type RankedEntry = RankingEntry & {
    currentPosition: number
    movement: RankingMovement
    delta: number
}

function getMovement(currentPosition: number, previousPosition: number): Pick<RankedEntry, 'movement' | 'delta'> {
    if (!previousPosition) return { movement: 'same', delta: 0 }
    if (previousPosition > currentPosition) {
        return {
            movement: 'up',
            delta: previousPosition - currentPosition,
        }
    }

    if (previousPosition < currentPosition) {
        return {
            movement: 'down',
            delta: currentPosition - previousPosition,
        }
    }

    return {
        movement: 'same',
        delta: 0,
    }
}

function formatPoints(points: number) {
    return new Intl.NumberFormat('pt-BR').format(points)
}

function RankingRow({ entry }: { entry: RankedEntry }) {
    const movementCopy = {
        up: `Subiu ${entry.delta} ${entry.delta === 1 ? 'posição' : 'posições'} em relação à última rodada`,
        down: `Desceu ${entry.delta} ${entry.delta === 1 ? 'posição' : 'posições'} em relação à última rodada`,
        same: 'Manteve a mesma posição da última rodada',
    }

    return (
        <div className={styles.rankingRow} role="row">
            <div className={styles.positionCell} role="cell">
                <strong>{entry.currentPosition}</strong>
                <span
                    className={`${styles.movement} ${styles[entry.movement]}`}
                    aria-label={movementCopy[entry.movement]}
                    title={movementCopy[entry.movement]}
                >
                    {entry.movement === 'up' ? <ArrowUp /> : null}
                    {entry.movement === 'down' ? <ArrowDown /> : null}
                    {entry.movement === 'same' ? <Minus /> : null}
                    {entry.delta || '—'}
                </span>
            </div>

            <div className={styles.teamCell} role="cell">
                <div className={styles.logoBadge}>
                    {entry.crestSrc ? (
                        <img src={entry.crestSrc} alt="" />
                    ) : (
                        <span>{entry.logoText}</span>
                    )}
                </div>
                <div>
                    <strong>{entry.teamName}</strong>
                    <span>{entry.country}</span>
                </div>
            </div>

            <strong className={styles.pointsCell} role="cell">{formatPoints(entry.points)} <small>pts</small></strong>
            <span className={styles.recordCell} role="cell" title="Títulos / campeonatos disputados">
                <strong>{entry.titles ?? 0}</strong><i>/</i><strong>{entry.participations ?? 0}</strong>
            </span>
            <div className={styles.placementsCell} role="cell"><ChampionshipPlacements results={entry.recentPlacements} /></div>
        </div>
    )
}

function GameOption({
    game,
    selected,
    onSelect,
    locked = false,
}: {
    game: RankingGame
    selected: boolean
    locked?: boolean
    onSelect: () => void
}) {
    return (
        <button
            type="button"
            className={`${styles.gameOption} ${selected ? styles.selectedGame : ''} ${locked ? styles.lockedGame : ''}`}
            onClick={onSelect}
            disabled={locked}
            title={locked ? `${game.name}: em breve` : game.name}
            aria-pressed={selected}
        >
            <span className={`${styles.gameThumb} ${styles[game.theme]}`}>
                <img src={game.imageSrc} alt="" />
            </span>
            <span className={styles.gameOptionCopy}>
                <small>{locked ? <><LockKeyhole size={11} /> Em breve</> : selected ? 'Selecionado' : ''}</small>
                <strong>{game.name}</strong>
            </span>
            <div
                className={styles.gameArrow}
                aria-hidden="true"
            >
                <ChevronRight />
            </div>
        </button>
    )
}

export default function GameArea({
    games = [],
    defaultSeasonId,
    rankingLabel = 'Piauí Ranking',
}: GameAreaProps) {
    const csGame = games.find((game) => game.theme === 'cs2')
    const fallbackGameId = csGame?.id ?? ''
    const initialGame = games.find((game) => game.id === fallbackGameId)

    const [selectedGameId, setSelectedGameId] = useState(initialGame?.id ?? '')
    const [selectedSeasonId, setSelectedSeasonId] = useState(defaultSeasonId ?? initialGame?.seasons[0]?.id ?? '')
    const [isPending, startTransition] = useTransition()
    const [page, setPage] = useState(1)

    const selectedGame = games.find((game) => game.id === selectedGameId && game.theme === 'cs2') ?? csGame

    if (!selectedGame) {
        return null
    }

    const resolvedSeasonId = selectedGame.seasons.some((season) => season.id === selectedSeasonId)
        ? selectedSeasonId
        : selectedGame.seasons[0]?.id ?? ''

    const selectedSeason =
        selectedGame.seasons.find((season) => season.id === resolvedSeasonId) ?? selectedGame.seasons[0]

    const rankedEntries: RankedEntry[] = [...(selectedSeason?.entries ?? [])]
        .sort((firstEntry, secondEntry) => secondEntry.points - firstEntry.points || (secondEntry.titles ?? 0) - (firstEntry.titles ?? 0) || firstEntry.teamName.localeCompare(secondEntry.teamName, 'pt-BR'))
        .map((entry, index) => {
            const currentPosition = index + 1
            const { movement, delta } = getMovement(currentPosition, entry.previousPosition)

            return {
                ...entry,
                currentPosition,
                movement,
                delta,
            }
        })

    const pageCount = Math.max(1, Math.ceil(rankedEntries.length / 10))
    const currentPage = Math.min(page, pageCount)
    const visibleEntries = rankedEntries.slice((currentPage - 1) * 10, currentPage * 10)

    return (
        <section className={styles.container}>
            <div className={styles.contentArea}>
                <header className={styles.sectionHeading}>
                    <span>Ranking oficial FEGEPi</span>
                    <h2>Classificação dos times</h2>
                    <p>Acompanhe o desempenho das equipes em cada modalidade e temporada.</p>
                </header>

                    <div className={styles.gameSelector}>
                        <div className={styles.asideHeader}>
                            {/* <small>Modalidades</small> */}
                            <h3><Gamepad2 /> Escolha o jogo</h3>
                            <p>A tabela será atualizada com a classificação da modalidade selecionada.</p>
                        </div>
                        <div className={styles.gamesList}>
                            {games.map((game) => (
                                <GameOption
                                    key={game.id}
                                    game={game}
                                    locked={game.theme !== 'cs2'}
                                    selected={selectedGame.id === game.id}
                                    onSelect={() => startTransition(() => {
                                        setSelectedGameId(game.id)
                                        setPage(1)
                                        setSelectedSeasonId(game.seasons[0]?.id ?? '')
                                    })}
                                />
                            ))}
                        </div>
                    </div>

                <div className={styles.layout}>
                    <div className={`${styles.rankingPanel} ${isPending ? styles.pending : ''}`}>
                        <div className={styles.panelHeader}>
                            <div className={styles.titleBlock}>
                                <span className={styles.trophyBadge}>
                                    <img src="/images/GameAreaImages/gameAreaCs.png" alt="" />
                                </span>
                                <div>
                                    <small>{rankingLabel}</small>
                                    <h3>{selectedGame.name}</h3>
                                </div>
                            </div>

                            <div className={styles.seasonTabs} role="tablist" aria-label="Temporadas">
                                {selectedGame.seasons.map((season) => (
                                    <button
                                        key={season.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={season.id === resolvedSeasonId}
                                        className={season.id === resolvedSeasonId ? styles.selectedSeason : ''}
                                        onClick={() => startTransition(() => { setSelectedSeasonId(season.id); setPage(1) })}
                                    >
                                        {season.label.replace(/temporada/gi, '').trim()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.tableHeader} role="row">
                            <span>#</span>
                            <span>Equipe</span>
                            <span>Pontuação</span>
                            <span>Títulos / Eventos</span>
                            <span>Últimos 5 campeonatos</span>
                        </div>

                        <div className={styles.rankingTable} role="table" aria-label={`Classificação de ${selectedGame.name}`}>
                            {rankedEntries.length ? visibleEntries.map((entry) => (
                                <RankingRow key={entry.id} entry={entry} />
                            )) : (
                                <div className={styles.emptyRanking}>Nenhum time cadastrado nesta temporada.</div>
                            )}
                        </div>
                        {rankedEntries.length > 10 && <nav className={styles.pagination} aria-label="Páginas do ranking">
                            <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</button>
                            <span aria-live="polite">Página {currentPage} de {pageCount} · {rankedEntries.length} times</span>
                            <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Próxima</button>
                        </nav>}
                    </div>

                    <RankingExplainer />
                </div>
            </div>
        </section>
    )
}
