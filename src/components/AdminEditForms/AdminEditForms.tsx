import {
  updateEventAction,
  updateGalleryPhotoAction,
  updateGameAction,
  updateHeroSlideAction,
  updateTeamAction,
} from '@/app/admin/actions'
import MediaUploadField from '@/components/AdminFormControls/MediaUploadField'
import ValidatedField from '@/components/AdminFormControls/ValidatedField'
import AdminModal from '@/components/AdminModal/AdminModal'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import styles from './AdminEditForms.module.scss'

export function EditHeroSlideModal({ slide }: { slide: {
  id: string
  image_url: string
  alt_text: string
  eyebrow: string | null
  title: string | null
  description: string | null
  cta_label: string | null
  link_url: string | null
  active: boolean
  display_order: number
} }) {
  return (
    <AdminModal
      title="Editar banner"
      description="Atualize somente o que precisar. A mídia atual será mantida automaticamente."
      triggerLabel="Editar"
      triggerIcon="edit"
    >
      <form action={updateHeroSlideAction} className={styles.form}>
        <input type="hidden" name="id" value={slide.id} />
        <input type="hidden" name="oldImageUrl" value={slide.image_url} />

        <ValidatedField name="eyebrow" label="Chamada superior" optional maxLength={40} defaultValue={slide.eyebrow ?? ''} placeholder="Ex.: Destaque FEGEPI" />
        <ValidatedField name="title" label="Título do banner" optional maxLength={90} defaultValue={slide.title ?? ''} />
        <ValidatedField name="description" label="Descrição" optional maxLength={220} defaultValue={slide.description ?? ''} />
        <ValidatedField name="ctaLabel" label="Texto do botão" optional maxLength={35} defaultValue={slide.cta_label ?? ''} placeholder="Ex.: Saiba mais" />
        <ValidatedField
          name="linkUrl"
          label="Link do botão"
          optional
          kind="url"
          defaultValue={slide.link_url ?? ''}
          placeholder="https://... ou /pagina"
        />
        <ValidatedField
          name="alt"
          label="Descrição acessível da mídia"
          required
          minLength={3}
          defaultValue={slide.alt_text}
          helpText="Usada por leitores de tela e na identificação do painel."
        />
        <MediaUploadField
          name="image"
          label="Mídia do banner"
          description="Visualize a mídia atual ou arraste uma imagem, GIF ou vídeo MP4 para substituí-la."
          defaultUrl={slide.image_url}
          accept="image/*,.gif,video/mp4"
          allowVideo
          required
        />
        <ValidatedField
          name="displayOrder"
          label="Ordem de exibição"
          kind="number"
          type="number"
          min={0}
          required
          defaultValue={slide.display_order}
        />
        <label className={styles.check}>
          <input name="active" type="checkbox" defaultChecked={slide.active} />
          <span><strong>Exibir na página inicial</strong><small>O banner ficará disponível no carrossel principal.</small></span>
        </label>
        <AdminSubmitButton className={styles.submit} pendingLabel="Salvando banner...">
          Salvar alterações
        </AdminSubmitButton>
      </form>
    </AdminModal>
  )
}

