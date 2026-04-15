import styles from './EventsCarrossel.module.scss'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export default function EventsCarrossel() {
    return (
        <section className={styles.container}>
            <div className={styles.titleSection}>
                <div className={styles.titleArea}>
                    <span>Federe o seu time e participe!</span>
                    <h1>Eventos Oficiais</h1>
                </div>

                <div className={styles.buttonsArea}>
                    <div className={`${styles.button} ${styles.leftBut}`}>
                        <ChevronLeft />
                    </div>
                    <div className={`${styles.button} ${styles.leftBut}`}>
                        <ChevronRight />
                    </div>
                </div>
            </div>

            <div className={styles.carrosselArea}>
                <article className={`${styles.card} ${styles.destaq}`}>
                    <div className={styles.mediaArea}>
                        <img src="/images/EventCarrosselImages/event1.webp" alt="Event Media 1" />

                        <div className={styles.titleArea}>
                            <h1>Cyber League</h1>
                            <p>de 27 á 31 de Outubro</p>
                        </div>
                    </div>
                    <div className={styles.textArea}>
                        <div className={styles.leftArea}>
                            <p><Calendar /> de 27 á 31 de Outubro</p>
                            <span className={`${styles.status} ${styles.active}`}>Inscrições abertas</span>
                        </div>

                        <a className={styles.inscreverButton} href=""><span>Inscrever-se</span><ChevronRight /></a>
                    </div>
                </article>

                <article className={`${styles.card}`}>
                    <div className={styles.mediaArea}>
                        <img src="/images/EventCarrosselImages/event2.webp" alt="Event Media 1" />

                        <div className={styles.titleArea}>
                            <h1>Cyber League</h1>
                            <p>de 27 á 31 de Outubro</p>
                        </div>
                    </div>
                    <div className={styles.textArea}>
                        <div className={styles.leftArea}>
                            <p><Calendar /> de 27 á 31 de Outubro</p>
                            <span className={`${styles.status}`}>Inscrições abertas</span>
                        </div>

                        <a className={styles.inscreverButton} href=""><span>Inscrever-se</span><ChevronRight /></a>
                    </div>
                </article>

                <article className={`${styles.card}`}>
                    <div className={styles.mediaArea}>
                        <img src="/images/EventCarrosselImages/event3.webp" alt="Event Media 1" />

                        <div className={styles.titleArea}>
                            <h1>Cyber League</h1>
                            <p>de 27 á 31 de Outubro</p>
                        </div>
                    </div>
                    <div className={styles.textArea}>
                        <div className={styles.leftArea}>
                            <p><Calendar /> de 27 á 31 de Outubro</p>
                            <span className={`${styles.status} ${styles.active}`}>Inscrições abertas</span>
                        </div>

                        <a className={styles.inscreverButton} href=""><span>Inscrever-se</span><ChevronRight /></a>
                    </div>
                </article>
            </div>
        </section>
    )
}