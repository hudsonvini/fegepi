import { PanelsTopLeft } from 'lucide-react'
import { createHeroSlideAction } from '@/app/admin/actions'
import styles from '@/app/admin/page.module.scss'
import { EditHeroSlideModal } from '@/components/AdminEditForms/AdminEditForms'
import AdminEmptyState from '@/components/AdminEmptyState/AdminEmptyState'
import MediaUploadField from '@/components/AdminFormControls/MediaUploadField'
import ValidatedField from '@/components/AdminFormControls/ValidatedField'
import AdminModal from '@/components/AdminModal/AdminModal'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import { displayMediaUrl } from '@/lib/media-url'
import { DeleteButton, SectionTitle } from '../shared'
import type { HeroSlide } from '../types'

function AddBannerModal({ triggerLabel = 'Adicionar banner' }: { triggerLabel?: string }) {
  return (
    <AdminModal
      title="Adicionar banner principal"
      description="A imagem será publicada no carrossel do topo conforme a ordem informada."
      triggerLabel={triggerLabel}
    >
      <form action={createHeroSlideAction} className={styles.form}>
        <input type="hidden" name="contentSection" value="banners" />
        <ValidatedField name="alt" label="Descrição do banner" required minLength={3} placeholder="Ex.: Campanha Julho Gamer" />
        <ValidatedField name="linkUrl" label="Link ao clicar" optional kind="url" placeholder="https://... ou /pagina" />
        <MediaUploadField
          name="image"
          label="Imagem do banner"
          description="Arraste a arte da campanha ou clique para selecionar."
          required
        />
        <ValidatedField name="displayOrder" label="Ordem de exibição" kind="number" type="number" min={0} required defaultValue="0" />
        <AdminSubmitButton className={styles.primaryButton} pendingLabel="Publicando banner...">
          Publicar banner
        </AdminSubmitButton>
      </form>
    </AdminModal>
  )
}

export default function BannersSection({ slides }: { slides: HeroSlide[] }) {
  return (
    <>
      <SectionTitle
        eyebrow="Conteúdo · Banners"
        title="Carrossel principal"
        description="Gerencie as campanhas que aparecem no topo da página inicial."
        action={<AddBannerModal />}
      />

      {slides.length ? (
        <div className={styles.contentCards}>
          {slides.map((slide) => (
            <article key={slide.id} className={styles.contentCard}>
              <img src={displayMediaUrl(slide.image_url) ?? slide.image_url} alt={slide.alt_text} />
              <div>
                <span>Banner #{slide.display_order + 1}</span>
                <h2>{slide.alt_text}</h2>
                <p>{slide.active ? 'Publicado no topo da home' : 'Oculto da home'}</p>
              </div>
              <div className={styles.cardActions}>
                <EditHeroSlideModal slide={slide} />
                <DeleteButton table="hero_slides" id={slide.id} tab="conteudo" section="banners" />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          icon={<PanelsTopLeft size={25} />}
          title="Nenhum banner cadastrado"
          description="Adicione a primeira campanha ao carrossel principal do site."
          action={<AddBannerModal triggerLabel="Cadastrar banner" />}
        />
      )}
    </>
  )
}
