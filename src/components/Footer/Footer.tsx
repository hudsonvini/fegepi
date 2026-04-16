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
                        <img src="/images/logoWhite.png" alt="" />
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
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224.3 141a115 115 0 1 0 -.6 230 115 115 0 1 0 .6-230zm-.6 40.4a74.6 74.6 0 1 1 .6 149.2 74.6 74.6 0 1 1 -.6-149.2zm93.4-45.1a26.8 26.8 0 1 1 53.6 0 26.8 26.8 0 1 1 -53.6 0zm129.7 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM399 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
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
