'use client'

/* eslint-disable @next/next/no-img-element */

import { ArrowUpRight, CalendarDays, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import styles from './EventsCarrossel.module.scss'

export type EventCarouselItem = {
    id: string
    title: string
    startsAt?: string
    dateLabel: string
    subtitle?: string
    statusLabel: string
    statusTone?: 'active' | 'inactive'
    imageSrc: string
    imageAlt: string
    featuredVideoSrc?: string
    featuredImageSrc?: string
    featuredImageAlt?: string
    href?: string
    ctaLabel?: string
}

type EventsCarrosselProps = {
    eyebrow?: string
    title?: string
    events?: EventCarouselItem[]
}

const AUTO_ADVANCE_TIME = 5200

const defaultEvents: EventCarouselItem[] = [
    {
        id: 'cyber-league',
        title: 'Cyber League',
        startsAt: '2026-10-27',
        dateLabel: '27 a 31 de outubro',
        subtitle: 'Final presencial em São Paulo',
        statusLabel: 'Inscrições abertas',
        statusTone: 'active',
        imageSrc: '/images/EventCarrosselImages/event1.webp',
        imageAlt: 'Equipe celebrando em um palco de torneio',
        href: '#',
        ctaLabel: 'Inscrever-se',
    },
    {
        id: 'arena-cup',
        title: 'Arena Cup',
        startsAt: '2026-11-12',
        dateLabel: '12 a 15 de novembro',
        subtitle: 'Eliminatórias online',
        statusLabel: 'Últimas vagas',
        statusTone: 'active',
        imageSrc: '/images/EventCarrosselImages/event2.webp',
        imageAlt: 'Jogadores competindo em uma arena iluminada',
        href: '#',
        ctaLabel: 'Ver regulamento',
    },
    {
        id: 'masters-showdown',
        title: 'Masters Showdown',
        startsAt: '2026-12-03',
        dateLabel: '03 a 05 de dezembro',
        subtitle: 'Evento especial com convidados',
        statusLabel: 'Em breve',
        statusTone: 'inactive',
        imageSrc: '/images/EventCarrosselImages/event3.webp',
        imageAlt: 'Arena principal com público e projetores',
        href: '#',
        ctaLabel: 'Saiba mais',
    },
]

export default function EventsCarrossel({
    eyebrow = 'Próximas disputas',
    title = 'Eventos em destaque',
    events = defaultEvents,
}: EventsCarrosselProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [interactionIndex, setInteractionIndex] = useState<number | null>(null)
    const [currentTime, setCurrentTime] = useState<number | null>(null)
    const visibleEvents = events.filter((event) => event.imageSrc)
    const totalEvents = visibleEvents.length

    useEffect(() => {
        if (totalEvents <= 1 || interactionIndex !== null) return

        const timer = window.setInterval(() => {
            setActiveIndex((currentIndex) => (currentIndex + 1) % totalEvents)
        }, AUTO_ADVANCE_TIME)

        return () => window.clearInterval(timer)
    }, [interactionIndex, totalEvents])

    useEffect(() => {
        const firstTick = window.setTimeout(() => setCurrentTime(Date.now()), 0)
        const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000)

        return () => {
            window.clearTimeout(firstTick)
            window.clearInterval(timer)
        }
    }, [])

    if (!totalEvents) return null

    const highlightedIndex = interactionIndex ?? (activeIndex % totalEvents)
    const datedEvents = visibleEvents
        .map((event) => ({ event, timestamp: getEventTimestamp(event.startsAt) }))
        .filter((item): item is { event: EventCarouselItem; timestamp: number } => item.timestamp !== null)
        .sort((first, second) => first.timestamp - second.timestamp)
    const nextEvent = currentTime === null
        ? datedEvents[0]
        : datedEvents.find((item) => item.timestamp > currentTime)
    const countdown = nextEvent && currentTime !== null
        ? getCountdown(nextEvent.timestamp - currentTime)
        : null

    function highlight(index: number) {
        setActiveIndex(index)
        setInteractionIndex(index)
    }

    return (
        <section className={styles.container} aria-labelledby="events-carrossel-title">
            <header className={styles.heading}>
                <div>
                    <span>{eyebrow}</span>
                    <h2 id="events-carrossel-title">{title}</h2>
                </div>
                <p>Conheça os próximos campeonatos da FEGEPi e garanta sua participação.</p>
            </header>

            <div
                className={styles.cards}
                onMouseLeave={() => setInteractionIndex(null)}
                aria-label="Eventos oficiais da FEGEPi"
            >
                {visibleEvents.map((event, index) => {
                    const isHighlighted = index === highlightedIndex
                    const statusClassName = `${styles.status} ${event.statusTone === 'active' ? styles.activeStatus : styles.inactiveStatus}`
                    const eventImage = isHighlighted && event.featuredImageSrc
                        ? event.featuredImageSrc
                        : event.imageSrc

                    return (
                        <article
                            key={event.id}
                            className={`${styles.card} ${isHighlighted ? styles.highlighted : ''}`}
                            onMouseEnter={() => highlight(index)}
                            onFocusCapture={() => highlight(index)}
                            onBlurCapture={(eventBlur) => {
                                if (!eventBlur.currentTarget.contains(eventBlur.relatedTarget)) {
                                    setInteractionIndex(null)
                                }
                            }}
                        >
                            {isHighlighted && event.featuredVideoSrc ? (
                                <video
                                    className={styles.media}
                                    src={event.featuredVideoSrc}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    aria-label={event.featuredImageAlt ?? event.imageAlt}
                                />
                            ) : (
                                <img
                                    className={styles.media}
                                    src={eventImage}
                                    alt={isHighlighted ? (event.featuredImageAlt ?? event.imageAlt) : event.imageAlt}
                                />
                            )}
                            <div className={styles.scrim} aria-hidden="true" />

                            <div className={styles.topline}>
                                <span className={statusClassName}>{event.statusLabel}</span>
                                <a
                                    className={styles.iconLink}
                                    href={event.href ?? '#'}
                                    aria-label={`${event.ctaLabel ?? 'Ver evento'}: ${event.title}`}
                                >
                                    <ArrowUpRight />
                                </a>
                            </div>

                            <div className={styles.eventCopy}>
                                <h3>{event.title}</h3>
                                <p>{event.subtitle ?? event.dateLabel}</p>
                                <div className={styles.details}>
                                    <span><CalendarDays /> {event.dateLabel}</span>
                                    <a href={event.href ?? '#'}>
                                        {event.ctaLabel ?? 'Ver evento'}
                                        <ArrowUpRight />
                                    </a>
                                </div>
                            </div>
                        </article>
                    )
                })}
            </div>

            {totalEvents > 1 ? (
                <div className={styles.progress} aria-label={`Evento ${highlightedIndex + 1} de ${totalEvents}`}>
                    {visibleEvents.map((event, index) => (
                        <button
                            key={event.id}
                            type="button"
                            className={index === highlightedIndex ? styles.currentProgress : ''}
                            onClick={() => {
                                setActiveIndex(index)
                                setInteractionIndex(null)
                            }}
                            aria-label={`Destacar ${event.title}`}
                        />
                    ))}
                </div>
            ) : null}

            {nextEvent ? (
                <div
                    className={styles.countdown}
                    role="timer"
                    aria-label={countdown
                        ? `Próximo evento, ${nextEvent.event.title}, em ${countdown.days} dias, ${countdown.hours} horas, ${countdown.minutes} minutos e ${countdown.seconds} segundos`
                        : `Calculando o tempo para ${nextEvent.event.title}`}
                >
                    <div className={styles.countdownIntro}>
                        <span><Timer /> Próximo evento</span>
                        <strong>{nextEvent.event.title}</strong>
                    </div>

                    <div className={styles.countdownClock} aria-hidden="true">
                        {([
                            ['Dias', countdown?.days],
                            ['Horas', countdown?.hours],
                            ['Min', countdown?.minutes],
                            ['Seg', countdown?.seconds],
                        ] as const).map(([label, value], index) => (
                            <div className={styles.timeGroup} key={label}>
                                {index > 0 ? <i>:</i> : null}
                                <div>
                                    <strong>{value === undefined ? '--' : String(value).padStart(2, '0')}</strong>
                                    <span>{label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </section>
    )
}

function getEventTimestamp(startsAt?: string) {
    if (!startsAt) return null

    const normalizedDate = startsAt.includes('T') ? startsAt : `${startsAt}T00:00:00-03:00`
    const timestamp = new Date(normalizedDate).getTime()
    return Number.isNaN(timestamp) ? null : timestamp
}

function getCountdown(distance: number) {
    const totalSeconds = Math.max(0, Math.floor(distance / 1000))

    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
    }
}
