// import { Instagram } from 'lucide-react'
import styles from './Footer.module.scss'

type FooterLinkGroup = {
    title: string
    links: Array<{
        label: string
        href: string
    }>
}

type FooterProps = {
    brandTitle?: string
    groups?: FooterLinkGroup[]
}

const defaultGroups: FooterLinkGroup[] = [
    {
        title: 'FEGEPI',
        links: [
            { label: 'Sobre', href: '#' },
            { label: 'Institucional', href: '#' },
            { label: 'Contato', href: '#' },
        ],
    },
    {
        title: 'SELEÇÕES PIAUIENSES',
        links: [
            { label: 'League of Legends', href: '#' },
            { label: 'CS2', href: '#' },
            { label: 'Valorant', href: '#' },
            { label: 'FIFA', href: '#' },
            { label: 'Free Fire', href: '#' },
        ],
    },
    {
        title: 'CBGE',
        links: [
            { label: 'Eventos Parceiros', href: '#' },
            { label: 'Políticas', href: '#' },
        ],
    },
    {
        title: 'FILIAÇÃO',
        links: [
            { label: 'Cadastre seu time', href: '#' },
            { label: 'Entre em nosso Discord', href: '#' },
        ],
    },
]

export default function Footer({
    brandTitle = 'FEGEPI',
    groups = defaultGroups,
}: FooterProps) {
    return (
        <footer className={styles.footer}>
            <div className={styles.brandHeading}>{brandTitle}</div>

            <div className={styles.shell}>
                <div className={styles.content}>
                    <div className={styles.brandColumn}>
                        <div className={styles.brandBadge}>
                            <div className={styles.flag} aria-hidden="true">
                                <span className={styles.star}>★</span>
                                <span className={styles.flagTop}></span>
                                <span className={styles.flagBottom}></span>
                            </div>

                            <div className={styles.brandCenter}>
                                <strong>FEGEPI</strong>
                                <span>FEDERAÇÃO DE GAMES E E-SPORTS DO PIAUÍ</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.linksGrid}>
                        {groups.map((group) => (
                            <nav key={group.title} className={styles.linkGroup} aria-label={group.title}>
                                <h3>{group.title}</h3>
                                <ul>
                                    {group.links.map((link) => (
                                        <li key={link.label}>
                                            <a href={link.href}>{link.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>

                <div className={styles.bottomRow}>
                    <div className={styles.legalLinks}>
                        <a href="#">Termos de uso</a>
                        <span>|</span>
                        <a href="#">Políticas de Privacidade</a>
                        <span>|</span>
                        <a href="#">Política de Cookies</a>
                    </div>

                    <a className={styles.socialLink} href="#" aria-label="Instagram da FEGEPI">
                        {/* <Instagram /> */}
                    </a>

                    <p>Federação de Games e E-Sports do Piauí @ Todos os direitos reservados</p>
                </div>
            </div>

            <div className={styles.flagBar} aria-hidden="true">
                <span className={styles.flagStarBlock}>★</span>
                <span className={styles.stripes}></span>
            </div>
        </footer>
    )
}
