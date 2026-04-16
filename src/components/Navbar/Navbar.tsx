import styles from './Navbar.module.scss'
import { House } from 'lucide-react'

export default function Navbar() {
    return (
        <nav className={styles.container}>
            <a className={styles.logo} href="">
                <img src="/images/logo.png" alt="Logo Fegepi" />
            </a>

            <ul className={styles.listLink}>
                <a className={`${styles.link} ${styles.destaq}`} href="#"><House />Home</a>
                <a className={styles.link} href="#">Eventos</a>
                <a className={styles.link} href="#">Institucional </a>
                <a className={styles.link} href="#">Ranking</a>
                <a className={styles.link} href="#">Contato</a>
            </ul>

            <div className={styles.buttonsArea}>
                <a className={`${styles.button} ${styles.cadastro}`} href="">Cadastro</a>
                <a className={`${styles.button} ${styles.login}`} href="">Login</a>
            </div>
        </nav>
    )
}