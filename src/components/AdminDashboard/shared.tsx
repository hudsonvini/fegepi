import type { ReactNode } from 'react'
import { deleteContentAction } from '@/app/admin/actions'
import styles from '@/app/admin/page.module.scss'
import type { AdminTabId, Season } from './types'

export function gameName(game: Season['games']) {
  return Array.isArray(game) ? game[0]?.name : game?.name
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className={styles.sectionTitle}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}

export function DeleteButton({
  table,
  id,
  tab,
  section,
  gameId,
  label = 'Remover',
}: {
  table: string
  id: string
  tab: AdminTabId
  section?: string
  gameId?: string
  label?: string
}) {
  return (
    <form action={deleteContentAction}>
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="tab" value={tab} />
      {section && <input type="hidden" name="contentSection" value={section} />}
      {gameId && <input type="hidden" name="gameId" value={gameId} />}
      <button className={styles.delete}>{label}</button>
    </form>
  )
}

export const mediaInputProps = {
  type: 'text',
  inputMode: 'url' as const,
  autoCapitalize: 'none',
  autoCorrect: 'off' as const,
  spellCheck: false,
}
