'use client'

import { useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Minus } from 'lucide-react'
import styles from './GameArea.module.scss'

type TeamTone = 'navy' | 'green' | 'red' | 'silver' | 'gold'
type GameTheme = 'cs2' | 'valorant' | 'lol' | 'freefire' | 'fc26'

type RankingEntry = {
    id: string
    teamName: string
    country: string
    points: number
    previousPosition: number
    logoText: string
    tone: TeamTone
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
    seasons: RankingSeason[]
}

type GameAreaProps = {
    games?: RankingGame[]
    defaultGameId?: string
    defaultSeasonId?: string
    rankingLabel?: string
}

type RankingMovement = 'up' | 'down' | 'same'

type RankedEntry = RankingEntry & {
    currentPosition: number
    movement: RankingMovement
    delta: number
}

const defaultGames: RankingGame[] = [
    {
        id: 'cs2',
        name: 'Counter-Strike 2',
        shortName: 'CS2',
        cardLabel: 'Counter-Strike 2',
        theme: 'cs2',
        seasons: [
            {
                id: '2026',
                label: 'Temporada 2026',
                entries: [
                    { id: '1', teamName: 'Alpha Wolves', country: 'Piauí', points: 6770, previousPosition: 2, logoText: 'AW', tone: 'navy' },
                    { id: '2', teamName: 'Delta Force', country: 'Parnaíba', points: 6540, previousPosition: 1, logoText: 'DF', tone: 'red' },
                    { id: '3', teamName: 'Caatinga Core', country: 'Teresina', points: 6415, previousPosition: 5, logoText: 'CC', tone: 'green' },
                    { id: '4', teamName: 'Nordeste Rush', country: 'Picos', points: 6270, previousPosition: 3, logoText: 'NR', tone: 'red' },
                    { id: '5', teamName: 'Sertao Tactics', country: 'Floriano', points: 6145, previousPosition: 7, logoText: 'ST', tone: 'green' },
                    { id: '6', teamName: 'Vortex Piaui', country: 'Campo Maior', points: 5980, previousPosition: 4, logoText: 'VP', tone: 'silver' },
                    { id: '7', teamName: 'Dragons Five', country: 'Barras', points: 5810, previousPosition: 6, logoText: 'D5', tone: 'gold' },
                    { id: '8', teamName: 'Bravos Squad', country: 'Piripiri', points: 5695, previousPosition: 9, logoText: 'BS', tone: 'green' },
                    { id: '9', teamName: 'Shadow Unit', country: 'União', points: 5520, previousPosition: 8, logoText: 'SU', tone: 'silver' },
                    { id: '10', teamName: 'Rangers 1910', country: 'Esperantina', points: 5330, previousPosition: 11, logoText: 'R1', tone: 'green' },
                    { id: '11', teamName: 'Prime Legacy', country: 'Altos', points: 5190, previousPosition: 10, logoText: 'PL', tone: 'silver' },
                    { id: '12', teamName: 'Arenas Club', country: 'José de Freitas', points: 5045, previousPosition: 12, logoText: 'AC', tone: 'silver' },
                ],
            },
            {
                id: '2025',
                label: 'Temporada 2025',
                entries: [
                    { id: '13', teamName: 'Delta Force', country: 'Parnaíba', points: 6620, previousPosition: 2, logoText: 'DF', tone: 'red' },
                    { id: '14', teamName: 'Alpha Wolves', country: 'Piauí', points: 6490, previousPosition: 1, logoText: 'AW', tone: 'navy' },
                    { id: '15', teamName: 'Vortex Piaui', country: 'Campo Maior', points: 6330, previousPosition: 5, logoText: 'VP', tone: 'silver' },
                    { id: '16', teamName: 'Sertao Tactics', country: 'Floriano', points: 6210, previousPosition: 3, logoText: 'ST', tone: 'green' },
                    { id: '17', teamName: 'Caatinga Core', country: 'Teresina', points: 6135, previousPosition: 4, logoText: 'CC', tone: 'green' },
                    { id: '18', teamName: 'Nordeste Rush', country: 'Picos', points: 5990, previousPosition: 8, logoText: 'NR', tone: 'red' },
                    { id: '19', teamName: 'Dragons Five', country: 'Barras', points: 5805, previousPosition: 6, logoText: 'D5', tone: 'gold' },
                    { id: '20', teamName: 'Prime Legacy', country: 'Altos', points: 5665, previousPosition: 10, logoText: 'PL', tone: 'silver' },
                    { id: '21', teamName: 'Bravos Squad', country: 'Piripiri', points: 5515, previousPosition: 7, logoText: 'BS', tone: 'green' },
                    { id: '22', teamName: 'Arenas Club', country: 'José de Freitas', points: 5400, previousPosition: 9, logoText: 'AC', tone: 'silver' },
                    { id: '23', teamName: 'Shadow Unit', country: 'União', points: 5220, previousPosition: 11, logoText: 'SU', tone: 'silver' },
                    { id: '24', teamName: 'Rangers 1910', country: 'Esperantina', points: 5105, previousPosition: 12, logoText: 'R1', tone: 'silver' },
                ],
            },
        ],
    },
    {
        id: 'valorant',
        name: 'Valorant',
        shortName: 'V',
        cardLabel: 'VALORANT',
        theme: 'valorant',
        seasons: [
            {
                id: '2026',
                label: 'Temporada 2026',
                entries: [
                    { id: '25', teamName: 'Spike Hunters', country: 'Teresina', points: 7020, previousPosition: 1, logoText: 'SH', tone: 'red' },
                    { id: '26', teamName: 'Ion Storm', country: 'Picos', points: 6880, previousPosition: 3, logoText: 'IS', tone: 'green' },
                    { id: '27', teamName: 'Rush Protocol', country: 'Parnaíba', points: 6715, previousPosition: 2, logoText: 'RP', tone: 'navy' },
                    { id: '28', teamName: 'Aim District', country: 'Barras', points: 6505, previousPosition: 5, logoText: 'AD', tone: 'green' },
                    { id: '29', teamName: 'Echo Seven', country: 'Floriano', points: 6390, previousPosition: 4, logoText: 'E7', tone: 'silver' },
                    { id: '30', teamName: 'Radiant Zone', country: 'Campo Maior', points: 6275, previousPosition: 8, logoText: 'RZ', tone: 'green' },
                    { id: '31', teamName: 'Nova Duelists', country: 'União', points: 6150, previousPosition: 6, logoText: 'ND', tone: 'red' },
                    { id: '32', teamName: 'Phantom Club', country: 'Altos', points: 6015, previousPosition: 9, logoText: 'PC', tone: 'green' },
                    { id: '33', teamName: 'Orbital Five', country: 'Esperantina', points: 5890, previousPosition: 7, logoText: 'O5', tone: 'silver' },
                    { id: '34', teamName: 'Tactical One', country: 'Piripiri', points: 5735, previousPosition: 10, logoText: 'T1', tone: 'silver' },
                ],
            },
            {
                id: '2025',
                label: 'Temporada 2025',
                entries: [
                    { id: '35', teamName: 'Rush Protocol', country: 'Parnaíba', points: 6945, previousPosition: 2, logoText: 'RP', tone: 'navy' },
                    { id: '36', teamName: 'Spike Hunters', country: 'Teresina', points: 6820, previousPosition: 1, logoText: 'SH', tone: 'red' },
                    { id: '37', teamName: 'Ion Storm', country: 'Picos', points: 6630, previousPosition: 4, logoText: 'IS', tone: 'green' },
                    { id: '38', teamName: 'Echo Seven', country: 'Floriano', points: 6490, previousPosition: 3, logoText: 'E7', tone: 'silver' },
                    { id: '39', teamName: 'Aim District', country: 'Barras', points: 6315, previousPosition: 6, logoText: 'AD', tone: 'green' },
                    { id: '40', teamName: 'Nova Duelists', country: 'União', points: 6175, previousPosition: 5, logoText: 'ND', tone: 'red' },
                    { id: '41', teamName: 'Phantom Club', country: 'Altos', points: 6035, previousPosition: 8, logoText: 'PC', tone: 'green' },
                    { id: '42', teamName: 'Orbital Five', country: 'Esperantina', points: 5895, previousPosition: 7, logoText: 'O5', tone: 'silver' },
                    { id: '43', teamName: 'Radiant Zone', country: 'Campo Maior', points: 5775, previousPosition: 10, logoText: 'RZ', tone: 'green' },
                    { id: '44', teamName: 'Tactical One', country: 'Piripiri', points: 5660, previousPosition: 9, logoText: 'T1', tone: 'silver' },
                ],
            },
        ],
    },
    {
        id: 'lol',
        name: 'League of Legends',
        shortName: 'LoL',
        cardLabel: 'LEAGUE OF LEGENDS',
        theme: 'lol',
        seasons: [
            {
                id: '2026',
                label: 'Temporada 2026',
                entries: [
                    { id: '45', teamName: 'Summoners PI', country: 'Teresina', points: 7210, previousPosition: 2, logoText: 'SP', tone: 'gold' },
                    { id: '46', teamName: 'Baron Fight', country: 'Parnaíba', points: 7055, previousPosition: 1, logoText: 'BF', tone: 'red' },
                    { id: '47', teamName: 'Blue Nexus', country: 'Picos', points: 6920, previousPosition: 4, logoText: 'BN', tone: 'green' },
                    { id: '48', teamName: 'Dragon Soul', country: 'Floriano', points: 6760, previousPosition: 3, logoText: 'DS', tone: 'silver' },
                    { id: '49', teamName: 'Mid River', country: 'Altos', points: 6615, previousPosition: 6, logoText: 'MR', tone: 'green' },
                    { id: '50', teamName: 'Top Lane Five', country: 'União', points: 6445, previousPosition: 5, logoText: 'TL', tone: 'navy' },
                    { id: '51', teamName: 'Bot Priority', country: 'Piripiri', points: 6310, previousPosition: 8, logoText: 'BP', tone: 'green' },
                    { id: '52', teamName: 'Jungle Pulse', country: 'Campo Maior', points: 6170, previousPosition: 7, logoText: 'JP', tone: 'silver' },
                    { id: '53', teamName: 'Vision Ward', country: 'Esperantina', points: 6030, previousPosition: 10, logoText: 'VW', tone: 'green' },
                    { id: '54', teamName: 'Silver Arrows', country: 'Barras', points: 5920, previousPosition: 9, logoText: 'SA', tone: 'silver' },
                ],
            },
            {
                id: '2025',
                label: 'Temporada 2025',
                entries: [
                    { id: '55', teamName: 'Baron Fight', country: 'Parnaíba', points: 7090, previousPosition: 2, logoText: 'BF', tone: 'red' },
                    { id: '56', teamName: 'Summoners PI', country: 'Teresina', points: 6975, previousPosition: 1, logoText: 'SP', tone: 'gold' },
                    { id: '57', teamName: 'Dragon Soul', country: 'Floriano', points: 6815, previousPosition: 4, logoText: 'DS', tone: 'silver' },
                    { id: '58', teamName: 'Blue Nexus', country: 'Picos', points: 6695, previousPosition: 3, logoText: 'BN', tone: 'green' },
                    { id: '59', teamName: 'Top Lane Five', country: 'União', points: 6540, previousPosition: 6, logoText: 'TL', tone: 'navy' },
                    { id: '60', teamName: 'Mid River', country: 'Altos', points: 6405, previousPosition: 5, logoText: 'MR', tone: 'green' },
                    { id: '61', teamName: 'Jungle Pulse', country: 'Campo Maior', points: 6230, previousPosition: 8, logoText: 'JP', tone: 'silver' },
                    { id: '62', teamName: 'Bot Priority', country: 'Piripiri', points: 6125, previousPosition: 7, logoText: 'BP', tone: 'green' },
                    { id: '63', teamName: 'Silver Arrows', country: 'Barras', points: 5960, previousPosition: 10, logoText: 'SA', tone: 'silver' },
                    { id: '64', teamName: 'Vision Ward', country: 'Esperantina', points: 5820, previousPosition: 9, logoText: 'VW', tone: 'green' },
                ],
            },
        ],
    },
    {
        id: 'freefire',
        name: 'Free Fire',
        shortName: 'FF',
        cardLabel: 'FREE FIRE',
        theme: 'freefire',
        seasons: [
            {
                id: '2026',
                label: 'Temporada 2026',
                entries: [
                    { id: '65', teamName: 'Booyah Elite', country: 'Teresina', points: 6950, previousPosition: 1, logoText: 'BE', tone: 'red' },
                    { id: '66', teamName: 'Drop Zone', country: 'Parnaíba', points: 6785, previousPosition: 4, logoText: 'DZ', tone: 'green' },
                    { id: '67', teamName: 'Safe Circle', country: 'Picos', points: 6640, previousPosition: 2, logoText: 'SC', tone: 'silver' },
                    { id: '68', teamName: 'Rush Island', country: 'Barras', points: 6495, previousPosition: 3, logoText: 'RI', tone: 'red' },
                    { id: '69', teamName: 'Bermuda Kings', country: 'Campo Maior', points: 6365, previousPosition: 6, logoText: 'BK', tone: 'green' },
                    { id: '70', teamName: 'Nova Queda', country: 'Floriano', points: 6210, previousPosition: 5, logoText: 'NQ', tone: 'silver' },
                    { id: '71', teamName: 'Final Zone', country: 'Piripiri', points: 6080, previousPosition: 8, logoText: 'FZ', tone: 'green' },
                    { id: '72', teamName: 'Loot Masters', country: 'Esperantina', points: 5960, previousPosition: 7, logoText: 'LM', tone: 'silver' },
                ],
            },
            {
                id: '2025',
                label: 'Temporada 2025',
                entries: [
                    { id: '73', teamName: 'Safe Circle', country: 'Picos', points: 6815, previousPosition: 2, logoText: 'SC', tone: 'silver' },
                    { id: '74', teamName: 'Booyah Elite', country: 'Teresina', points: 6750, previousPosition: 1, logoText: 'BE', tone: 'red' },
                    { id: '75', teamName: 'Drop Zone', country: 'Parnaíba', points: 6610, previousPosition: 5, logoText: 'DZ', tone: 'green' },
                    { id: '76', teamName: 'Rush Island', country: 'Barras', points: 6470, previousPosition: 3, logoText: 'RI', tone: 'red' },
                    { id: '77', teamName: 'Nova Queda', country: 'Floriano', points: 6335, previousPosition: 4, logoText: 'NQ', tone: 'silver' },
                    { id: '78', teamName: 'Bermuda Kings', country: 'Campo Maior', points: 6195, previousPosition: 7, logoText: 'BK', tone: 'green' },
                    { id: '79', teamName: 'Loot Masters', country: 'Esperantina', points: 6050, previousPosition: 6, logoText: 'LM', tone: 'silver' },
                    { id: '80', teamName: 'Final Zone', country: 'Piripiri', points: 5910, previousPosition: 8, logoText: 'FZ', tone: 'green' },
                ],
            },
        ],
    },
    {
        id: 'fc26',
        name: 'EA Sports FC 26',
        shortName: 'FC26',
        cardLabel: 'FC26',
        theme: 'fc26',
        seasons: [
            {
                id: '2026',
                label: 'Temporada 2026',
                entries: [
                    { id: '81', teamName: 'Piaui United', country: 'Teresina', points: 7125, previousPosition: 3, logoText: 'PU', tone: 'green' },
                    { id: '82', teamName: 'Arena 26', country: 'Parnaíba', points: 7045, previousPosition: 1, logoText: 'A26', tone: 'red' },
                    { id: '83', teamName: 'Capital Eleven', country: 'Picos', points: 6910, previousPosition: 2, logoText: 'CE', tone: 'silver' },
                    { id: '84', teamName: 'Nordeste Pro', country: 'Altos', points: 6765, previousPosition: 5, logoText: 'NP', tone: 'green' },
                    { id: '85', teamName: 'Gameplan Club', country: 'Floriano', points: 6600, previousPosition: 4, logoText: 'GC', tone: 'navy' },
                    { id: '86', teamName: 'Meta Football', country: 'União', points: 6435, previousPosition: 7, logoText: 'MF', tone: 'green' },
                    { id: '87', teamName: 'Pro League PI', country: 'Piripiri', points: 6295, previousPosition: 6, logoText: 'PL', tone: 'silver' },
                    { id: '88', teamName: 'Kickoff Squad', country: 'Esperantina', points: 6155, previousPosition: 8, logoText: 'KS', tone: 'silver' },
                ],
            },
            {
                id: '2025',
                label: 'Temporada 2025',
                entries: [
                    { id: '89', teamName: 'Arena 26', country: 'Parnaíba', points: 7085, previousPosition: 2, logoText: 'A26', tone: 'red' },
                    { id: '90', teamName: 'Capital Eleven', country: 'Picos', points: 6965, previousPosition: 1, logoText: 'CE', tone: 'silver' },
                    { id: '91', teamName: 'Piaui United', country: 'Teresina', points: 6875, previousPosition: 4, logoText: 'PU', tone: 'green' },
                    { id: '92', teamName: 'Gameplan Club', country: 'Floriano', points: 6690, previousPosition: 3, logoText: 'GC', tone: 'navy' },
                    { id: '93', teamName: 'Nordeste Pro', country: 'Altos', points: 6550, previousPosition: 6, logoText: 'NP', tone: 'green' },
                    { id: '94', teamName: 'Pro League PI', country: 'Piripiri', points: 6380, previousPosition: 5, logoText: 'PL', tone: 'silver' },
                    { id: '95', teamName: 'Meta Football', country: 'União', points: 6225, previousPosition: 8, logoText: 'MF', tone: 'green' },
                    { id: '96', teamName: 'Kickoff Squad', country: 'Esperantina', points: 6090, previousPosition: 7, logoText: 'KS', tone: 'silver' },
                ],
            },
        ],
    },
]

