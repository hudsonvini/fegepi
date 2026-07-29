import { Image as ImageIcon } from 'lucide-react'
import { createGalleryPhotoAction, saveGalleryAction } from '@/app/admin/actions'
import styles from '@/app/admin/page.module.scss'
import { EditGalleryPhotoModal } from '@/components/AdminEditForms/AdminEditForms'
import AdminEmptyState from '@/components/AdminEmptyState/AdminEmptyState'
import MediaUploadField from '@/components/AdminFormControls/MediaUploadField'
import ValidatedField from '@/components/AdminFormControls/ValidatedField'
import AdminModal from '@/components/AdminModal/AdminModal'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import { displayMediaUrl } from '@/lib/media-url'
import { DeleteButton, SectionTitle } from '../shared'
import type { GalleryPhoto } from '../types'

function EditGalleryCoverModal() {
  return (
    <AdminModal title="Atualizar capa da galeria" triggerLabel="Editar capa">
      <form action={saveGalleryAction} className={styles.form}>
        <input type="hidden" name="contentSection" value="galeria" />
        <div className={styles.pair}>
          <ValidatedField name="eyebrow" label="Texto menor" defaultValue="Quem nos apoia" />
          <ValidatedField name="title" label="Título da seção" defaultValue="Fotos do último evento" />
        </div>
        <ValidatedField name="bannerTitle" label="Título da capa" />
        <textarea name="bannerDescription" placeholder="Descrição da capa" />
        <ValidatedField name="bannerAlt" label="Descrição acessível" required minLength={3} />
        <MediaUploadField name="banner" label="Imagem de capa" description="Envie a arte principal da galeria." required />
        <AdminSubmitButton className={styles.primaryButton} pendingLabel="Salvando capa...">
          Salvar capa
        </AdminSubmitButton>
      </form>
    </AdminModal>
  )
}

function AddGalleryPhotoModal({ triggerLabel = 'Adicionar foto' }: { triggerLabel?: string }) {
  return (
    <AdminModal title="Adicionar foto à galeria" triggerLabel={triggerLabel}>
      <form action={createGalleryPhotoAction} className={styles.form}>
        <input type="hidden" name="contentSection" value="galeria" />
        <ValidatedField name="alt" label="Descrição da foto" required minLength={3} />
        <ValidatedField name="downloadUrl" label="URL de download" optional kind="url" />
        <MediaUploadField name="image" label="Foto da galeria" description="Arraste a foto ou clique para selecionar." required />
        <ValidatedField name="displayOrder" label="Ordem" kind="number" type="number" min={0} required defaultValue="0" />
        <AdminSubmitButton className={styles.primaryButton} pendingLabel="Enviando foto...">
          Adicionar foto
        </AdminSubmitButton>
      </form>
    </AdminModal>
  )
}

export default function GallerySection({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <>
      <SectionTitle
        eyebrow="Conteúdo · Galeria"
        title="Galeria de eventos"
        description="Atualize a capa e gerencie as imagens disponíveis para a comunidade."
        action={(
          <div className={styles.modalActions}>
            <EditGalleryCoverModal />
            <AddGalleryPhotoModal />
          </div>
        )}
      />

      {photos.length ? (
        <div className={styles.contentCards}>
          {photos.map((photo) => (
            <article key={photo.id} className={styles.contentCard}>
              <img src={displayMediaUrl(photo.image_url) ?? photo.image_url} alt={photo.alt_text} />
              <div>
                <span>Galeria de eventos</span>
                <h2>{photo.alt_text}</h2>
                <p>{photo.active ? 'Disponível na home' : 'Oculta da home'}</p>
              </div>
              <div className={styles.cardActions}>
                <EditGalleryPhotoModal photo={photo} />
                <DeleteButton table="gallery_photos" id={photo.id} tab="conteudo" section="galeria" />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          icon={<ImageIcon size={25} />}
          title="A galeria ainda está vazia"
          description="Adicione fotos do último evento para disponibilizá-las na página inicial."
          action={<AddGalleryPhotoModal triggerLabel="Adicionar primeira foto" />}
        />
      )}
    </>
  )
}
