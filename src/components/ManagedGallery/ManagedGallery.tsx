import LatestEventGallery, {
  type EventGalleryBanner,
  type EventGalleryAlbum,
  type EventGalleryPhoto,
} from '../LatestEventGallery/LatestEventGallery'

type Props = {
  eyebrow?: string
  title?: string
  banner?: EventGalleryBanner
  photos?: EventGalleryPhoto[]
  driveUrl?: string
  albums?: EventGalleryAlbum[]
}

export default function ManagedGallery(props: Props) {
  if (!props.banner && !props.albums?.length) return null
  return <LatestEventGallery {...props} />
}
