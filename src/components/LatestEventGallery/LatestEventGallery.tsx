'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useRef } from 'react'
import styles from './LatestEventGallery.module.scss'

export type EventGalleryPhoto = {
    id: string
    src: string
    alt: string
}

export type EventGalleryBanner = {
    title: string
    description: string
    imageSrc: string
    imageAlt: string
}

type LatestEventGalleryProps = {
    eyebrow?: string
    title?: string
    banner?: EventGalleryBanner
    photos?: EventGalleryPhoto[]
}

const defaultBanner: EventGalleryBanner = {
    title: 'CYBER LEAGUE',
    description:
        'Mais do que armas e munição, VALORANT inclui agentes com habilidades adaptativas, rápidas e letais, que criam oportunidades para você exibir sua mecânica de tiro. Cada Agente é único, assim como os momentos de destaque de cada partida!',
    imageSrc: '/images/EventCarrosselImages/event1.webp',
    imageAlt: 'Equipe celebrando durante a final do evento',
}

const defaultPhotos: EventGalleryPhoto[] = [
    { id: '1', src: '/images/EventCarrosselImages/event1.webp', alt: 'Jogador comemorando durante partida oficial' },
    { id: '2', src: '/images/EventCarrosselImages/event2.webp', alt: 'Participantes durante uma partida em equipe' },
    { id: '3', src: '/images/EventCarrosselImages/event3.webp', alt: 'Arena principal do evento com público e equipes' },
    { id: '4', src: '/images/EventCarrosselImages/event1.webp', alt: 'Atleta focado durante a competição' },
    { id: '5', src: '/images/EventCarrosselImages/event2.webp', alt: 'Momento descontraído entre participantes' },
    { id: '6', src: '/images/EventCarrosselImages/event3.webp', alt: 'Painel de premiação ao final do torneio' },
]

export default function LatestEventGallery({
    eyebrow = 'Quem nos apoia',
    title = 'Fotos do último evento',
    banner = defaultBanner,
    photos = defaultPhotos,
}: LatestEventGalleryProps) {
    const carouselRef = useRef<HTMLDivElement>(null)

    function scrollPhotos(direction: 'left' | 'right') {
        const gallery = carouselRef.current

        if (!gallery) {
            return
        }

        const cardWidth = gallery.firstElementChild instanceof HTMLElement
            ? gallery.firstElementChild.getBoundingClientRect().width
            : 280

        gallery.scrollBy({
            left: direction === 'right' ? cardWidth + 16 : -(cardWidth + 16),
            behavior: 'smooth',
        })
    }

    return (
        <section className={styles.container} aria-labelledby="latest-event-gallery-title">
            <div className={styles.heading}>
                <span>{eyebrow}</span>
                <h2 id="latest-event-gallery-title">{title}</h2>
            </div>

            <article className={styles.banner}>
                <Image
                    src={banner.imageSrc}
                    alt={banner.imageAlt}
                    fill
                    priority={false}
                    sizes="(max-width: 768px) 100vw, 1500px"
                    className={styles.bannerImage}
                />

                <div className={styles.bannerOverlay}></div>

                <div className={styles.bannerContent}>
                    <h3>{banner.title}</h3>
                    <p>{banner.description}</p>
                </div>
            </article>

            <div className={styles.carouselArea}>
                <button
                    type="button"
                    className={`${styles.carouselButton} ${styles.leftButton}`}
                    onClick={() => scrollPhotos('left')}
                    aria-label="Ver fotos anteriores"
                >
                    <ChevronLeft />
                </button>

                <div ref={carouselRef} className={styles.carouselTrack}>
                    {photos.map((photo) => (
                        <article key={photo.id} className={styles.photoCard}>
                            <button
                                type="button"
                                className={styles.downloadButton}
                                aria-label={`Baixar ${photo.alt}`}
                            >
                                <Download />
                            </button>

                            <Image
                                src={photo.src}
                                alt={photo.alt}
                                fill
                                sizes="(max-width: 768px) 82vw, (max-width: 1200px) 34vw, 19vw"
                                className={styles.photoImage}
                            />
                        </article>
                    ))}
                </div>

                <button
                    type="button"
                    className={`${styles.carouselButton} ${styles.rightButton}`}
                    onClick={() => scrollPhotos('right')}
                    aria-label="Ver próximas fotos"
                >
                    <ChevronRight />
                </button>
            </div>
        </section>
    )
}
