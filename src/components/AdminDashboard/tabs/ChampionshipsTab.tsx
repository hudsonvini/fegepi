import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, CalendarDays, Trophy, UsersRound } from 'lucide-react'
import styles from '@/app/admin/page.module.scss'
import ui from './ChampionshipsTab.module.scss'
import { saveChampionshipAction } from '@/app/admin/championship-actions'
import AdminModal from '@/components/AdminModal/AdminModal'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import ChampionshipEditor from '../ChampionshipEditor'
import AdminGameSeasonSelector from '../AdminGameSeasonSelector'
import { adminHref } from '../navigation'
import { SectionTitle } from '../shared'
import type { AdminData } from '../types'

const statusLabels = { draft: 'Rascunho', completed: 'Concluído', cancelled: 'Cancelado' }

export default function ChampionshipsTab({ data, championshipId }: { data: AdminData; championshipId?: string }) {
  const championships = data.championships.filter((item) => item.season_id === data.selectedSeason?.id)
  if (championshipId) {
    const championship = data.championships.find((item) => item.id === championshipId)
    if (!championship) return <div className={ui.empty}><Trophy /><h2>Campeonato não encontrado</h2><Link href={adminHref('campeonatos')}>Voltar aos campeonatos</Link></div>
    const season = data.seasons.find((item) => item.id === championship.season_id)
    const entries = data.entries.filter((entry) => entry.season_id === championship.season_id)
    return <>
      <Link className={ui.back} href={adminHref('campeonatos', season?.id, season?.game_id)}><ArrowLeft size={16} /> Todos os campeonatos</Link>
      <SectionTitle eyebrow={season?.label ?? 'Campeonato'} title={championship.name} description="Gerencie os participantes, registre as colocações e publique o resultado na temporada." />
      <ChampionshipEditor key={`${championship.id}-${championship.version}`} championship={championship} entries={entries} />
    </>
  }
  return <>
    <SectionTitle eyebrow="Circuito competitivo" title="Campeonatos" description="Todas as etapas da temporada em um só lugar. Abra um campeonato para gerenciar equipes e resultados." />
    <AdminGameSeasonSelector tab="campeonatos" games={data.games} seasons={data.seasons} gameId={data.selectedGame?.id} seasonId={data.selectedSeason?.id} />
    <div className={ui.toolbar}>
      <div><h2>{data.selectedSeason?.label ?? 'Seus campeonatos'}</h2><p>{championships.length} campeonatos · {championships.filter((item) => item.status === 'completed').length} concluídos</p></div>
      <AdminModal title="Cadastrar campeonato" triggerLabel="Novo campeonato" description="Comece com o nome e a data. Na próxima tela, você seleciona os times e registra os resultados.">
        <form action={saveChampionshipAction} className={styles.form}>
          <input type="hidden" name="seasonId" value={data.selectedSeason?.id ?? ''} />
          <input type="hidden" name="status" value="draft" />
          <p className={styles.contextInfo}>{data.selectedGame?.name} · {data.selectedSeason?.label ?? 'Crie uma temporada antes de continuar.'}</p>
          <label>Nome do campeonato<input name="name" required maxLength={120} placeholder="Ex.: Copa Piauí — Etapa 1" /></label>
          <label>Data de encerramento<input type="date" name="playedAt" required /></label>
          <p className={styles.automaticHint}>O campeonato começa em rascunho. A pontuação entra no ranking quando você concluir os resultados.</p>
          <AdminSubmitButton className={styles.primaryButton} pendingLabel="Cadastrando..." disabled={!data.championshipsAvailable || !data.selectedSeason}>Cadastrar e selecionar times</AdminSubmitButton>
        </form>
      </AdminModal>
    </div>
    {!data.championshipsAvailable && <p role="alert">Não foi possível carregar os campeonatos. Verifique a conexão com o banco.</p>}
    <div className={ui.cards}>
      {championships.map((championship) => <Link key={championship.id} className={ui.card} href={`${adminHref('campeonatos', championship.season_id, data.selectedGame?.id)}&campeonato=${championship.id}`}>
        <div className={ui.cardTop}><span className={ui.icon}><Trophy size={24} /></span><span className={`${ui.status} ${ui[championship.status]}`}>{statusLabels[championship.status]}</span></div>
        <div><small>{data.selectedGame?.name}</small><h2>{championship.name}</h2></div>
        <div className={ui.meta}><span><CalendarDays size={15} />{new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${championship.played_at}T12:00:00Z`))}</span><span><UsersRound size={15} />{championship.championship_results.length} times</span></div>
        <div className={ui.cardFoot}><span>Gerenciar campeonato</span><ArrowUpRight size={18} /></div>
      </Link>)}
    </div>
    {data.championshipsAvailable && !championships.length && <div className={ui.empty}><Trophy size={32} /><h2>A próxima disputa começa aqui</h2><p>Use “Novo campeonato” para cadastrar a primeira etapa desta temporada.</p></div>}
  </>
}
