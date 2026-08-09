'use client'

import Lenis from 'lenis'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import styles from './SmoothScroll.module.scss'

type ProgressStyle = CSSProperties & {
  '--scroll-progress': number
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0)
  const [isScrollable, setIsScrollable] = useState(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let lastPercentage = -1

    const updateProgress = (value?: number) => {
      const limit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const nextProgress = value ?? (limit > 0 ? window.scrollY / limit : 0)
      const nextPercentage = Math.round(Math.min(1, Math.max(0, nextProgress)) * 100)

      setIsScrollable(limit > 8)
      if (nextPercentage !== lastPercentage) {
        lastPercentage = nextPercentage
        setProgress(nextPercentage)
      }
    }

    if (reduceMotion) {
      const handleNativeScroll = () => updateProgress()
      const handleNativeResize = () => updateProgress()

      updateProgress()
      window.addEventListener('scroll', handleNativeScroll, { passive: true })
      window.addEventListener('resize', handleNativeResize)

      return () => {
        window.removeEventListener('scroll', handleNativeScroll)
        window.removeEventListener('resize', handleNativeResize)
      }
    }

    const lenis = new Lenis({
      autoRaf: true,
      anchors: { offset: -24 },
      duration: 1.15,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      respectReducedMotion: true,
    })

    const handleScroll = (instance: Lenis) => updateProgress(instance.progress)
    const handleResize = () => {
      lenis.resize()
      updateProgress(lenis.progress)
    }

    lenis.on('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    updateProgress(lenis.progress)

    return () => {
      window.removeEventListener('resize', handleResize)
      lenis.destroy()
    }
  }, [])

  const progressStyle: ProgressStyle = { '--scroll-progress': progress }

  return (
    <>
      {children}
      <div
        className={`${styles.scrollProgress} ${isScrollable ? styles.visible : ''}`}
        style={progressStyle}
        role="progressbar"
        aria-label="Progresso da página"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span className={styles.value}>{progress}%</span>
        <span className={styles.track} aria-hidden="true">
          <span className={styles.dot} />
        </span>
      </div>
    </>
  )
}
