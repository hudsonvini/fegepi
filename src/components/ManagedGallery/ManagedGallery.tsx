'use client'

import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useRef } from 'react'
import type { EventGalleryBanner, EventGalleryPhoto } from '../LatestEventGallery/LatestEventGallery'
import styles from '../LatestEventGallery/LatestEventGallery.module.scss'

type ManagedPhoto = EventGalleryPhoto & { downloadUrl?: string }
type Props = { eyebrow?: string; title?: string; banner?: EventGalleryBanner; photos?: ManagedPhoto[] }
export default function ManagedGallery({ eyebrow = 'Quem nos apoia', title = 'Fotos do último evento', banner, photos = [] }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  if (!banner) return null
  const scroll = (direction: number) => ref.current?.scrollBy({ left: direction * ((ref.current.firstElementChild as HTMLElement)?.offsetWidth ?? 280), behavior: 'smooth' })
  return <section id="galeria" className={styles.container}><div className={styles.heading}><span>{eyebrow}</span><h2>{title}</h2></div><article className={styles.banner}><img src={banner.imageSrc} alt={banner.imageAlt} className={styles.bannerImage} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /><div className={styles.bannerOverlay} /><div className={styles.bannerContent}><h3>{banner.title}</h3><p>{banner.description}</p></div></article><div className={styles.carouselArea}><button type="button" className={`${styles.carouselButton} ${styles.leftButton}`} onClick={() => scroll(-1)} aria-label="Fotos anteriores"><ChevronLeft /></button><div ref={ref} className={styles.carouselTrack}>{photos.map((photo) => <article key={photo.id} className={styles.photoCard}><a href={photo.downloadUrl ?? photo.src} download className={styles.downloadButton} aria-label={`Baixar ${photo.alt}`}><Download /></a><img src={photo.src} alt={photo.alt} className={styles.photoImage} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></article>)}</div><button type="button" className={`${styles.carouselButton} ${styles.rightButton}`} onClick={() => scroll(1)} aria-label="Próximas fotos"><ChevronRight /></button></div></section>
}