function getMovement(currentPosition: number, previousPosition: number): Pick<RankedEntry, 'movement' | 'delta'> {
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

function RankingCard({ entry }: { entry: RankedEntry }) {
    const movementCopy = {
        up: `Subiu ${entry.delta} ${entry.delta === 1 ? 'posição' : 'posições'} em relação à última rodada`,
        down: `Desceu ${entry.delta} ${entry.delta === 1 ? 'posição' : 'posições'} em relação à última rodada`,
        same: 'Manteve a mesma posição da última rodada',
    }

    return (
        <article className={styles.rankingCard}>
            <div className={`${styles.logoBadge} ${styles[entry.tone]}`}>
                <span>{entry.logoText}</span>
            </div>

            <div className={styles.rankArea}>
                <strong>#{entry.currentPosition}</strong>
                <span>
                    {entry.delta > 0
                        ? `${entry.delta > 0 && entry.movement === 'up' ? '+' : '-'}${entry.delta}`
                        : '0'}
                </span>
            </div>

            <div className={styles.teamArea}>
                <h3>{entry.teamName}</h3>
                <p>{entry.country}</p>
                <small>Última rodada: #{entry.previousPosition}</small>
            </div>

            <div className={styles.scoreArea}>
                <span>Score</span>
                <strong>{formatPoints(entry.points)}</strong>
            </div>

            <div
                className={`${styles.movementBadge} ${styles[entry.movement]}`}
                aria-label={movementCopy[entry.movement]}
                title={movementCopy[entry.movement]}
            >
                {entry.movement === 'up' ? <ArrowUp /> : null}
                {entry.movement === 'down' ? <ArrowDown /> : null}
                {entry.movement === 'same' ? <Minus /> : null}
            </div>
        </article>
    )
}

export default function GameArea({
    games = defaultGames,
    defaultGameId,
    defaultSeasonId,
    rankingLabel = 'Piauí Ranking',
}: GameAreaProps) {
    const fallbackGameId = defaultGameId ?? games[0]?.id ?? ''
    const initialGame = games.find((game) => game.id === fallbackGameId) ?? games[0]

    const [selectedGameId, setSelectedGameId] = useState(initialGame?.id ?? '')
    const [selectedSeasonId, setSelectedSeasonId] = useState(defaultSeasonId ?? initialGame?.seasons[0]?.id ?? '')
    const [showAllGames, setShowAllGames] = useState(false)
    const [isGameListOpen, setIsGameListOpen] = useState(true)
    const [isPending, startTransition] = useTransition()

    const selectedGame = games.find((game) => game.id === selectedGameId) ?? games[0]

    if (!selectedGame) {
        return null
    }

    const resolvedSeasonId = selectedGame.seasons.some((season) => season.id === selectedSeasonId)
        ? selectedSeasonId
        : selectedGame.seasons[0]?.id ?? ''

    const selectedSeason =
        selectedGame.seasons.find((season) => season.id === resolvedSeasonId) ?? selectedGame.seasons[0]

    const rankedEntries: RankedEntry[] = [...(selectedSeason?.entries ?? [])]
        .sort((firstEntry, secondEntry) => secondEntry.points - firstEntry.points)
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

    const leftColumnEntries = rankedEntries.filter((_, index) => index % 2 === 0)
    const rightColumnEntries = rankedEntries.filter((_, index) => index % 2 === 1)
    const visibleGames = showAllGames ? games : games.slice(0, 5)

    return (
        <section className={styles.container}>
            <div className={styles.contentArea}>
                <div className={styles.layout}>
                    <aside className={styles.filtersColumn}>
                        <button
                            type="button"
                            className={styles.gamePicker}
                            onClick={() => setIsGameListOpen((currentValue) => !currentValue)}
                            aria-expanded={isGameListOpen}
                        >
                            <span>Escolha o jogo</span>
                            <ChevronDown className={isGameListOpen ? styles.openIcon : ''} />
                        </button>

                        {isGameListOpen ? (
                            <div className={styles.gamesPanel}>
                                <div className={styles.gamesList}>
                                    {visibleGames.map((game) => (
                                        <button
                                            key={game.id}
                                            type="button"
                                            className={`${styles.gameCard} ${styles[game.theme]} ${selectedGame.id === game.id ? styles.selectedGame : ''}`}
                                            onClick={() => {
                                                startTransition(() => {
                                                    setSelectedGameId(game.id)
                                                    setSelectedSeasonId(game.seasons[0]?.id ?? '')
                                                })
                                            }}
                                        >
                                            <div className={styles.gameVisual}>
                                                <span className={styles.gameShortName}>{game.shortName}</span>
                                                <strong>{game.cardLabel}</strong>
                                            </div>

                                            {selectedGame.id === game.id ? (
                                                <span className={styles.selectedTag}>Selecionado</span>
                                            ) : null}
                                        </button>
                                    ))}
                                </div>

                                {games.length > 5 ? (
                                    <button
                                        type="button"
                                        className={styles.viewAllButton}
                                        onClick={() => setShowAllGames((currentValue) => !currentValue)}
                                    >
                                        {showAllGames ? 'Ver menos' : 'Ver todos'}
                                        <ArrowDown className={showAllGames ? styles.viewAllOpenIcon : ''} />
                                    </button>
                                ) : null}
                            </div>
                        ) : null}
                    </aside>

                    <div className={`${styles.rankingPanel} ${isPending ? styles.pending : ''}`}>
                        <div className={styles.panelHeader}>
                            <div className={styles.titleBlock}>
                                <div className={styles.flagBadge} aria-hidden="true">
                                    <span className={styles.flagStar}>★</span>
                                    <span className={styles.flagStripeTop}></span>
                                    <span className={styles.flagStripeBottom}></span>
                                </div>
                                <h2>{rankingLabel}</h2>
                            </div>

                            <label className={styles.seasonField}>
                                <select
                                    value={resolvedSeasonId}
                                    onChange={(event) => {
                                        const nextSeasonId = event.target.value

                                        startTransition(() => {
                                            setSelectedSeasonId(nextSeasonId)
                                        })
                                    }}
                                >
                                    {selectedGame.seasons.map((season) => (
                                        <option key={season.id} value={season.id}>
                                            {season.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown />
                            </label>
                        </div>

                        <div className={styles.rankingColumns}>
                            <div className={styles.cardsColumn}>
                                {leftColumnEntries.map((entry) => (
                                    <RankingCard key={entry.id} entry={entry} />
                                ))}
                            </div>

                            <div className={styles.cardsColumn}>
                                {rightColumnEntries.map((entry) => (
                                    <RankingCard key={entry.id} entry={entry} />
                                ))}
                            </div>
                        </div>

                        <div className={styles.footerBars} aria-hidden="true">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
