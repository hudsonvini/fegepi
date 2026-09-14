'use client'
import { useState } from 'react'
import { Search, UsersRound, Trophy } from 'lucide-react'
import { saveChampionshipAction } from '@/app/admin/championship-actions'
import { placementPoints } from '@/lib/championships'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import type { Championship, RankingEntry } from './types'
import styles from '@/app/admin/page.module.scss'
import editorStyles from './ChampionshipEditor.module.scss'

export default function ChampionshipEditor({ championship, entries }: { championship: Championship; entries: RankingEntry[] }) {
  const [selected, setSelected] = useState(() => new Set(championship.championship_results.map((r) => r.team_id)))
  const [placements, setPlacements] = useState<Record<string, string>>(() => Object.fromEntries(championship.championship_results.map((r) => [r.team_id, String(r.placement ?? '')])))
  const [query, setQuery] = useState('')
  const labels = { draft: 'Rascunho', completed: 'Concluído', cancelled: 'Cancelado' }
  return <section className={`${styles.panel} ${editorStyles.editor}`}>
    <div className={styles.panelHead}><h2>Informações do campeonato</h2><span className={styles.currentBadge}>{labels[championship.status]}</span></div>
    <form action={saveChampionshipAction} className={styles.form}>
      <input type="hidden" name="id" value={championship.id} />
      <input type="hidden" name="seasonId" value={championship.season_id} />
      <input type="hidden" name="version" value={championship.version} />
      <div className={editorStyles.settings}>
      <label>Nome<input name="name" defaultValue={championship.name} required maxLength={120} /></label>
      <label>Data de encerramento<input type="date" name="playedAt" defaultValue={championship.played_at} required /></label>
      <label>Situação<select name="status" defaultValue={championship.status}>
        <option value="draft">Rascunho — sem pontos</option><option value="completed">Concluído — contabilizar pontos</option><option value="cancelled">Cancelado — retirar pontos</option>
      </select></label>
      </div>
      <div className={editorStyles.participantHeader}>
        <div><h3><UsersRound size={20} /> Participantes e resultados</h3><p>{selected.size} times selecionados · {entries.length} disponíveis na temporada</p></div>
        <label className={editorStyles.search}><Search size={16} /><input type="search" aria-label="Pesquisar time" placeholder="Pesquisar time..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      </div>
      <p className={styles.automaticHint}>Marque os participantes e informe as posições finais. Para concluir, todas as colocações devem ser únicas, de 1 até o total de times. O 5º lugar recebe um indicador; do 5º em diante, a pontuação é zero.</p>
      {!entries.length && <p>Inclua os times em Temporadas e tabela antes de cadastrar participantes.</p>}
      <div className={`${styles.tableWrap} ${editorStyles.table}`}><table><thead><tr><th>Participa</th><th>Time</th><th>Colocação</th><th>Pontos</th></tr></thead><tbody>
        {entries.map((entry) => <tr key={entry.id} data-selected={selected.has(entry.team_id)} hidden={!(entry.teams?.name ?? '').toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))}>
          <td><input type="checkbox" name="teamIds" value={entry.team_id} checked={selected.has(entry.team_id)} aria-label={`Incluir ${entry.teams?.name}`} onChange={(event) => setSelected((previous) => { const next = new Set(previous); if (event.target.checked) next.add(entry.team_id); else next.delete(entry.team_id); return next })} /></td>
          <td><div className={editorStyles.team}><span className={editorStyles.crest}>{entry.teams?.crest_url ? <img src={entry.teams.crest_url} alt="" /> : entry.teams?.initials}</span><div><strong>{entry.teams?.name}</strong><small>{entry.teams?.city}</small></div></div></td>
          <td><input type="number" name={`placement_${entry.team_id}`} min={1} max={Math.max(selected.size, 1)} step={1} disabled={!selected.has(entry.team_id)} value={placements[entry.team_id] ?? ''} aria-label={`Colocação de ${entry.teams?.name}`} placeholder="Pendente" onChange={(event) => setPlacements({ ...placements, [entry.team_id]: event.target.value })} /></td>
          <td><span className={editorStyles.points}>{selected.has(entry.team_id) ? placementPoints(Number(placements[entry.team_id])) : 0}<small> pts</small></span></td>
        </tr>)}
      </tbody></table></div>
      <div className={editorStyles.footer}><p><Trophy size={16} /> Resultados concluídos atualizam o ranking automaticamente.</p><AdminSubmitButton className={styles.primaryButton} pendingLabel="Salvando e recalculando...">Salvar alterações</AdminSubmitButton></div>
    </form>
  </section>
}
