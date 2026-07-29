import type { EventCarouselItem } from '@/components/EventsCarrossel/EventsCarrossel'
import type { HeroCarouselSlide } from '@/components/Carrossel/Carrossel'
import type { CurrentUser } from '@/lib/auth'
import Carrossel from '../Carrossel/Carrossel'
import EventsCarrossel from '../EventsCarrossel/EventsCarrossel'
import ManagedNavbar from '../ManagedNavbar/ManagedNavbar'
import styles from '../Hero/Hero.module.scss'

export default function ManagedHero({ user, events, slides }: { user: CurrentUser | null; events?: EventCarouselItem[]; slides?: HeroCarouselSlide[] }) {
  return (
    <section className={styles.container}>
      <div className={styles.strip}>
        <img src="/star.svg" alt="Estrela" />
      </div>
      <div className={styles.internalContainer}>
        <ManagedNavbar user={user} />
        <Carrossel slides={slides} />
        <div id="eventos">
          <EventsCarrossel events={events} />
        </div>
      </div>
    </section>
  )
}
