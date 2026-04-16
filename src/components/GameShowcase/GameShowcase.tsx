import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import styles from './GameShowcase.module.scss'

export type ShowcaseMetric = {
    id: string
    label: string
    value: string
}

type GameShowcaseProps = {
    title?: string
    description?: string
    buttonLabel?: string
    buttonHref?: string
    primaryImageSrc?: string
    primaryImageAlt?: string
    secondaryImageSrc?: string
    secondaryImageAlt?: string
    metrics?: ShowcaseMetric[]
}

const defaultMetrics: ShowcaseMetric[] = [
    { id: '1', label: 'de 27 à 31 de Outubro', value: '+ 10' },
    { id: '2', label: 'de 27 à 31 de Outubro', value: '+ 10' },
    { id: '3', label: 'de 27 à 31 de Outubro', value: '+ 10' },
    { id: '4', label: 'de 27 à 31 de Outubro', value: '+ 10' },
]

export default function GameShowcase({
    title = 'VALORANT',
    description = 'Mais do que armas e munição, VALORANT inclui agentes com habilidades adaptativas, rápidas e letais, que criam oportunidades para você exibir sua mecânica de tiro. Cada Agente é único, assim como os momentos de destaque de cada partida!',
    buttonLabel = 'Cadastre sua equipe',
    buttonHref = '#',
    primaryImageSrc = '/images/EventCarrosselImages/event1.webp',
    primaryImageAlt = 'Destaque principal do jogo',
    secondaryImageSrc = '/images/EventCarrosselImages/event2.webp',
    secondaryImageAlt = 'Segundo destaque visual do jogo',
    metrics = defaultMetrics,
}: GameShowcaseProps) {
    return (
        <section className={styles.container}>
            <div className={styles.card}>
                <div className={styles.topNotch} aria-hidden="true"></div>

                <div className={styles.heroArea}>
                    <div className={styles.mediaArea}>
                        <div className={`${styles.characterCard} ${styles.primaryCard}`}>
                            <Image
                                src={primaryImageSrc}
                                alt={primaryImageAlt}
                                fill
                                sizes="(max-width: 1024px) 100vw, 34vw"
                                className={styles.characterImage}
                            />
                        </div>

                        <div className={`${styles.characterCard} ${styles.secondaryCard}`}>
                            <Image
                                src={secondaryImageSrc}
                                alt={secondaryImageAlt}
                                fill
                                sizes="(max-width: 1024px) 100vw, 24vw"
                                className={styles.characterImage}
                            />
                        </div>

                        <div className={styles.mediaGlow}></div>
                    </div>

                    <div className={styles.contentArea}>
                        <h2>{title}</h2>
                        <p>{description}</p>

                        <a className={styles.ctaButton} href={buttonHref}>
                            <span>{buttonLabel}</span>
                            <ArrowRight />
                        </a>
                    </div>
                </div>

                <div className={styles.metricsArea}>
                    {metrics.map((metric) => (
                        <article key={metric.id} className={styles.metricCard}>
                            <span>{metric.label}</span>
                            <strong>{metric.value}</strong>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
