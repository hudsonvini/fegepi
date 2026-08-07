'use client'

import Link from 'next/link'
import { ArrowUpRight, Gamepad2, MoveHorizontal, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { FeaturedPlayer } from '@/lib/players'
import { getProfileAvatar } from '@/lib/profile'
import styles from './FeaturedPlayers.module.scss'

const roleLabels = {
  player: 'Player',
  captain: 'Capitão',
  coach: 'Coach',
  reserve: 'Reserva',
} as const

function PlayerCard({ player, index }: { player: FeaturedPlayer; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null)

  function handleTilt(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    event.currentTarget.style.setProperty('--tilt-x', `${(0.5 - y) * 7}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${(x - 0.5) * 9}deg`)
    event.currentTarget.style.setProperty('--glow-x', `${x * 100}%`)
    event.currentTarget.style.setProperty('--glow-y', `${y * 100}%`)
  }

  function resetTilt() {
    cardRef.current?.style.setProperty('--tilt-x', '0deg')
    cardRef.current?.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <Link
      ref={cardRef}
      href={`/jogadores/${player.id}`}
      className={styles.card}
      style={{
        '--index': index,
        '--rotation': `${((index % 3) - 1) * 1.25}deg`,
      } as CSSProperties}
      onPointerMove={handleTilt}
      onPointerLeave={resetTilt}
    >
      <div className={styles.cardGlow} />
      <div className={styles.portrait}>
        <img
          src={getProfileAvatar(player.avatar_url, player.gender)}
          alt={`Foto de ${player.full_name || player.player_tag || 'jogador'}`}
        />
        <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.gameLine}>
          <span><Gamepad2 size={13} /> {player.game?.short_name || player.favorite_game || 'FEGEPI'}</span>
          <ArrowUpRight size={16} />
        </div>
        <p>{player.player_tag ? `@${player.player_tag}` : 'Talento FEGEPI'}</p>
        <h3>{player.full_name || 'Jogador FEGEPI'}</h3>
        <div className={styles.meta}>
          <span className={styles.crest}>
            {player.team?.crest_url
              ? <img src={player.team.crest_url} alt="" />
              : (player.team?.initials || 'FG').slice(0, 3)}
          </span>
          <div>
            <strong>{player.team?.name || 'Comunidade FEGEPI'}</strong>
            <small>{player.role ? roleLabels[player.role] : 'Competidor'}</small>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function FeaturedPlayers({ players }: { players: FeaturedPlayer[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0.5)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && section.classList.add(styles.visible),
      { threshold: 0.16 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    const travel = Math.max(0, track.scrollWidth - viewport.clientWidth)
    track.style.setProperty('--travel', `${-travel * progress}px`)
  }, [progress, players.length])

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const normalized = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
    setProgress(normalized)
  }

  if (!players.length) return null

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="featured-players-title">
      <div className={styles.ambient} />
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}><ShieldCheck size={15} /> Talentos em destaque</span>
          <h2 id="featured-players-title"><b>Os players que estão</b><br />fazendo a diferença.</h2>
        </div>
        <div className={styles.intro}>
          <p>Conheça quem vem elevando o nível competitivo da FEGEPI em cada modalidade.</p>
          <Link href="/jogadores"><ArrowUpRight size={17} /></Link>
        </div>
      </header>

      <div
        ref={viewportRef}
        className={styles.viewport}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setProgress(0.5)}
      >
        <div ref={trackRef} className={styles.track}>
          {players.map((player, index) => <PlayerCard key={player.id} player={player} index={index} />)}
        </div>
      </div>

      <div className={styles.hint}>
        <MoveHorizontal size={16} />
        <span>Mova o cursor para explorar</span>
        <div><i style={{ transform: `scaleX(${Math.max(.08, progress)})` }} /></div>
      </div>
    </section>
  )
}
