import Link from 'next/link'
import { CalendarDays, ChevronRight, ImagePlus, Trophy, Users, UsersRound } from 'lucide-react'
import styles from '@/app/admin/page.module.scss'
import { adminHref } from '../navigation'
import { gameName, SectionTitle } from '../shared'
import type { AdminData } from '../types'

export default function OverviewTab({ data }: { data: AdminData }) {
  const adminCount = data.profiles.filter((profile) => profile.role === 'admin').length

  return (
    <>
      <SectionTitle
        eyebrow="Central de comando"
        title="Bem-vindo ao painel FEGEPI"
        description="Acompanhe a comunidade, os campeonatos e as publicações em um só lugar."
        action={<span className={styles.updated}>Atualizado agora</span>}
      />

      <div className={styles.statsGrid}>
        <article>
          <span className={styles.statIcon}><Users size={20} /></span>
          <p>Membros cadastrados</p>
          <strong>{data.profiles.length}</strong>
          <small>{adminCount} com acesso administrativo</small>
        </article>
        <article>
          <span className={`${styles.statIcon} ${styles.purple}`}><UsersRound size={20} /></span>
          <p>Times da comunidade</p>
          <strong>{data.teams.length}</strong>
          <small>{data.entries.length} participações em temporadas</small>
        </article>
        <article>
          <span className={`${styles.statIcon} ${styles.gold}`}><Trophy size={20} /></span>
          <p>Temporadas ativas</p>
          <strong>{data.seasons.filter((season) => season.is_current).length}</strong>
          <small>{data.seasons.length} temporadas cadastradas</small>
        </article>
        <article>
          <span className={`${styles.statIcon} ${styles.orange}`}><CalendarDays size={20} /></span>
          <p>Eventos publicados</p>
          <strong>{data.events.filter((event) => event.active).length}</strong>
          <small>{data.events.length} eventos no histórico</small>
        </article>
      </div>

      <div className={styles.overviewGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div><p className={styles.eyebrow}>Atalhos</p><h2>O que deseja gerenciar?</h2></div>
          </div>
          <div className={styles.quickLinks}>
            <Link href={adminHref('conteudo')}>
              <ImagePlus size={20} />
              <span><strong>Conteúdo do site</strong><small>Eventos, jogos e galeria</small></span>
              <ChevronRight size={17} />
            </Link>
            <Link href={adminHref('tabela')}>
              <Trophy size={20} />
              <span><strong>Campeonatos</strong><small>Temporadas e classificação</small></span>
              <ChevronRight size={17} />
            </Link>
            <Link href={adminHref('usuarios')}>
              <Users size={20} />
              <span><strong>Comunidade</strong><small>Times e permissões</small></span>
              <ChevronRight size={17} />
            </Link>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div><p className={styles.eyebrow}>Próxima referência</p><h2>Temporada em destaque</h2></div>
            <Trophy size={21} />
          </div>
          {data.selectedSeason ? (
            <div className={styles.featuredSeason}>
              <span>{gameName(data.selectedSeason.games)}</span>
              <strong>{data.selectedSeason.label}</strong>
              <p>{data.seasonEntries.length} times na tabela</p>
              <Link href={adminHref('tabela', data.selectedSeason.id)}>
                Abrir classificação <ChevronRight size={15} />
              </Link>
            </div>
          ) : (
            <div className={styles.empty}>
              <p>Crie a primeira temporada para começar a classificação.</p>
              <Link href={adminHref('tabela')}>Criar temporada</Link>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
