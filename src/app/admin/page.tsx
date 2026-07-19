/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BarChart3, CalendarDays, ChevronRight, FileText, Gamepad2, Home, ImagePlus, LayoutDashboard, Plus, ShieldCheck, Trophy, Users, UsersRound } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getProfileAvatar } from '@/lib/profile'
import { createClient } from '@/lib/supabase/server'
import { addTeamToSeasonAction, createEventAction, createGalleryPhotoAction, createGameAction, createSeasonAction, createTeamAction, deleteContentAction, saveGalleryAction, updateRankingEntryAction, updateUserManagementAction } from './actions'
import styles from './page.module.scss'

const tabs = [
  { id: 'visao-geral', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'conteudo', label: 'Gestão de conteúdo', icon: FileText },
  { id: 'times', label: 'Times', icon: UsersRound },
  { id: 'tabela', label: 'Temporadas e tabela', icon: Trophy },
  { id: 'usuarios', label: 'Usuários e permissões', icon: Users },
] as const

type TabId = (typeof tabs)[number]['id']

function hrefFor(tab: TabId, seasonId?: string) {
  const params = new URLSearchParams({ aba: tab })
  if (seasonId) params.set('temporada', seasonId)
  return `/admin?${params}`
}

function gameName(game: { name: string } | { name: string }[] | null | undefined) {
  return Array.isArray(game) ? game[0]?.name : game?.name
}

function DeleteButton({ table, id, tab, label = 'Remover' }: { table: string; id: string; tab: TabId; label?: string }) {
  return <form action={deleteContentAction}><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} /><input type="hidden" name="tab" value={tab} /><button className={styles.delete}>{label}</button></form>
}

function SectionTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className={styles.sectionTitle}><div><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ aba?: string; temporada?: string; erro?: string; mensagem?: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'admin') redirect('/perfil')

  const params = await searchParams
  const activeTab = tabs.some((tab) => tab.id === params.aba) ? params.aba as TabId : 'visao-geral'
  const supabase = await createClient()
  const [{ data: games }, { data: seasons }, { data: teams }, { data: entries }, { data: events }, { data: photos }, { data: profiles }] = await Promise.all([
    supabase.from('games').select('id,name,short_name,theme,image_url,active,display_order').order('display_order'),
    supabase.from('ranking_seasons').select('id,label,is_current,game_id,games(name)').order('created_at', { ascending: false }),
    supabase.from('teams').select('id,name,city,crest_url,initials').order('name'),
    supabase.from('ranking_entries').select('id,season_id,team_id,points,wins,draws,losses,previous_position,teams(id,name,city,crest_url,initials)'),
    supabase.from('events').select('id,title,starts_at,status_label,active').order('display_order'),
    supabase.from('gallery_photos').select('id,alt_text,active').order('display_order'),
    supabase.from('profiles').select('id,full_name,email,avatar_url,team,team_id,role,gender,whatsapp,address,favorite_game,created_at').order('created_at', { ascending: false }),
  ])

  const allGames = games ?? []
  const allSeasons = seasons ?? []
  const allTeams = teams ?? []
  const allEntries = entries ?? []
  const allEvents = events ?? []
  const allPhotos = photos ?? []
  const allProfiles = profiles ?? []
  const selectedSeason = allSeasons.find((season: any) => season.id === params.temporada) ?? allSeasons.find((season: any) => season.is_current) ?? allSeasons[0]
  const seasonEntries = selectedSeason
    ? allEntries.filter((entry: any) => entry.season_id === selectedSeason.id).sort((a: any, b: any) => b.points - a.points || b.wins - a.wins || a.teams?.name.localeCompare(b.teams?.name))
    : []
  const userTeamCount = (teamId: string) => allProfiles.filter((profile: any) => profile.team_id === teamId).length
  const teamSeasonCount = (teamId: string) => allEntries.filter((entry: any) => entry.team_id === teamId).length
  const adminCount = allProfiles.filter((profile: any) => profile.role === 'admin').length
  const avatar = getProfileAvatar(user.avatarUrl, user.gender)

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/"><img src="/images/logoWhite.png" alt="FEGEPI" /></Link>
        <div className={styles.sidebarLabel}>Administração</div>
        <nav className={styles.sideNav} aria-label="Seções administrativas">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return <Link key={tab.id} className={activeTab === tab.id ? styles.activeNav : ''} href={hrefFor(tab.id)}><Icon size={18} /> <span>{tab.label}</span></Link>
          })}
        </nav>
        <div className={styles.sideDivider} />
        <div className={styles.sidebarLabel}>Acesso rápido</div>
        <nav className={styles.sideNav}>
          <Link href="/"><Home size={18} /> <span>Ver site</span></Link>
          <Link href="/perfil"><ShieldCheck size={18} /> <span>Meu perfil</span></Link>
        </nav>
        <div className={styles.accountPreview}>
          <img src={avatar} alt="" />
          <div><strong>{user.fullName}</strong><span>Administrador</span></div>
          <Link href="/perfil" aria-label="Abrir meu perfil"><ChevronRight size={18} /></Link>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}><BarChart3 size={18} /><span>Dashboard</span><ChevronRight size={15} /><strong>{tabs.find((tab) => tab.id === activeTab)?.label}</strong></div>
          <div className={styles.topActions}><Link href="/" className={styles.topLink}><Home size={16} /> Home</Link><Link href="/perfil" className={styles.profileLink}><img src={avatar} alt="" /> <span>Minha conta</span></Link></div>
        </header>

        <div className={styles.mainContent}>
          {params.erro && <p className={`${styles.notice} ${styles.error}`} role="alert">{params.erro}</p>}
          {params.mensagem && <p className={`${styles.notice} ${styles.success}`} role="status">{params.mensagem}</p>}

          {activeTab === 'visao-geral' && <>
            <SectionTitle eyebrow="Central de comando" title="Bem-vindo ao painel FEGEPI" description="Acompanhe a comunidade, os campeonatos e as publicações em um só lugar." action={<span className={styles.updated}>Atualizado agora</span>} />
            <div className={styles.statsGrid}>
              <article><span className={styles.statIcon}><Users size={20} /></span><p>Membros cadastrados</p><strong>{allProfiles.length}</strong><small>{adminCount} com acesso administrativo</small></article>
              <article><span className={`${styles.statIcon} ${styles.purple}`}><UsersRound size={20} /></span><p>Times da comunidade</p><strong>{allTeams.length}</strong><small>{allEntries.length} participações em temporadas</small></article>
              <article><span className={`${styles.statIcon} ${styles.gold}`}><Trophy size={20} /></span><p>Temporadas ativas</p><strong>{allSeasons.filter((season: any) => season.is_current).length}</strong><small>{allSeasons.length} temporadas cadastradas</small></article>
              <article><span className={`${styles.statIcon} ${styles.orange}`}><CalendarDays size={20} /></span><p>Eventos publicados</p><strong>{allEvents.filter((event: any) => event.active).length}</strong><small>{allEvents.length} eventos no histórico</small></article>
            </div>
            <div className={styles.overviewGrid}>
              <section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>Atalhos</p><h2>O que deseja gerenciar?</h2></div></div><div className={styles.quickLinks}><Link href={hrefFor('conteudo')}><ImagePlus size={20} /><span><strong>Conteúdo do site</strong><small>Eventos, jogos e galeria</small></span><ChevronRight size={17} /></Link><Link href={hrefFor('tabela')}><Trophy size={20} /><span><strong>Campeonatos</strong><small>Temporadas e classificação</small></span><ChevronRight size={17} /></Link><Link href={hrefFor('usuarios')}><Users size={20} /><span><strong>Comunidade</strong><small>Times e permissões</small></span><ChevronRight size={17} /></Link></div></section>
              <section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>Próxima referência</p><h2>Temporada em destaque</h2></div><Trophy size={21} /></div>{selectedSeason ? <div className={styles.featuredSeason}><span>{gameName(selectedSeason.games)}</span><strong>{selectedSeason.label}</strong><p>{seasonEntries.length} times na tabela</p><Link href={hrefFor('tabela', selectedSeason.id)}>Abrir classificação <ChevronRight size={15} /></Link></div> : <div className={styles.empty}><p>Crie a primeira temporada para começar a classificação.</p><Link href={hrefFor('tabela')}>Criar temporada</Link></div>}</section>
            </div>
          </>}

          {activeTab === 'conteudo' && <>
            <SectionTitle eyebrow="Publicação" title="Gestão de conteúdo" description="Controle o que aparece na home: jogos do ranking, eventos e fotos da comunidade." />
            <div className={styles.contentGrid}>
              <section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>Ranking</p><h2>Jogos do site</h2></div><Gamepad2 size={21} /></div><form action={createGameAction} className={styles.form} encType="multipart/form-data"><input name="name" required placeholder="Nome do jogo"/><div className={styles.pair}><input name="shortName" placeholder="Sigla (ex.: CS2)"/><select name="theme" defaultValue="cs2"><option value="cs2">CS2</option><option value="valorant">Valorant</option><option value="lol">League of Legends</option><option value="freefire">Free Fire</option><option value="fc26">FC 26</option></select></div><input name="imageUrl" type="url" placeholder="URL da imagem"/><input name="image" type="file" accept="image/*"/><input name="displayOrder" type="number" defaultValue="0" placeholder="Ordem de exibição"/><button className={styles.primaryButton}><Plus size={16} /> Cadastrar jogo</button></form><div className={styles.compactList}>{allGames.map((game: any) => <div key={game.id}><span><Gamepad2 size={16} /> {game.name}</span><DeleteButton table="games" id={game.id} tab="conteudo" /></div>)}</div></section>
              <section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>Agenda</p><h2>Novo evento</h2></div><CalendarDays size={21} /></div><form action={createEventAction} className={styles.form} encType="multipart/form-data"><input name="title" required placeholder="Título do evento"/><div className={styles.pair}><input name="startsAt" type="date" required/><input name="endsAt" type="date"/></div><input name="subtitle" placeholder="Subtítulo"/><div className={styles.pair}><input name="statusLabel" placeholder="Ex.: Inscrições abertas"/><select name="statusTone" defaultValue="active"><option value="active">Ativo</option><option value="inactive">Em breve</option></select></div><input name="imageUrl" type="url" placeholder="URL da imagem"/><input name="image" type="file" accept="image/*"/><input name="featuredUrl" type="url" placeholder="URL de mídia em destaque"/><input name="featured" type="file" accept="image/*,video/mp4"/><input name="registrationUrl" type="url" placeholder="Link de inscrição"/><div className={styles.pair}><input name="ctaLabel" placeholder="Texto do botão"/><input name="displayOrder" type="number" defaultValue="0" placeholder="Ordem"/></div><button className={styles.primaryButton}><Plus size={16} /> Publicar evento</button></form><div className={styles.compactList}>{allEvents.map((event: any) => <div key={event.id}><span><CalendarDays size={16} /> {event.title}</span><DeleteButton table="events" id={event.id} tab="conteudo" /></div>)}</div></section>
              <section className={`${styles.panel} ${styles.widePanel}`}><div className={styles.panelHead}><div><p className={styles.eyebrow}>Memória</p><h2>Galeria do último evento</h2></div><ImagePlus size={21} /></div><div className={styles.galleryForms}><form action={saveGalleryAction} className={styles.form} encType="multipart/form-data"><div className={styles.pair}><input name="eyebrow" placeholder="Texto menor" defaultValue="Quem nos apoia"/><input name="title" placeholder="Título da seção" defaultValue="Fotos do último evento"/></div><input name="bannerTitle" placeholder="Título da capa"/><textarea name="bannerDescription" placeholder="Descrição da capa"/><input name="bannerAlt" placeholder="Descrição acessível da imagem"/><input name="bannerUrl" type="url" placeholder="URL da imagem de capa"/><input name="banner" type="file" accept="image/*"/><button className={styles.secondaryButton}>Salvar capa da galeria</button></form><form action={createGalleryPhotoAction} className={styles.form} encType="multipart/form-data"><input name="alt" placeholder="Descrição da foto"/><input name="downloadUrl" type="url" placeholder="URL de download (opcional)"/><input name="imageUrl" type="url" placeholder="URL da foto"/><input name="image" type="file" accept="image/*"/><input name="displayOrder" type="number" defaultValue="0" placeholder="Ordem"/><button className={styles.primaryButton}><Plus size={16} /> Adicionar foto</button></form></div><div className={styles.compactList}>{allPhotos.map((photo: any) => <div key={photo.id}><span><ImagePlus size={16} /> {photo.alt_text}</span><DeleteButton table="gallery_photos" id={photo.id} tab="conteudo" /></div>)}</div></section>
            </div>
          </>}

          {activeTab === 'times' && <>
            <SectionTitle eyebrow="Comunidade competitiva" title="Times e organizações" description="Mantenha a base de times atualizada antes de incluí-los em uma temporada ou atribuí-los a membros." />
            <div className={styles.teamIntro}><section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>Novo cadastro</p><h2>Criar time</h2></div><UsersRound size={21} /></div><form action={createTeamAction} className={styles.form} encType="multipart/form-data"><input name="teamName" required placeholder="Nome do time"/><div className={styles.pair}><input name="city" placeholder="Cidade"/><input name="initials" maxLength={4} placeholder="Sigla"/></div><input name="crestUrl" type="url" placeholder="URL do escudo"/><input name="crest" type="file" accept="image/*"/><button className={styles.primaryButton}><Plus size={16} /> Cadastrar time</button></form></section><section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>Fluxo recomendado</p><h2>Organize o campeonato</h2></div><Trophy size={21} /></div><ol className={styles.steps}><li><span>1</span> Cadastre o time e o escudo.</li><li><span>2</span> Atribua membros ao time na aba de usuários.</li><li><span>3</span> Inclua o time na temporada para lançar resultados.</li></ol><Link className={styles.secondaryButton} href={hrefFor('tabela')}>Ir para temporadas e tabela <ChevronRight size={16} /></Link></section></div>
            <div className={styles.teamCards}>{allTeams.map((team: any) => <article className={styles.teamCard} key={team.id}><div className={styles.teamCrest}>{team.crest_url ? <img src={team.crest_url} alt={`Escudo do ${team.name}`} /> : <span>{team.initials}</span>}</div><div className={styles.teamInfo}><h2>{team.name}</h2><p>{team.city}</p></div><div className={styles.teamStats}><span><strong>{userTeamCount(team.id)}</strong> membros</span><span><strong>{teamSeasonCount(team.id)}</strong> temporadas</span></div><DeleteButton table="teams" id={team.id} tab="times" label="Excluir time" /></article>)}</div>
          </>}

          {activeTab === 'tabela' && <>
            <SectionTitle eyebrow="Campeonatos" title="Temporadas e tabela" description="Crie a temporada, adicione os times e registre os números de cada rodada." />
            <div className={styles.seasonLayout}><section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>Nova temporada</p><h2>Preparar campeonato</h2></div><CalendarDays size={21} /></div><form action={createSeasonAction} className={styles.form}><select name="gameId" required defaultValue=""><option value="" disabled>Selecione o jogo</option>{allGames.map((game: any) => <option key={game.id} value={game.id}>{game.name}</option>)}</select><input name="label" required placeholder="Ex.: Temporada 2026"/><label className={styles.check}><input name="isCurrent" type="checkbox"/> Definir como temporada atual</label><button className={styles.primaryButton}><Plus size={16} /> Criar temporada</button></form></section><section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>Participantes</p><h2>Adicionar time à tabela</h2></div><UsersRound size={21} /></div><form action={addTeamToSeasonAction} className={styles.form}><select name="seasonId" required defaultValue={selectedSeason?.id ?? ''}><option value="" disabled>Selecione a temporada</option>{allSeasons.map((season: any) => <option key={season.id} value={season.id}>{gameName(season.games)} — {season.label}</option>)}</select><select name="teamId" required defaultValue=""><option value="" disabled>Selecione o time</option>{allTeams.map((team: any) => <option key={team.id} value={team.id}>{team.name}</option>)}</select><div className={styles.statsInputs}><label>Vitórias<input name="wins" type="number" min="0" defaultValue="0"/></label><label>Empates<input name="draws" type="number" min="0" defaultValue="0"/></label><label>Derrotas<input name="losses" type="number" min="0" defaultValue="0"/></label><label>Pontos<input name="points" type="number" min="0" defaultValue="0"/></label></div><input name="previousPosition" type="number" min="0" defaultValue="0" placeholder="Posição anterior"/><button className={styles.primaryButton}><Plus size={16} /> Incluir na tabela</button></form></section></div>
            <section className={`${styles.panel} ${styles.standingsPanel}`}><div className={styles.panelHead}><div><p className={styles.eyebrow}>Classificação</p><h2>{selectedSeason ? `${gameName(selectedSeason.games)} — ${selectedSeason.label}` : 'Escolha ou crie uma temporada'}</h2></div>{selectedSeason?.is_current && <span className={styles.currentBadge}>Temporada atual</span>}</div><div className={styles.seasonTabs}>{allSeasons.map((season: any) => <Link key={season.id} href={hrefFor('tabela', season.id)} className={season.id === selectedSeason?.id ? styles.activeSeason : ''}>{gameName(season.games)}<strong>{season.label}</strong></Link>)}</div>{selectedSeason ? seasonEntries.length ? <div className={styles.tableWrap}><table><thead><tr><th>#</th><th>Time</th><th>V</th><th>E</th><th>D</th><th>Pts</th><th>Anterior</th><th></th></tr></thead><tbody>{seasonEntries.map((entry: any, index: number) => <tr key={entry.id}><td><span className={styles.position}>{index + 1}</span></td><td><div className={styles.tableTeam}>{entry.teams?.crest_url ? <img src={entry.teams.crest_url} alt="" /> : <span>{entry.teams?.initials}</span>}<strong>{entry.teams?.name}</strong></div></td><td><input form={`entry-${entry.id}`} name="wins" type="number" min="0" defaultValue={entry.wins} aria-label={`Vitórias de ${entry.teams?.name}`} /></td><td><input form={`entry-${entry.id}`} name="draws" type="number" min="0" defaultValue={entry.draws} aria-label={`Empates de ${entry.teams?.name}`} /></td><td><input form={`entry-${entry.id}`} name="losses" type="number" min="0" defaultValue={entry.losses} aria-label={`Derrotas de ${entry.teams?.name}`} /></td><td><input form={`entry-${entry.id}`} name="points" type="number" min="0" defaultValue={entry.points} aria-label={`Pontos de ${entry.teams?.name}`} /></td><td><input form={`entry-${entry.id}`} name="previousPosition" type="number" min="0" defaultValue={entry.previous_position} aria-label={`Posição anterior de ${entry.teams?.name}`} /></td><td><form id={`entry-${entry.id}`} action={updateRankingEntryAction}><input type="hidden" name="entryId" value={entry.id}/><input type="hidden" name="seasonId" value={selectedSeason.id}/><button className={styles.saveRow}>Salvar</button></form><DeleteButton table="ranking_entries" id={entry.id} tab="tabela" label="Remover" /></td></tr>)}</tbody></table></div> : <div className={styles.empty}><p>Nenhum time participa desta temporada ainda.</p></div> : <div className={styles.empty}><p>Crie a primeira temporada para montar a tabela.</p></div>}</section>
          </>}

          {activeTab === 'usuarios' && <>
            <SectionTitle eyebrow="Acesso e comunidade" title="Usuários e permissões" description="Atribua cada membro a um time e defina quem pode administrar o conteúdo da FEGEPI." />
            <div className={styles.userStats}><span><Users size={18} /><strong>{allProfiles.length}</strong> membros</span><span><ShieldCheck size={18} /><strong>{adminCount}</strong> administradores</span><span><UsersRound size={18} /><strong>{allProfiles.filter((profile: any) => profile.team_id).length}</strong> vinculados a times</span></div>
            <div className={styles.userCards}>{allProfiles.map((profile: any) => { const profileAvatar = getProfileAvatar(profile.avatar_url, profile.gender); return <article className={styles.userCard} key={profile.id}><div className={styles.userIdentity}><img src={profileAvatar} alt=""/><div><h2>{profile.full_name || 'Membro sem nome'}</h2><p>{profile.email || 'E-mail disponível após a migração'}</p><span>{profile.favorite_game || 'Jogador FEGEPI'}</span></div></div><form action={updateUserManagementAction} className={styles.userForm}><input type="hidden" name="userId" value={profile.id}/><label>Time<select name="teamId" defaultValue={profile.team_id ?? ''}><option value="">Sem time</option>{allTeams.map((team: any) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label><label>Nível de permissão<select name="role" defaultValue={profile.role}><option value="member">Membro</option><option value="admin">Administrador</option></select></label><button className={styles.primaryButton}>Salvar acesso</button></form></article> })}</div>
          </>}
        </div>
      </section>
    </main>
  )
}
