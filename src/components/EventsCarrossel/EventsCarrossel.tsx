'use client'

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import styles from './EventsCarrossel.module.scss'

export type EventCarouselItem = {
    id: string
    title: string
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

const defaultEvents: EventCarouselItem[] = [
    {
        id: 'cyber-league',
        title: 'Cyber League',
        dateLabel: 'de 27 a 31 de Outubro',
        subtitle: 'Final presencial em Sao Paulo',
        statusLabel: 'Inscricoes abertas',
        statusTone: 'active',
        imageSrc: '/images/EventCarrosselImages/event1.webp',
        imageAlt: 'Equipe celebrando em um palco de torneio',
        featuredVideoSrc: 'https://www.pexels.com/pt-br/download/video/8545728/',
        // featuredImageAlt: 'Equipe em destaque durante outro momento do torneio',
        href: '#',
        ctaLabel: 'Inscrever-se',
    },
    {
        id: 'arena-cup',
        title: 'Arena Cup',
        dateLabel: 'de 12 a 15 de Novembro',
        subtitle: 'Eliminatorias online',
        statusLabel: 'Ultimas vagas',
        statusTone: 'active',
        imageSrc: '/images/EventCarrosselImages/event2.webp',
        imageAlt: 'Jogadores competindo em cabines iluminadas',
        featuredImageSrc: '/images/EventCarrosselImages/event3.webp',
        featuredImageAlt: 'Arena da classificatoria online em close',
        href: '#',
        ctaLabel: 'Ver regulamento',
    },
    {
        id: 'masters-showdown',
        title: 'Masters Showdown',
        dateLabel: 'de 03 a 05 de Dezembro',
        subtitle: 'Evento especial com convidados',
        statusLabel: 'Em breve',
        statusTone: 'inactive',
        imageSrc: '/images/EventCarrosselImages/event3.webp',
        imageAlt: 'Arena principal com publico e projetores',
        featuredImageSrc: '/images/EventCarrosselImages/event1.webp',
        featuredImageAlt: 'Imagem promocional alternativa do evento especial',
        href: '#',
        ctaLabel: 'Quero participar',
    },
    {
        id: 'campus-clash',
        title: 'Campus Clash',
        dateLabel: 'de 10 a 12 de Janeiro',
        subtitle: 'Confrontos universitarios regionais',
        statusLabel: 'Inscricoes abertas',
        statusTone: 'active',
        imageSrc: '/images/EventCarrosselImages/event1.webp',
        imageAlt: 'Equipe universitária se preparando para competir',
        featuredImageSrc: '/images/EventCarrosselImages/event3.webp',
        featuredImageAlt: 'Imagem alternativa do circuito universitario',
        href: '#',
        ctaLabel: 'Garantir vaga',
    },
]

function getRelativeIndex(index: number, activeIndex: number, totalItems: number) {
    return (index - activeIndex + totalItems) % totalItems
}

export default function EventsCarrossel({
    eyebrow = 'Federe o seu time e participe!',
    title = 'Eventos Oficiais',
    events = defaultEvents,
}: EventsCarrosselProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [direction, setDirection] = useState<'next' | 'prev'>('next')
    const totalEvents = events.length

    useEffect(() => {
        setActiveIndex((currentIndex) => Math.min(currentIndex, Math.max(totalEvents - 1, 0)))
    }, [totalEvents])

    function goToNextEvent() {
        if (totalEvents <= 1) {
            return
        }

        setDirection('next')
        setActiveIndex((currentIndex) => (currentIndex + 1) % totalEvents)
    }

    function goToPreviousEvent() {
        if (totalEvents <= 1) {
            return
        }

        setDirection('prev')
        setActiveIndex((currentIndex) => (currentIndex - 1 + totalEvents) % totalEvents)
    }

    return (
        <section className={styles.container} aria-labelledby="events-carrossel-title">
            <div className={styles.titleSection}>
                <div className={styles.titleArea}>
                    <span>{eyebrow}</span>
                    <h2 id="events-carrossel-title">{title}</h2>
                </div>

                <div className={styles.buttonsArea}>
                    <button
                        type="button"
                        className={styles.button}
                        onClick={goToPreviousEvent}
                        aria-label="Ver eventos anteriores"
                        disabled={totalEvents <= 1}
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        type="button"
                        className={styles.button}
                        onClick={goToNextEvent}
                        aria-label="Ver proximos eventos"
                        disabled={totalEvents <= 1}
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>

            <div className={styles.carrosselArea}>
                <div className={styles.stage}>
                    {events.map((event, index) => {
                        const relativeIndex = getRelativeIndex(index, activeIndex, totalEvents)
                        const statusClassName = [
                            styles.status,
                            event.statusTone === 'active' ? styles.active : '',
                        ].filter(Boolean).join(' ')

                        const positionClassName = (() => {
                            if (relativeIndex === 0) {
                                return styles.positionFeatured
                            }

                            if (relativeIndex === 1) {
                                return styles.positionSecond
                            }

                            if (relativeIndex === 2) {
                                return styles.positionThird
                            }

                            if (totalEvents === 4 && relativeIndex === 3) {
                                return direction === 'prev' ? styles.positionPrevious : styles.positionNext
                            }

                            if (totalEvents > 3 && relativeIndex === 3) {
                                return styles.positionNext
                            }

                            if (totalEvents > 4 && relativeIndex === totalEvents - 1) {
                                return styles.positionPrevious
                            }

                            return styles.positionHidden
                        })()

                        const cardClassName = [
                            styles.card,
                            relativeIndex === 0 ? styles.destaq : '',
                            positionClassName,
                        ].filter(Boolean).join(' ')

                        return (
                            <article
                                key={event.id}
                                className={cardClassName}
                                aria-hidden={relativeIndex > 2}
                            >
                                {relativeIndex === 0 && event.featuredVideoSrc ? (
                                    <div className={styles.mediaArea}>
                                        <video
                                            className={styles.mediaAsset}
                                            src={event.featuredVideoSrc}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            preload="metadata"
                                        />

                                        <div className={styles.mediaTitle}>
                                            <h3>{event.title}</h3>
                                            <p>{event.subtitle ?? event.dateLabel}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.mediaArea}>
                                        <img
                                            className={styles.mediaAsset}
                                            src={relativeIndex === 0
                                                ? (event.featuredImageSrc ?? event.imageSrc)
                                                : event.imageSrc}
                                            alt={relativeIndex === 0
                                                ? (event.featuredImageAlt ?? event.imageAlt)
                                                : event.imageAlt}
                                        />

                                        <div className={styles.mediaTitle}>
                                            <h3>{event.title}</h3>
                                            <p>{event.subtitle ?? event.dateLabel}</p>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.textArea}>
                                    <div className={styles.leftArea}>
                                        <p>
                                            <Calendar />
                                            {event.dateLabel}
                                        </p>
                                        <span className={statusClassName}>{event.statusLabel}</span>
                                    </div>

                                    <a className={styles.inscreverButton} href={event.href ?? '#'}>
                                        <span>{event.ctaLabel ?? 'Inscrever-se'}</span>
                                        <ChevronRight />
                                    </a>
                                </div>
                            </article>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
