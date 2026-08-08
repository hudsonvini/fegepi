'use client'

import Image from 'next/image'
import { ArrowUpRight, Camera, ChevronLeft, ChevronRight, ExternalLink, Images, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import styles from './LatestEventGallery.module.scss'

export type EventGalleryPhoto = { id: string; src: string; alt: string; downloadUrl?: string }
export type EventGalleryBanner = { title: string; description: string; imageSrc: string; imageAlt: string }
export type EventGalleryAlbum = {
    id: string
    eventDate?: string
    banner: EventGalleryBanner
    photos: EventGalleryPhoto[]
    driveUrl?: string
}
export type LatestEventGalleryProps = {
    eyebrow?: string
    title?: string
    banner?: EventGalleryBanner
    photos?: EventGalleryPhoto[]
    driveUrl?: string
    albums?: EventGalleryAlbum[]
}

const defaultPhotos: EventGalleryPhoto[] = [
    { id: '1', src: '/images/EventCarrosselImages/event1.webp', alt: 'Jogador comemorando durante partida oficial' },
    { id: '2', src: '/images/EventCarrosselImages/event2.webp', alt: 'Participantes durante uma partida em equipe' },
    { id: '3', src: '/images/EventCarrosselImages/event3.webp', alt: 'Arena principal do evento com público e equipes' },
    { id: '4', src: '/images/EventCarrosselImages/event1.webp', alt: 'Atleta focado durante a competição' },
    { id: '5', src: '/images/EventCarrosselImages/event2.webp', alt: 'Momento descontraído entre participantes' },
    { id: '6', src: '/images/EventCarrosselImages/event3.webp', alt: 'Painel de premiação ao final do torneio' },
]
const defaultAlbums: EventGalleryAlbum[] = [
    { id: 'cyber', banner: { title: 'Cyber League 2026', description: 'Os encontros, as jogadas e a energia do nosso último grande evento.', imageSrc: '/images/EventCarrosselImages/event1.webp', imageAlt: 'Equipe celebrando durante a final' }, photos: defaultPhotos },
    { id: 'arena', banner: { title: 'Arena Cup', description: 'Competição, comunidade e grandes momentos dentro e fora das partidas.', imageSrc: '/images/EventCarrosselImages/event2.webp', imageAlt: 'Jogadores durante a Arena Cup' }, photos: defaultPhotos },
    { id: 'masters', banner: { title: 'Masters Showdown', description: 'Uma seleção dos registros que marcaram o encontro da comunidade.', imageSrc: '/images/EventCarrosselImages/event3.webp', imageAlt: 'Arena do Masters Showdown' }, photos: defaultPhotos },
]

export default function LatestEventGallery({ eyebrow = 'Memórias da comunidade', title = 'Fotos dos eventos', banner, photos = defaultPhotos, driveUrl, albums }: LatestEventGalleryProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isInteracting, setIsInteracting] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const resolvedAlbums = (albums?.length ? albums : banner ? [{ id: 'legacy', banner, photos, driveUrl }] : defaultAlbums).slice(0, 3)
    const safeIndex = activeIndex % resolvedAlbums.length
    const activeAlbum = resolvedAlbums[safeIndex]

    useEffect(() => {
        if (resolvedAlbums.length <= 1 || isInteracting || isModalOpen) return
        const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % resolvedAlbums.length), 6500)
        return () => window.clearInterval(timer)
    }, [isInteracting, isModalOpen, resolvedAlbums.length])

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        const handleClose = () => document.body.style.removeProperty('overflow')
        dialog.addEventListener('close', handleClose)
        return () => { dialog.removeEventListener('close', handleClose); document.body.style.removeProperty('overflow') }
    }, [])

    if (!activeAlbum) return null

    function openGallery() { dialogRef.current?.showModal(); document.body.style.overflow = 'hidden'; setIsModalOpen(true) }
    function closeGallery() { dialogRef.current?.close(); setIsModalOpen(false) }
    function changeAlbum(direction: number) { setActiveIndex((current) => (current + direction + resolvedAlbums.length) % resolvedAlbums.length) }

    return (
        <section id="galeria" className={styles.container} aria-labelledby="event-gallery-title">
            <header className={styles.heading}><div><span>{eyebrow}</span><h2 id="event-gallery-title">{title}</h2></div><p>Registros de quem vive o cenário de games e e-sports do Piauí com a gente.</p></header>
            <article className={styles.albumCover} onMouseEnter={() => setIsInteracting(true)} onMouseLeave={() => setIsInteracting(false)}>
                <Image key={activeAlbum.id} src={activeAlbum.banner.imageSrc} alt={activeAlbum.banner.imageAlt} fill sizes="(max-width: 1480px) 94vw, 1400px" className={styles.coverImage} />
                <div className={styles.coverOverlay} aria-hidden="true" />
                <div className={styles.coverContent} key={`copy-${activeAlbum.id}`}>
                    <span className={styles.albumMeta}><Camera /> Álbum em destaque · {activeAlbum.photos.length} fotos</span>
                    <h3>{activeAlbum.banner.title}</h3><p>{activeAlbum.banner.description}</p>
                    <div className={styles.tags} aria-hidden="true"><span>FEGEPi</span><span>Comunidade</span><span>E-sports</span></div>
                    <button type="button" className={styles.openButton} onClick={openGallery}>Ver fotos <ArrowUpRight /></button>
                </div>
                <button type="button" className={styles.coverTrigger} onClick={openGallery} aria-label={`Abrir prévia do álbum ${activeAlbum.banner.title}`} />
                {resolvedAlbums.length > 1 ? <div className={styles.albumControls}>
                    <button type="button" onClick={() => changeAlbum(-1)} aria-label="Evento anterior"><ChevronLeft /></button>
                    <button type="button" onClick={() => changeAlbum(1)} aria-label="Próximo evento"><ChevronRight /></button>
                </div> : null}
                <div className={styles.coverFooter}>
                    {resolvedAlbums.map((album, index) => <button key={album.id} type="button" className={index === safeIndex ? styles.activeLine : ''} onClick={() => setActiveIndex(index)} aria-label={`Mostrar ${album.banner.title}`} />)}
                    <small>{safeIndex + 1} / {resolvedAlbums.length} · Explore o álbum</small>
                </div>
            </article>

            <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="gallery-dialog-title" onClick={(event) => { if (event.target === event.currentTarget) closeGallery() }}>
                <div className={styles.dialogPanel}>
                    <header className={styles.dialogHeader}><div><span><Images /> Prévia do álbum</span><h3 id="gallery-dialog-title">{activeAlbum.banner.title}</h3><p>{activeAlbum.banner.description}</p></div><button type="button" onClick={closeGallery} aria-label="Fechar galeria"><X /></button></header>
                    {activeAlbum.photos.length ? <div className={styles.photoGrid}>{activeAlbum.photos.slice(0, 6).map((photo, index) => <figure key={photo.id} className={index === 0 ? styles.leadPhoto : ''}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 88vw, (max-width: 1100px) 42vw, 360px" /><figcaption>{photo.alt}</figcaption></figure>)}</div> : <div className={styles.emptyPreview}><Camera /><strong>As fotos deste álbum serão publicadas em breve.</strong></div>}
                    <footer className={styles.dialogFooter}><span>Mostrando {Math.min(activeAlbum.photos.length, 6)} de {activeAlbum.photos.length} fotos</span>{activeAlbum.driveUrl ? <a href={activeAlbum.driveUrl} target="_blank" rel="noreferrer">Ver álbum completo no Drive <ExternalLink /></a> : <span className={styles.driveUnavailable}>Link do Drive em breve</span>}</footer>
                </div>
            </dialog>
        </section>
    )
}
