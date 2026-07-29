import BannersSection from '../content/BannersSection'
import EventsSection from '../content/EventsSection'
import GallerySection from '../content/GallerySection'
import GamesSection from '../content/GamesSection'
import type { AdminData, ContentSectionId } from '../types'

export default function ContentTab({
  section,
  data,
}: {
  section: ContentSectionId
  data: AdminData
}) {
  switch (section) {
    case 'jogos':
      return <GamesSection games={data.games} />
    case 'eventos':
      return <EventsSection events={data.events} />
    case 'galeria':
      return <GallerySection photos={data.photos} />
    default:
      return <BannersSection slides={data.heroSlides} />
  }
}
