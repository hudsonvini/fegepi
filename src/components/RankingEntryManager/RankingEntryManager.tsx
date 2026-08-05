'use client'

import { useActionState, useEffect } from 'react'
import { CircleCheck, CircleMinus, CircleX, LoaderCircle, RotateCcw } from 'lucide-react'
import {
  recordRankingResultAction,
  undoLastRankingResultAction,
  type RankingActionState,
} from '@/app/admin/actions'
import ConfirmDeleteButton from '@/components/ConfirmDeleteButton/ConfirmDeleteButton'
import { notify } from '@/components/ToastNotifications/ToastNotifications'
import type { RankingEntry } from '@/components/AdminDashboard/types'
import styles from './RankingEntryManager.module.scss'

const initialState: RankingActionState = { status: 'idle', message: '', nonce: 0 }
const resultLabels = { W: 'Vitória', D: 'Empate', L: 'Derrota' } as const

export default function RankingEntryManager({
  entry,
  position,
  gameId,
}: {
  entry: RankingEntry
  position: number
  gameId?: string
}) {
  const [resultState, resultAction, resultPending] = useActionState(recordRankingResultAction, initialState)
  const [undoState, undoAction, undoPending] = useActionState(undoLastRankingResultAction, initialState)

  useEffect(() => {
    if (resultState.status !== 'idle') {
      notify({ type: resultState.status, message: resultState.message })
    }
  }, [resultState])

  useEffect(() => {
    if (undoState.status !== 'idle') {
      notify({ type: undoState.status, message: undoState.message })
    }
  }, [undoState])

  return (
    <tr className={styles.row}>
      <td><span className={styles.position}>{position}</span></td>
      <td>
        <div className={styles.team}>
          <div className={styles.crest}>
            {entry.teams?.crest_url
              ? <img src={entry.teams.crest_url} alt="" />
              : <span>{entry.teams?.initials}</span>}
          </div>
          <div className={styles.identity}>
            <h3>{entry.teams?.name}</h3>
            <p>{entry.teams?.city || 'Piauí'}</p>
          </div>
        </div>
      </td>
      <td><strong className={`${styles.stat} ${styles.win}`}>{entry.wins}</strong></td>
      <td><strong className={`${styles.stat} ${styles.draw}`}>{entry.draws}</strong></td>
      <td><strong className={`${styles.stat} ${styles.loss}`}>{entry.losses}</strong></td>
      <td><strong className={styles.points}>{entry.points}</strong></td>
      <td>
        <div className={styles.formGuide} aria-label="Forma recente">
          {Array.from({ length: 5 }, (_, index) => {
            const result = entry.recent_form?.[index]
            return (
              <i key={index} className={result ? styles[`result${result}`] : styles.resultEmpty}>
                {result ? resultLabels[result].charAt(0) : '—'}
              </i>
            )
          })}
        </div>
      </td>
      <td>
        <form action={resultAction} className={styles.resultActions}>
          <input type="hidden" name="entryId" value={entry.id} />
          <button name="result" value="W" disabled={resultPending} title="Registrar vitória" aria-label={`Registrar vitória para ${entry.teams?.name}`}>
            {resultPending ? <LoaderCircle className={styles.spinner} size={15} /> : <CircleCheck size={16} />}
            <span>Vitória</span>
          </button>
          <button name="result" value="D" disabled={resultPending} title="Registrar empate" aria-label={`Registrar empate para ${entry.teams?.name}`}>
            <CircleMinus size={16} /><span>Empate</span>
          </button>
          <button name="result" value="L" disabled={resultPending} title="Registrar derrota" aria-label={`Registrar derrota para ${entry.teams?.name}`}>
            <CircleX size={16} /><span>Derrota</span>
          </button>
        </form>
      </td>
      <td>
        <div className={styles.moreActions}>
          <form action={undoAction}>
            <input type="hidden" name="entryId" value={entry.id} />
            <button className={styles.undo} disabled={undoPending} title="Desfazer último resultado">
              {undoPending ? <LoaderCircle className={styles.spinner} size={14} /> : <RotateCcw size={14} />}
              <span>Desfazer</span>
            </button>
          </form>
          <ConfirmDeleteButton
            table="ranking_entries"
            id={entry.id}
            tab="tabela"
            label="Remover"
            gameId={gameId}
          />
        </div>
      </td>
    </tr>
  )
}