export function EditGameModal({ game }: { game: {
  id: string
  name: string
  short_name: string
  theme: string
  image_url: string
  active: boolean
  display_order: number
} }) {
  return (
    <AdminModal
      title="Editar jogo"
      description="Altere a apresentação do jogo e sua posição nos filtros."
      triggerLabel="Editar"
      triggerIcon="edit"
    >
      <form action={updateGameAction} className={styles.form}>
        <input type="hidden" name="id" value={game.id} />
        <input type="hidden" name="oldImageUrl" value={game.image_url} />
        <ValidatedField name="name" label="Nome" required minLength={2} defaultValue={game.name} />
        <div className={styles.pair}>
          <ValidatedField name="shortName" label="Sigla" required maxLength={12} defaultValue={game.short_name} />
          <label className={styles.selectField}>
            <span>Tema visual</span>
            <select name="theme" defaultValue={game.theme}>
              <option value="cs2">CS2</option>
              <option value="valorant">Valorant</option>
              <option value="lol">League of Legends</option>
              <option value="freefire">Free Fire</option>
              <option value="fc26">FC 26</option>
            </select>
          </label>
        </div>
        <MediaUploadField
          name="image"
          label="Imagem do jogo"
          description="A arte aparece no seletor de jogos da página inicial."
          defaultUrl={game.image_url}
          required
        />
        <ValidatedField name="displayOrder" label="Ordem de exibição" kind="number" type="number" min={0} required defaultValue={game.display_order} />
        <label className={styles.check}>
          <input name="active" type="checkbox" defaultChecked={game.active} />
          <span><strong>Exibir na página inicial</strong><small>Disponibiliza o jogo nos filtros e rankings.</small></span>
        </label>
        <AdminSubmitButton className={styles.submit} pendingLabel="Salvando jogo...">
          Salvar alterações
        </AdminSubmitButton>
      </form>
    </AdminModal>
  )
}

export function EditEventModal({ event }: { event: {
  id: string
  title: string
  starts_at: string
  ends_at: string | null
  subtitle: string | null
  status_label: string
  status_tone: string
  image_url: string
  featured_media_url: string | null
  registration_url: string | null
  cta_label: string
  active: boolean
  display_order: number
} }) {
  return (
    <AdminModal
      title="Editar evento"
      description="Atualize agenda, chamadas, mídias e publicação do evento."
      triggerLabel="Editar"
      triggerIcon="edit"
    >
      <form action={updateEventAction} className={styles.form}>
        <input type="hidden" name="id" value={event.id} />
        <input type="hidden" name="oldImageUrl" value={event.image_url} />
        <input type="hidden" name="oldFeaturedUrl" value={event.featured_media_url ?? ''} />

        <ValidatedField name="title" label="Título" required minLength={3} defaultValue={event.title} />
        <div className={styles.pair}>
          <ValidatedField name="startsAt" label="Início" kind="date" type="date" required defaultValue={event.starts_at} />
          <ValidatedField name="endsAt" label="Fim" optional kind="date" type="date" defaultValue={event.ends_at ?? ''} />
        </div>
        <ValidatedField name="subtitle" label="Subtítulo" optional defaultValue={event.subtitle ?? ''} />
        <div className={styles.pair}>
          <ValidatedField name="statusLabel" label="Texto do status" defaultValue={event.status_label} />
          <label className={styles.selectField}>
            <span>Tom do status</span>
            <select name="statusTone" defaultValue={event.status_tone}>
              <option value="active">Ativo</option>
              <option value="inactive">Em breve</option>
            </select>
          </label>
        </div>

        <MediaUploadField
          name="image"
          label="Imagem principal"
          description="Imagem exibida no card do evento."
          defaultUrl={event.image_url}
          required
        />
        <MediaUploadField
          name="featured"
          label="Mídia em destaque"
          description="Imagem, GIF ou vídeo mostrado quando o evento ganha destaque."
          defaultUrl={event.featured_media_url}
          accept="image/*,.gif,video/mp4"
          allowVideo
        />
        <label className={styles.check}>
          <input name="removeFeatured" type="checkbox" />
          <span><strong>Remover mídia em destaque</strong><small>Marque somente se desejar apagar a mídia atual.</small></span>
        </label>
        <ValidatedField name="registrationUrl" label="Link de inscrição" optional kind="url" defaultValue={event.registration_url ?? ''} />
        <div className={styles.pair}>
          <ValidatedField name="ctaLabel" label="Texto do botão" defaultValue={event.cta_label} />
          <ValidatedField name="displayOrder" label="Ordem" kind="number" type="number" min={0} required defaultValue={event.display_order} />
        </div>
        <label className={styles.check}>
          <input name="active" type="checkbox" defaultChecked={event.active} />
          <span><strong>Publicar na página inicial</strong><small>Deixa o evento visível para a comunidade.</small></span>
        </label>
        <AdminSubmitButton className={styles.submit} pendingLabel="Salvando evento...">
          Salvar alterações
        </AdminSubmitButton>
      </form>
    </AdminModal>
  )
}

