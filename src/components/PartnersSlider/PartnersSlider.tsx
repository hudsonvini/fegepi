import styles from './PartnersSlider.module.scss'

const partners = [
    { name: 'SHEFINDS', variant: 'shefinds' },
    { name: 'Yahoo!', subtitle: 'news', variant: 'yahooNews' },
    { name: 'healthline', variant: 'healthline' },
    { name: 'Yahoo!', subtitle: 'news', variant: 'yahooNews' },
    { name: 'yahoo!', variant: 'yahoo' },
    { name: 'msn', variant: 'msn' },
]

type PartnerGroupProps = {
    ariaHidden?: boolean
    id: string
}

function PartnerGroup({ ariaHidden = false, id }: PartnerGroupProps) {
    return (
        <ul className={styles.group} aria-hidden={ariaHidden}>
            {partners.map((partner, index) => (
                <li
                    key={`${id}-${partner.name}-${index}`}
                    className={`${styles.logoCard} ${styles[partner.variant]}`}
                >
                    <span className={styles.wordmark}>{partner.name}</span>
                    {partner.subtitle ? (
                        <span className={styles.subtitle}>{partner.subtitle}</span>
                    ) : null}
                </li>
            ))}
        </ul>
    )
}

export default function PartnersSlider() {
    return (
        <section className={styles.container} aria-labelledby="partners-title">
            <div className={styles.titleArea}>
                <span>Quem nos apoia</span>
                <h2 id="partners-title">Nossos parceiros</h2>
            </div>

            <div className={styles.slider}>
                <div className={styles.marquee}>
                    <PartnerGroup id="primary" />
                    <PartnerGroup id="duplicate" ariaHidden />
                </div>
            </div>
        </section>
    )
}
