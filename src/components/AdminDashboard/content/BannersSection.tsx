import { PanelsTopLeft } from 'lucide-react'
import { createHeroSlideAction } from '@/app/admin/actions'
import styles from '@/app/admin/page.module.scss'
import { EditHeroSlideModal } from '@/components/AdminEditForms/AdminEditForms'
import AdminEmptyState from '@/components/AdminEmptyState/AdminEmptyState'
import MediaUploadField from '@/components/AdminFormControls/MediaUploadField'
import ValidatedField from '@/components/AdminFormControls/ValidatedField'
import AdminModal from '@/components/AdminModal/AdminModal'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import { displayMediaUrl, isVideoMediaUrl } from '@/lib/media-url'
import { DeleteButton, SectionTitle } from '../shared'
import type { HeroSlide } from '../types'

function AddBannerModal({ triggerLabel = 'Adicionar banner' }: { triggerLabel?: string }) {
  return (
    <AdminModal
      title="Adicionar banner principal"
      description="Monte um destaque com imagem, texto e botão para o carrossel da página inicial."
      triggerLabel={triggerLabel}
    >
      <form action={createHeroSlideAction} className={styles.form}>
        <input type="hidden" name="contentSection" value="banners" />
        <ValidatedField name="eyebrow" label="Chamada superior" optional maxLength={40} placeholder="Ex.: Destaque FEGEPI" />
        <ValidatedField name="title" label="Título do banner" optional maxLength={90} placeholder="Ex.: Circuito FEGEPI 2026" />
        <ValidatedField name="description" label="Descrição" optional maxLength={220} placeholder="Uma frase curta para apresentar a campanha." />
        <ValidatedField name="ctaLabel" label="Texto do botão" optional maxLength={35} placeholder="Ex.: Saiba mais" />
        <ValidatedField name="linkUrl" label="Link do botão" optional kind="url" placeholder="https://... ou /pagina" />
        <ValidatedField name="alt" label="Descrição acessível da mídia" required minLength={3} placeholder="Ex.: Campanha Julho Gamer" />
        <MediaUploadField
          name="image"
          label="Mídia do banner"
          description="Arraste uma imagem, GIF ou vídeo MP4 da campanha."
          accept="image/*,.gif,video/mp4"
          allowVideo
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
              {isVideoMediaUrl(slide.image_url) ? (
                <video src={displayMediaUrl(slide.image_url) ?? slide.image_url} aria-label={slide.alt_text} autoPlay muted loop playsInline />
              ) : (
                <img src={displayMediaUrl(slide.image_url) ?? slide.image_url} alt={slide.alt_text} />
              )}
              <div>
                <span>Banner #{slide.display_order + 1}</span>
                <h2>{slide.title || slide.alt_text}</h2>
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
