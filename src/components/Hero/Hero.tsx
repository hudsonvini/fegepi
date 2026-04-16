import Carrossel from '../Carrossel/Carrossel'
import EventsCarrossel from '../EventsCarrossel/EventsCarrossel'
import Navbar from '../Navbar/Navbar'
import styles from './Hero.module.scss'

export default function Hero() {
    return (
        <section className={styles.container}>
            <div className={styles.strip}>
                <img src="/star.svg" alt="Estrela" />
            </div>
            <div className={styles.internalContainer}>
                <Navbar />

                <Carrossel />

                <EventsCarrossel />
            </div>
        </section>
    )
}