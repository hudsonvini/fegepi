'use client'

import { useEffect, useEffectEvent, useState } from 'react'
import styles from './Carrossel.module.scss'

export type HeroCarouselSlide = {
    id: string
    imageSrc: string
    imageAlt: string
}

type CarrosselProps = {
    slides?: HeroCarouselSlide[]
    autoPlayMs?: number
}

const defaultSlides: HeroCarouselSlide[] = [
    {
        id: 'hero-1',
        imageSrc: '/images/carrosselImages/banner1.png',
        imageAlt: 'Banner principal do circuito FEGEPI',
    },
    {
        id: 'hero-2',
        imageSrc: '/images/carrosselImages/banner1.png',
        imageAlt: 'Banner com destaques do circuito FEGEPI',
    },
    {
        id: 'hero-3',
        imageSrc: '/images/carrosselImages/banner1.png',
        imageAlt: 'Banner com chamada para inscricoes da FEGEPI',
    },
]

export default function Carrossel({
    slides = defaultSlides,
    autoPlayMs = 9000,
}: CarrosselProps) {
    const [activeSlide, setActiveSlide] = useState(0)
    const totalSlides = slides.length

    const advanceSlide = useEffectEvent(() => {
        if (totalSlides <= 1) {
            return
        }

        setActiveSlide((currentSlide) => (currentSlide + 1) % totalSlides)
    })

    useEffect(() => {
        setActiveSlide((currentSlide) => Math.min(currentSlide, Math.max(totalSlides - 1, 0)))
    }, [totalSlides])

    useEffect(() => {
        if (totalSlides <= 1 || autoPlayMs <= 0) {
            return
        }

        const intervalId = window.setInterval(() => {
            advanceSlide()
        }, autoPlayMs)

        return () => window.clearInterval(intervalId)
    }, [autoPlayMs, totalSlides])

    return (
        <section className={styles.container} aria-label="Carrossel principal">
            <div className={styles.viewport}>
                <div
                    className={styles.track}
                    style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                    {slides.map((slide) => (
                        <article key={slide.id} className={styles.slide}>
                            <img
                                className={styles.slideImage}
                                src={slide.imageSrc}
                                alt={slide.imageAlt}
                            />
                        </article>
                    ))}
                </div>
            </div>

            {totalSlides > 1 ? (
                <div className={styles.bullets} aria-label="Paginas do banner">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.id}
                            type="button"
                            className={`${styles.bullet} ${index === activeSlide ? styles.activeBullet : ''}`}
                            onClick={() => setActiveSlide(index)}
                            aria-label={`Ir para o slide ${index + 1}`}
                            aria-pressed={index === activeSlide}
                        />
                    ))}
                </div>
            ) : null}
        </section>
    )
}
