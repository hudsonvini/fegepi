'use client'

import { useEffect, useState } from 'react'
import {
    Building2,
    CalendarDays,
    House,
    LogIn,
    Mail,
    Menu,
    Trophy,
    UserPlus,
    X,
} from 'lucide-react'
import styles from './Navbar.module.scss'

const navigationLinks = [
    { label: 'Home', href: '#', icon: <House />, featured: true },
    { label: 'Eventos', href: '#', icon: <CalendarDays /> },
    { label: 'Institucional', href: '#', icon: <Building2 /> },
    { label: 'Ranking', href: '#', icon: <Trophy /> },
    { label: 'Contato', href: '#', icon: <Mail /> },
]

const accessLinks = [
    { label: 'Cadastro', href: '', icon: <UserPlus />, highlighted: true },
    { label: 'Login', href: '', icon: <LogIn /> },
]

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        if (!isMenuOpen) {
            document.body.style.overflow = ''
            return
        }

        document.body.style.overflow = 'hidden'

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsMenuOpen(false)
            }
        }

        window.addEventListener('keydown', handleEscape)

        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleEscape)
        }
    }, [isMenuOpen])

    function closeMenu() {
        setIsMenuOpen(false)
    }

    return (
        <>
            <nav className={styles.container}>
                <a className={styles.logo} href="">
                    <img src="/images/logo.png" alt="Logo Fegepi" />
                </a>

                <ul className={styles.listLink}>
                    {navigationLinks.map((link) => (
                        <li key={link.label}>
                            <a className={`${styles.link} ${link.featured ? styles.destaq : ''}`} href={link.href}>
                                {link.icon}
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className={styles.buttonsArea}>
                    <a className={`${styles.button} ${styles.cadastro}`} href="">
                        Cadastro
                    </a>
                    <a className={`${styles.button} ${styles.login}`} href="">
                        Login
                    </a>
                </div>

                <button
                    type="button"
                    className={styles.menuButton}
                    onClick={() => setIsMenuOpen(true)}
                    aria-label="Abrir menu"
                    aria-expanded={isMenuOpen}
                    aria-controls="navbar-mobile-drawer"
                >
                    <Menu />
                </button>
            </nav>

            <div
                className={`${styles.menuOverlay} ${isMenuOpen ? styles.menuOverlayVisible : ''}`}
                onClick={closeMenu}
                aria-hidden={!isMenuOpen}
            />

            <aside
                id="navbar-mobile-drawer"
                className={`${styles.menuDrawer} ${isMenuOpen ? styles.menuDrawerOpen : ''}`}
                aria-hidden={!isMenuOpen}
            >
                <div className={styles.drawerHeader}>
                    <div className={styles.drawerProfile}>
                        <div className={styles.avatarWrap}>
                            <img src="/images/logo.png" alt="Logo Fegepi" />
                        </div>

                        <div className={styles.profileText}>
                            <strong>FEGEPI</strong>
                            <span>Federacao de Games e E-Sports do Piaui</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={closeMenu}
                        aria-label="Fechar menu"
                    >
                        <X />
                    </button>
                </div>

                <div className={styles.drawerBody}>
                    <div className={styles.drawerSection}>
                        {navigationLinks.map((link) => (
                            <a
                                key={link.label}
                                className={`${styles.drawerLink} ${link.featured ? styles.drawerLinkFeatured : ''}`}
                                href={link.href}
                                onClick={closeMenu}
                            >
                                <span className={styles.drawerIcon}>{link.icon}</span>
                                <span>{link.label}</span>
                            </a>
                        ))}
                    </div>

                    <div className={styles.drawerDivider} />

                    <div className={styles.drawerSection}>
                        <h2>Acesso</h2>

                        {accessLinks.map((link) => (
                            <a
                                key={link.label}
                                className={`${styles.drawerLink} ${link.highlighted ? styles.drawerAccessPrimary : ''}`}
                                href={link.href}
                                onClick={closeMenu}
                            >
                                <span className={styles.drawerIcon}>{link.icon}</span>
                                <span>{link.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    )
}
