import { CalendarDays } from 'lucide-react'
import { createEventAction } from '@/app/admin/actions'
import styles from '@/app/admin/page.module.scss'
import { EditEventModal } from '@/components/AdminEditForms/AdminEditForms'
import AdminEmptyState from '@/components/AdminEmptyState/AdminEmptyState'
import MediaUploadField from '@/components/AdminFormControls/MediaUploadField'
import ValidatedField from '@/components/AdminFormControls/ValidatedField'
import AdminModal from '@/components/AdminModal/AdminModal'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import { displayMediaUrl } from '@/lib/media-url'
import { DeleteButton, SectionTitle } from '../shared'
import type { Event } from '../types'

function AddEventModal({ triggerLabel = 'Adicionar evento' }: { triggerLabel?: string }) {
  return (
    <AdminModal
      title="Adicionar novo evento"
      description="Crie a publicação que aparecerá no carrossel de eventos da home."
      triggerLabel={triggerLabel}
    >
      <form action={createEventAction} className={styles.form}>
        <input type="hidden" name="contentSection" value="eventos" />
        <ValidatedField name="title" label="Título do evento" required minLength={3} />
        <div className={styles.pair}>
          <ValidatedField name="startsAt" label="Início" kind="date" type="date" required />
          <ValidatedField name="endsAt" label="Fim" optional kind="date" type="date" />
        </div>
        <ValidatedField name="subtitle" label="Subtítulo" optional />
        <div className={styles.pair}>
          <input name="statusLabel" placeholder="Ex.: Inscrições abertas" />
          <select name="statusTone" defaultValue="active">
            <option value="active">Ativo</option>
            <option value="inactive">Em breve</option>
          </select>
        </div>
        <MediaUploadField name="image" label="Imagem principal" description="Arte exibida no card do evento." required />
        <MediaUploadField
          name="featured"
          label="Mídia em destaque"
          description="Imagem, GIF ou vídeo opcional para destacar o evento."
          accept="image/*,.gif,video/mp4"
          allowVideo
        />
        <ValidatedField name="registrationUrl" label="Link de inscrição" optional kind="url" />
        <div className={styles.pair}>
          <ValidatedField name="ctaLabel" label="Texto do botão" optional />
          <ValidatedField name="displayOrder" label="Ordem" kind="number" type="number" min={0} required defaultValue="0" />
        </div>
        <AdminSubmitButton className={styles.primaryButton} pendingLabel="Publicando evento...">
          Publicar evento
        </AdminSubmitButton>
      </form>
    </AdminModal>
  )
}

export default function EventsSection({ events }: { events: Event[] }) {
  return (
    <>
      <SectionTitle
        eyebrow="Conteúdo · Eventos"
        title="Eventos publicados"
        description="Organize a agenda da comunidade e os links de inscrição sem perder espaço na listagem."
        action={<AddEventModal />}
      />

      {events.length ? (
        <div className={styles.contentCards}>
          {events.map((event) => (
            <article key={event.id} className={styles.contentCard}>
              <img src={displayMediaUrl(event.image_url) ?? event.image_url} alt={`Imagem do evento ${event.title}`} />
              <div>
                <span>{event.starts_at} · {event.status_label}</span>
                <h2>{event.title}</h2>
                <p>{event.active ? 'Publicado na home' : 'Rascunho'}</p>
              </div>
              <div className={styles.cardActions}>
                <EditEventModal event={event} />
                <DeleteButton table="events" id={event.id} tab="conteudo" section="eventos" />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          icon={<CalendarDays size={25} />}
          title="Nenhum evento publicado"
          description="Publique o próximo campeonato, encontro ou torneio da FEGEPI."
          action={<AddEventModal triggerLabel="Criar evento" />}
        />
      )}
    </>
  )
}
