'use client'

import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import styles from './MainBannerCarousel.module.scss'

export type MainBannerSlide = {
  id: string
  imageSrc: string
  videoSrc?: string
  imageAlt: string
  eyebrow?: string
  title?: string
  description?: string
  ctaLabel?: string
  href?: string
}

type MainBannerCarouselProps = {
  slides?: MainBannerSlide[]
  autoPlayMs?: number
}

type CarouselStyle = CSSProperties & {
  '--banner-duration': string
}

export default function MainBannerCarousel({ slides = [], autoPlayMs = 7000 }: MainBannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const safeIndex = slides.length ? activeIndex % slides.length : 0
  const activeSlide = slides[safeIndex]

  if (!activeSlide) return null

  function changeSlide(direction: number) {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length)
  }

  return (
    <section
      className={`${styles.container} ${isInteracting ? styles.paused : ''}`}
      style={{ '--banner-duration': `${autoPlayMs}ms` } as CarouselStyle}
      aria-roledescription="carrossel"
      aria-label="Destaques da FEGEPI"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false)
      }}
    >
      <article className={styles.banner} aria-live="polite">
        {activeSlide.videoSrc ? (
          <video
            key={activeSlide.id}
            src={activeSlide.videoSrc}
            className={styles.image}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={activeSlide.imageAlt}
          />
        ) : (
          <>
            {/* Imagens gerenciadas podem vir de domínios R2 personalizados. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeSlide.id}
              src={activeSlide.imageSrc}
              alt={activeSlide.imageAlt}
              fetchPriority={safeIndex === 0 ? 'high' : 'auto'}
              className={styles.image}
            />
          </>
        )}
        <div className={styles.overlay} aria-hidden="true" />

        {(activeSlide.title || activeSlide.description || (activeSlide.ctaLabel && activeSlide.href)) ? (
          <div className={styles.content} key={`content-${activeSlide.id}`}>
            <span className={styles.eyebrow}>{activeSlide.eyebrow || 'Destaque FEGEPI'}</span>
            {activeSlide.title ? <h2>{activeSlide.title}</h2> : null}
            {activeSlide.description ? <p>{activeSlide.description}</p> : null}
            {activeSlide.ctaLabel && activeSlide.href ? (
              <a className={styles.cta} href={activeSlide.href}>
                {activeSlide.ctaLabel}
                <ArrowUpRight aria-hidden="true" />
              </a>
            ) : null}
          </div>
        ) : null}

        {slides.length > 1 ? (
          <div className={styles.controls}>
            <button type="button" onClick={() => changeSlide(-1)} aria-label="Banner anterior">
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={() => changeSlide(1)} aria-label="Próximo banner">
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <div className={styles.footer}>
          <div className={styles.indicators} aria-label="Selecionar banner">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={index === safeIndex ? styles.activeIndicator : ''}
                onClick={() => setActiveIndex(index)}
                aria-label={`Mostrar banner ${index + 1}: ${slide.title || slide.imageAlt}`}
                aria-current={index === safeIndex ? 'true' : undefined}
              >
                {index === safeIndex && autoPlayMs > 0 ? (
                  <span
                    key={`progress-${slide.id}-${safeIndex}`}
                    className={styles.progressFill}
                    aria-hidden="true"
                    onAnimationEnd={() => {
                      if (slides.length > 1) setActiveIndex((current) => (current + 1) % slides.length)
                    }}
                  />
                ) : null}
              </button>
            ))}
          </div>
          <small>{String(safeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</small>
        </div>
      </article>
    </section>
  )
}
