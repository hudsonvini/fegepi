/* eslint-disable @next/next/no-img-element */

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
import type { GalleryPhoto, GallerySettings } from '../types'

function EditGalleryCoverModal({ settings }: { settings: GallerySettings | null }) {
  return (
    <AdminModal title="Configurar álbum em destaque" description="Edite a capa, os textos e a pasta completa de fotos no Google Drive." triggerLabel={settings ? 'Editar álbum' : 'Configurar álbum'}>
      <form action={saveGalleryAction} className={styles.form}>
        <input type="hidden" name="contentSection" value="galeria" />
        <div className={styles.pair}>
          <ValidatedField name="eyebrow" label="Texto menor" defaultValue={settings?.eyebrow ?? 'Memórias da comunidade'} />
          <ValidatedField name="title" label="Título da seção" defaultValue={settings?.title ?? 'Fotos dos eventos'} />
        </div>
        <ValidatedField name="bannerTitle" label="Nome do evento" required minLength={3} defaultValue={settings?.banner_title ?? ''} />
        <label>
          <span>Descrição do álbum</span>
          <textarea name="bannerDescription" placeholder="Conte um pouco sobre o evento" defaultValue={settings?.banner_description ?? ''} />
        </label>
        <ValidatedField name="driveUrl" label="Link da pasta no Google Drive" optional kind="url" defaultValue={settings?.drive_url ?? ''} />
        <ValidatedField name="bannerAlt" label="Descrição acessível da capa" required minLength={3} defaultValue={settings?.banner_image_alt ?? ''} />
        <MediaUploadField name="banner" label="Imagem de capa" description="Use uma foto horizontal marcante do evento." defaultUrl={settings?.banner_image_url} required />
        <AdminSubmitButton className={styles.primaryButton} pendingLabel="Salvando álbum...">Salvar álbum</AdminSubmitButton>
      </form>
    </AdminModal>
  )
}

function AddGalleryPhotoModal({ triggerLabel = 'Adicionar foto' }: { triggerLabel?: string }) {
  return (
    <AdminModal title="Adicionar foto à prévia" description="As seis primeiras fotos aparecem na modal do álbum na página inicial." triggerLabel={triggerLabel}>
      <form action={createGalleryPhotoAction} className={styles.form}>
        <input type="hidden" name="contentSection" value="galeria" />
        <ValidatedField name="alt" label="Descrição da foto" required minLength={3} />
        <MediaUploadField name="image" label="Foto da galeria" description="Arraste a foto ou clique para selecionar." required />
        <ValidatedField name="displayOrder" label="Ordem na prévia" kind="number" type="number" min={0} required defaultValue="0" />
        <AdminSubmitButton className={styles.primaryButton} pendingLabel="Enviando foto...">Adicionar foto</AdminSubmitButton>
      </form>
    </AdminModal>
  )
}

export default function GallerySection({ photos, settings }: { photos: GalleryPhoto[]; settings: GallerySettings | null }) {
  return (
    <>
      <SectionTitle
        eyebrow="Conteúdo · Galeria"
        title="Álbum de eventos"
        description="Gerencie a capa editorial, a prévia de fotos e o acesso ao álbum completo no Drive."
        action={<div className={styles.modalActions}><EditGalleryCoverModal settings={settings} /><AddGalleryPhotoModal /></div>}
      />

      {settings?.banner_image_url ? (
        <div className={styles.contentCards}>
          <article className={styles.contentCard}>
            <img src={displayMediaUrl(settings.banner_image_url) ?? settings.banner_image_url} alt={settings.banner_image_alt} />
            <div><span>Álbum em destaque</span><h2>{settings.banner_title}</h2><p>{settings.drive_url ? 'Drive conectado' : 'Adicione o link do Drive'}</p></div>
          </article>
        </div>
      ) : null}

      {photos.length ? (
        <div className={styles.contentCards}>
          {photos.map((photo) => (
            <article key={photo.id} className={styles.contentCard}>
              <img src={displayMediaUrl(photo.image_url) ?? photo.image_url} alt={photo.alt_text} />
              <div><span>Foto da prévia</span><h2>{photo.alt_text}</h2><p>{photo.active ? 'Disponível na home' : 'Oculta da home'}</p></div>
              <div className={styles.cardActions}><EditGalleryPhotoModal photo={photo} /><DeleteButton table="gallery_photos" id={photo.id} tab="conteudo" section="galeria" /></div>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmptyState icon={<ImageIcon size={25} />} title="A prévia do álbum está vazia" description="Adicione algumas fotos para apresentá-las antes de direcionar o visitante ao Drive." action={<AddGalleryPhotoModal triggerLabel="Adicionar primeira foto" />} />
      )}
    </>
  )
}
