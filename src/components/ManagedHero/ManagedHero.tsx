import type { EventCarouselItem } from '@/components/EventsCarrossel/EventsCarrossel'
import type { CurrentUser } from '@/lib/auth'
import Carrossel from '../Carrossel/Carrossel'
import EventsCarrossel from '../EventsCarrossel/EventsCarrossel'
import ManagedNavbar from '../ManagedNavbar/ManagedNavbar'
import styles from '../Hero/Hero.module.scss'

export default function ManagedHero({ user, events }: { user: CurrentUser | null; events?: EventCarouselItem[] }) {
  return (
    <section className={styles.container}>
      <div className={styles.strip}>
        <img src="/star.svg" alt="Estrela" />
      </div>
      <div className={styles.internalContainer}>
        <ManagedNavbar user={user} />
        <Carrossel />
        <div id="eventos">
          <EventsCarrossel events={events} />
        </div>
      </div>
    </section>
  )
}
