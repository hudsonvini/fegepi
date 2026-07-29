import { Gamepad2 } from 'lucide-react'
import { createGameAction } from '@/app/admin/actions'
import styles from '@/app/admin/page.module.scss'
import { EditGameModal } from '@/components/AdminEditForms/AdminEditForms'
import AdminEmptyState from '@/components/AdminEmptyState/AdminEmptyState'
import MediaUploadField from '@/components/AdminFormControls/MediaUploadField'
import ValidatedField from '@/components/AdminFormControls/ValidatedField'
import AdminModal from '@/components/AdminModal/AdminModal'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import { displayMediaUrl } from '@/lib/media-url'
import { DeleteButton, SectionTitle } from '../shared'
import type { Game } from '../types'

function AddGameModal({ triggerLabel = 'Adicionar jogo' }: { triggerLabel?: string }) {
  return (
    <AdminModal
      title="Adicionar novo jogo"
      description="Informe os dados visuais e de ordenação para publicar o jogo."
      triggerLabel={triggerLabel}
    >
      <form action={createGameAction} className={styles.form}>
        <input type="hidden" name="contentSection" value="jogos" />
        <ValidatedField name="name" label="Nome do jogo" required minLength={2} placeholder="Ex.: Counter-Strike 2" />
        <div className={styles.pair}>
          <ValidatedField name="shortName" label="Sigla" required maxLength={12} placeholder="Ex.: CS2" />
          <select name="theme" defaultValue="cs2">
            <option value="cs2">CS2</option>
            <option value="valorant">Valorant</option>
            <option value="lol">League of Legends</option>
            <option value="freefire">Free Fire</option>
            <option value="fc26">FC 26</option>
          </select>
        </div>
        <MediaUploadField
          name="image"
          label="Imagem do jogo"
          description="Esta arte será exibida no seletor de rankings."
          required
        />
        <ValidatedField name="displayOrder" label="Ordem de exibição" kind="number" type="number" min={0} required defaultValue="0" />
        <AdminSubmitButton className={styles.primaryButton} pendingLabel="Cadastrando jogo...">
          Cadastrar jogo
        </AdminSubmitButton>
      </form>
    </AdminModal>
  )
}

export default function GamesSection({ games }: { games: Game[] }) {
  return (
    <>
      <SectionTitle
        eyebrow="Conteúdo · Jogos"
        title="Jogos do ranking"
        description="Cadastre os jogos que terão temporadas e classificação na página inicial."
        action={<AddGameModal />}
      />

      {games.length ? (
        <div className={styles.contentCards}>
          {games.map((game) => (
            <article key={game.id} className={styles.contentCard}>
              <img src={displayMediaUrl(game.image_url) ?? game.image_url} alt={`Imagem do jogo ${game.name}`} />
              <div>
                <span>Ranking · {game.short_name}</span>
                <h2>{game.name}</h2>
                <p>{game.active ? 'Visível na home' : 'Oculto da home'}</p>
              </div>
              <div className={styles.cardActions}>
                <EditGameModal game={game} />
                <DeleteButton table="games" id={game.id} tab="conteudo" section="jogos" />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          icon={<Gamepad2 size={25} />}
          title="Nenhum jogo cadastrado"
          description="Comece cadastrando o primeiro jogo para organizar temporadas e classificação."
          action={<AddGameModal triggerLabel="Cadastrar jogo" />}
        />
      )}
    </>
  )
}