export function EditGalleryPhotoModal({ photo }: { photo: {
  id: string
  image_url: string
  alt_text: string
  download_url: string | null
  active: boolean
  display_order: number
} }) {
  return (
    <AdminModal
      title="Editar foto"
      description="Atualize a imagem, a descrição e a posição na galeria."
      triggerLabel="Editar"
      triggerIcon="edit"
    >
      <form action={updateGalleryPhotoAction} className={styles.form}>
        <input type="hidden" name="id" value={photo.id} />
        <input type="hidden" name="oldImageUrl" value={photo.image_url} />
        <ValidatedField name="alt" label="Descrição da foto" required minLength={3} defaultValue={photo.alt_text} />
        <MediaUploadField
          name="image"
          label="Foto da galeria"
          description="A prévia mostra a imagem que está publicada atualmente."
          defaultUrl={photo.image_url}
          required
        />
        <ValidatedField name="downloadUrl" label="URL de download" optional kind="url" defaultValue={photo.download_url ?? ''} />
        <ValidatedField name="displayOrder" label="Ordem de exibição" kind="number" type="number" min={0} required defaultValue={photo.display_order} />
        <label className={styles.check}>
          <input name="active" type="checkbox" defaultChecked={photo.active} />
          <span><strong>Exibir na galeria</strong><small>A foto ficará disponível na página inicial.</small></span>
        </label>
        <AdminSubmitButton className={styles.submit} pendingLabel="Salvando foto...">
          Salvar alterações
        </AdminSubmitButton>
      </form>
    </AdminModal>
  )
}

export function EditTeamModal({
  team,
  games,
  activeGameIds,
}: {
  team: {
    id: string
    name: string
    city: string
    crest_url: string | null
    initials: string
  }
  games: Array<{
    id: string
    name: string
    short_name: string
  }>
  activeGameIds: string[]
}) {
  return (
    <AdminModal
      title="Editar time"
      description="Atualize a identidade da equipe e as modalidades em que ela atua."
      triggerLabel="Editar"
      triggerIcon="edit"
    >
      <form action={updateTeamAction} className={styles.form}>
        <input type="hidden" name="id" value={team.id} />
        <input type="hidden" name="oldCrestUrl" value={team.crest_url ?? ''} />
        <ValidatedField name="teamName" label="Nome" required minLength={2} defaultValue={team.name} />
        <div className={styles.pair}>
          <ValidatedField name="city" label="Cidade" optional defaultValue={team.city} />
          <ValidatedField name="initials" label="Sigla" required minLength={2} maxLength={4} defaultValue={team.initials} />
        </div>
        <MediaUploadField
          name="crest"
          label="Escudo do time"
          description="Envie PNG, JPG, WebP ou GIF com fundo transparente de preferência."
          defaultUrl={team.crest_url}
        />
        <fieldset className={styles.gameFieldset}>
          <legend>Modalidades do time</legend>
          <p>Selecione pelo menos uma modalidade.</p>
          <div>
            {games.map((game) => (
              <label key={game.id}>
                <input
                  name="gameIds"
                  type="checkbox"
                  value={game.id}
                  defaultChecked={activeGameIds.includes(game.id)}
                />
                <span>{game.name}<small>{game.short_name}</small></span>
              </label>
            ))}
          </div>
        </fieldset>
        <AdminSubmitButton className={styles.submit} pendingLabel="Salvando time...">
          Salvar alterações
        </AdminSubmitButton>
      </form>
    </AdminModal>
  )
}
