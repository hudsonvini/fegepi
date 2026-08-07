'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { deleteR2MediaByUrl, uploadR2Media } from '@/lib/r2'
import { createClient } from '@/lib/supabase/server'

function text(formData: FormData, name: string) { return String(formData.get(name) ?? '').trim() }
function number(formData: FormData, name: string) { return Math.max(0, Number(formData.get(name) ?? 0) || 0) }
function checked(formData: FormData, name: string) { return formData.get(name) === 'on' }
function adminPath(tab = 'visao-geral', seasonId?: string, section?: string, gameId?: string) {
  const params = new URLSearchParams({ aba: tab })
  if (seasonId) params.set('temporada', seasonId)
  if (section) params.set('secao', section)
  if (gameId) params.set('jogo', gameId)
  return `/admin?${params}`
}
function done(message: string, tab?: string, seasonId?: string, section?: string, gameId?: string) {
  revalidatePath('/', 'layout')
  revalidatePath('/admin')
  revalidatePath('/perfil')
  revalidatePath('/jogadores')
  revalidatePath('/jogadores/[id]', 'page')
  redirect(`${adminPath(tab, seasonId, section, gameId)}&mensagem=${encodeURIComponent(message)}`)
}
function fail(message: string, tab?: string, seasonId?: string, section?: string, gameId?: string): never {
  redirect(`${adminPath(tab, seasonId, section, gameId)}&erro=${encodeURIComponent(message)}`)
}
function contentSection(formData: FormData) { return text(formData, 'contentSection') || 'jogos' }

export type RankingActionState = {
  status: 'idle' | 'success' | 'error'
  message: string
  nonce: number
}

function rankingState(status: RankingActionState['status'], message: string): RankingActionState {
  return { status, message, nonce: Date.now() }
}

function revalidateRanking() {
  revalidatePath('/', 'layout')
  revalidatePath('/admin')
}

const mediaColumnsByTable: Record<string, string[]> = {
  hero_slides: ['image_url'],
  games: ['image_url'],
  events: ['image_url', 'featured_media_url'],
  gallery_photos: ['image_url', 'download_url'],
  teams: ['crest_url'],
}

async function isMediaStillReferenced(supabase: SupabaseClient, mediaUrl: string) {
  const references = [
    ['hero_slides', 'image_url'],
    ['games', 'image_url'],
    ['events', 'image_url'],
    ['events', 'featured_media_url'],
    ['gallery_photos', 'image_url'],
    ['gallery_photos', 'download_url'],
    ['gallery_settings', 'banner_image_url'],
    ['teams', 'crest_url'],
  ] as const

  const results = await Promise.all(references.map(([table, column]) =>
    supabase.from(table).select('id', { count: 'exact', head: true }).eq(column, mediaUrl),
  ))

  return results.some(({ count }: { count: number | null }) => (count ?? 0) > 0)
}

async function mediaUrl(formData: FormData, field = 'image', currentUrl?: string | null) {
  const directUrl = text(formData, `${field}Url`)
  const file = formData.get(field)
  if (!(file instanceof File) || file.size === 0) return directUrl || currentUrl || null
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')
  const isImage = file.type.startsWith('image/') || isGif
  const isVideo = file.type.startsWith('video/')
  if (file.size > 20 * 1024 * 1024) throw new Error('A mídia deve ter até 20 MB.')
  if (!isImage && !isVideo) throw new Error('Envie uma imagem (incluindo GIF) ou vídeo válido.')
  return uploadR2Media(file, field)
}

async function mediaUrlOrFail(
  formData: FormData,
  field: string,
  tab: string,
  section?: string,
  currentUrl?: string | null,
) {
  try {
    return await mediaUrl(formData, field, currentUrl)
  } catch (error) {
    fail(error instanceof Error ? error.message : 'Não foi possível enviar a mídia.', tab, undefined, section)
  }
}

async function cleanupReplacedMedia(supabase: SupabaseClient, replacements: Array<[string | null, string | null]>) {
  const oldUrls = [...new Set(replacements
    .filter(([oldUrl, newUrl]) => oldUrl && oldUrl !== newUrl)
    .map(([oldUrl]) => oldUrl as string))]

  const results = []
  for (const oldUrl of oldUrls) {
    if (!await isMediaStillReferenced(supabase, oldUrl)) {
      results.push(await Promise.allSettled([deleteR2MediaByUrl(oldUrl)]))
    }
  }
  return results.flat().some((result) => result.status === 'rejected')
}

export async function createGameAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const section = contentSection(formData)
  const imageUrl = await mediaUrlOrFail(formData, 'image', 'conteudo', section)
  if (!text(formData, 'name') || !imageUrl) fail('Informe nome e imagem do jogo.', 'conteudo', undefined, section)
  const { error } = await supabase.from('games').insert({ name: text(formData, 'name'), short_name: text(formData, 'shortName') || text(formData, 'name'), theme: text(formData, 'theme') || 'cs2', image_url: imageUrl, display_order: number(formData, 'displayOrder') })
  if (error) fail('Não foi possível cadastrar o jogo.', 'conteudo', undefined, section)
  done('Jogo cadastrado.', 'conteudo', undefined, section)
}

export async function createSeasonAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const gameId = z.string().uuid().safeParse(text(formData, 'gameId'))
  if (!gameId.success || !text(formData, 'label')) fail('Escolha um jogo e informe o nome da temporada.', 'tabela')
  if (checked(formData, 'isCurrent')) await supabase.from('ranking_seasons').update({ is_current: false }).eq('game_id', gameId.data)
  const { data: season, error } = await supabase.from('ranking_seasons').insert({ game_id: gameId.data, label: text(formData, 'label'), is_current: checked(formData, 'isCurrent') }).select('id').single()
  if (error || !season) fail('Não foi possível criar a temporada.', 'tabela')
  done('Temporada criada. Agora inclua os times na tabela.', 'tabela', season.id, undefined, gameId.data)
}

export async function createTeamAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const crestUrl = await mediaUrlOrFail(formData, 'crest', 'times')
  const name = text(formData, 'teamName')
  if (!name) fail('Informe o nome do time.', 'times')
  const gameIds = formData.getAll('gameIds').map(String).filter((value) => z.string().uuid().safeParse(value).success)
  if (!gameIds.length) fail('Selecione pelo menos um jogo para o time.', 'times')
  const { data: team, error } = await supabase.from('teams').insert({ name, city: text(formData, 'city') || 'Piauí', initials: text(formData, 'initials').slice(0, 4).toUpperCase() || 'TM', crest_url: crestUrl }).select('id').single()
  if (error || !team) fail('Não foi possível cadastrar esse time. Verifique se ele já existe.', 'times')
  const { error: gamesError } = await supabase.from('team_games').insert(gameIds.map((gameId) => ({ team_id: team.id, game_id: gameId, active: true })))
  if (gamesError) fail('O time foi criado, mas os jogos não puderam ser vinculados.', 'times')
  done('Time cadastrado e vinculado aos jogos.', 'times', undefined, undefined, gameIds[0])
}

export async function addTeamToSeasonAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const seasonId = z.string().uuid().safeParse(text(formData, 'seasonId'))
  const teamId = z.string().uuid().safeParse(text(formData, 'teamId'))
  if (!seasonId.success || !teamId.success) fail('Selecione uma temporada e um time.', 'tabela')
  const { data: season } = await supabase.from('ranking_seasons').select('game_id').eq('id', seasonId.data).maybeSingle()
  if (!season) fail('Temporada não encontrada.', 'tabela')
  const { data: teamGame } = await supabase.from('team_games').select('team_id').eq('team_id', teamId.data).eq('game_id', season.game_id).eq('active', true).maybeSingle()
  if (!teamGame) fail('Esse time não está vinculado ao jogo da temporada.', 'tabela', seasonId.data, undefined, season.game_id)
  const { error } = await supabase.from('ranking_entries').insert({
    season_id: seasonId.data,
    team_id: teamId.data,
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    previous_position: 0,
  })
  if (error) fail('Esse time já está nesta temporada ou não pôde ser adicionado.', 'tabela', seasonId.data, undefined, season.game_id)
  done('Time adicionado. Registre os resultados para montar a classificação.', 'tabela', seasonId.data, undefined, season.game_id)
}

export async function recordRankingResultAction(
  _previousState: RankingActionState,
  formData: FormData,
): Promise<RankingActionState> {
  try {
    await requireAdmin()
    const entryId = z.string().uuid().safeParse(text(formData, 'entryId'))
    const result = z.enum(['W', 'D', 'L']).safeParse(text(formData, 'result'))
    if (!entryId.success || !result.success) return rankingState('error', 'Resultado ou participante inválido.')

    const supabase = await createClient()
    const { error } = await supabase.from('ranking_results').insert({
      entry_id: entryId.data,
      result: result.data,
      played_at: new Date().toISOString().slice(0, 10),
    })
    if (error?.code === '42P01' || error?.code === 'PGRST205') {
      return rankingState('error', 'O histórico automático ainda não foi ativado no banco de dados.')
    }
    if (error) return rankingState('error', 'Não foi possível registrar o resultado.')

    revalidateRanking()
    const label = result.data === 'W' ? 'Vitória' : result.data === 'D' ? 'Empate' : 'Derrota'
    return rankingState('success', `${label} registrada e classificação recalculada.`)
  } catch {
    return rankingState('error', 'Não foi possível registrar o resultado.')
  }
}

export async function undoLastRankingResultAction(
  _previousState: RankingActionState,
  formData: FormData,
): Promise<RankingActionState> {
  try {
    await requireAdmin()
    const entryId = z.string().uuid().safeParse(text(formData, 'entryId'))
    if (!entryId.success) return rankingState('error', 'Participante inválido.')

    const supabase = await createClient()
    const { data: latest, error: lookupError } = await supabase.from('ranking_results')
      .select('id')
      .eq('entry_id', entryId.data)
      .order('played_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (lookupError?.code === '42P01' || lookupError?.code === 'PGRST205') {
      return rankingState('error', 'O histórico automático ainda não foi ativado no banco de dados.')
    }
    if (lookupError) return rankingState('error', 'Não foi possível consultar o histórico.')
    if (!latest) return rankingState('error', 'Ainda não há resultado para desfazer.')

    const { error } = await supabase.from('ranking_results').delete().eq('id', latest.id)
    if (error) return rankingState('error', 'Não foi possível desfazer o último resultado.')
    revalidateRanking()
    return rankingState('success', 'Último resultado desfeito e classificação recalculada.')
  } catch {
    return rankingState('error', 'Não foi possível desfazer o último resultado.')
  }
}

async function replaceTeamGames(supabase: SupabaseClient, teamId: string, gameIds: string[]) {
  const { error: deactivateError } = await supabase.from('team_games').update({ active: false }).eq('team_id', teamId)
  if (deactivateError) fail('Não foi possível atualizar os jogos do time.', 'times')
  const { error } = await supabase.from('team_games').upsert(
    gameIds.map((gameId) => ({ team_id: teamId, game_id: gameId, active: true })),
    { onConflict: 'team_id,game_id' },
  )
  if (error) fail('Não foi possível vincular os jogos ao time.', 'times')
}

export async function assignPlayerToTeamGameAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const profileId = z.string().uuid().safeParse(text(formData, 'profileId'))
  const teamId = z.string().uuid().safeParse(text(formData, 'teamId'))
  const gameId = z.string().uuid().safeParse(text(formData, 'gameId'))
  const role = z.enum(['player', 'captain', 'coach', 'reserve']).safeParse(text(formData, 'membershipRole'))
  const startedAt = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(text(formData, 'startedAt'))
  if (!profileId.success || !teamId.success || !gameId.success || !role.success || !startedAt.success) {
    fail('Selecione jogador, jogo, função e data de entrada.', 'times')
  }

  const [{ data: teamGame, error: teamGameError }, { data: team, error: teamError }, { data: profile, error: profileError }] = await Promise.all([
    supabase.from('team_games').select('team_id').eq('team_id', teamId.data).eq('game_id', gameId.data).eq('active', true).maybeSingle(),
    supabase.from('teams').select('name').eq('id', teamId.data).maybeSingle(),
    supabase.from('profiles').select('id').eq('id', profileId.data).maybeSingle(),
  ])
  if (teamGameError || teamError || !teamGame || !team) fail('O time não está ativo nessa modalidade.', 'times', undefined, undefined, gameId.data)
  if (profileError || !profile) fail('O perfil selecionado não foi encontrado.', 'times', undefined, undefined, gameId.data)

  const { data: current, error: currentError } = await supabase.from('player_team_memberships')
    .select('id,team_id,role,started_at')
    .eq('profile_id', profileId.data)
    .eq('game_id', gameId.data)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (currentError) fail('Não foi possível consultar o vínculo atual do jogador.', 'times', undefined, undefined, gameId.data)

  if (current?.team_id === teamId.data) {
    const { error: updateError } = await supabase.from('player_team_memberships').update({
      role: role.data,
      started_at: startedAt.data,
    }).eq('id', current.id)
    if (updateError) fail('Não foi possível atualizar o vínculo do jogador.', 'times', undefined, undefined, gameId.data)
    const { error: profileUpdateError } = await supabase.from('profiles')
      .update({ team_id: teamId.data, team: team.name })
      .eq('id', profileId.data)
    if (profileUpdateError) fail('O elenco foi atualizado, mas o perfil do jogador não pôde ser sincronizado.', 'times', undefined, undefined, gameId.data)
    done('Vínculo do jogador atualizado.', 'times', undefined, undefined, gameId.data)
  }

  if (current) {
    const { error: endError } = await supabase.from('player_team_memberships').update({ ended_at: startedAt.data }).eq('id', current.id)
    if (endError) fail('Não foi possível encerrar o vínculo anterior do jogador.', 'times', undefined, undefined, gameId.data)
  }

  const { data: membership, error } = await supabase.from('player_team_memberships').insert({
    profile_id: profileId.data,
    team_id: teamId.data,
    game_id: gameId.data,
    role: role.data,
    started_at: startedAt.data,
  }).select('id').single()
  if (error || !membership) {
    if (current) await supabase.from('player_team_memberships').update({ ended_at: null }).eq('id', current.id)
    fail('Não foi possível salvar o vínculo do jogador. Verifique a data e tente novamente.', 'times', undefined, undefined, gameId.data)
  }

  const { error: profileUpdateError } = await supabase.from('profiles')
    .update({ team_id: teamId.data, team: team.name })
    .eq('id', profileId.data)
  if (profileUpdateError) fail('O jogador entrou no elenco, mas o perfil não pôde ser sincronizado.', 'times', undefined, undefined, gameId.data)
  done(current ? 'Jogador transferido e histórico atualizado.' : 'Jogador vinculado ao elenco.', 'times', undefined, undefined, gameId.data)
}

export async function endPlayerMembershipAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const membershipId = z.string().uuid().safeParse(text(formData, 'membershipId'))
  const endedAt = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(text(formData, 'endedAt'))
  if (!membershipId.success || !endedAt.success) fail('Vínculo ou data de saída inválidos.', 'times')
  const { data: membership } = await supabase.from('player_team_memberships').select('profile_id,game_id').eq('id', membershipId.data).maybeSingle()
  if (!membership) fail('Vínculo não encontrado.', 'times')
  const { error } = await supabase.from('player_team_memberships').update({ ended_at: endedAt.data }).eq('id', membershipId.data)
  if (error) fail('Não foi possível encerrar o vínculo.', 'times', undefined, undefined, membership.game_id)

  const { data: anotherCurrent } = await supabase.from('player_team_memberships')
    .select('teams(id,name)')
    .eq('profile_id', membership.profile_id)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextTeam = Array.isArray(anotherCurrent?.teams) ? anotherCurrent.teams[0] : anotherCurrent?.teams
  await supabase.from('profiles').update({ team_id: nextTeam?.id ?? null, team: nextTeam?.name ?? null }).eq('id', membership.profile_id)
  done('Passagem encerrada e histórico preservado.', 'times', undefined, undefined, membership.game_id)
}

export async function updateUserManagementAction(formData: FormData) {
  const admin = await requireAdmin()
  const supabase = await createClient()
  const userId = z.string().uuid().safeParse(text(formData, 'userId'))
  const role = z.enum(['member', 'admin']).safeParse(text(formData, 'role'))
  if (!userId.success || !role.success) fail('Dados de usuário inválidos.', 'usuarios')
  if (userId.data === admin.id && role.data !== 'admin') fail('Você não pode remover sua própria permissão administrativa.', 'usuarios')

  const { error } = await supabase.from('profiles').update({ role: role.data }).eq('id', userId.data)
  if (error) fail('Não foi possível atualizar o usuário.', 'usuarios')
  done('Permissão atualizada.', 'usuarios')
}

export async function updateFeaturedPlayerAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const profileId = z.string().uuid().safeParse(text(formData, 'profileId'))
  const featuredOrder = Math.min(99, number(formData, 'featuredOrder'))
  if (!profileId.success) fail('Jogador inválido.', 'jogadores')

  const { error } = await supabase.from('profiles').update({
    is_featured: checked(formData, 'isFeatured'),
    featured_order: featuredOrder,
  }).eq('id', profileId.data)

  if (error) fail('Não foi possível atualizar o destaque. Verifique se a migração de jogadores foi aplicada.', 'jogadores')
  done(checked(formData, 'isFeatured') ? 'Jogador adicionado à vitrine.' : 'Jogador removido da vitrine.', 'jogadores')
}

export async function createEventAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const section = contentSection(formData)
  const imageUrl = await mediaUrlOrFail(formData, 'image', 'conteudo', section)
  const featuredUrl = await mediaUrlOrFail(formData, 'featured', 'conteudo', section)
  if (!text(formData, 'title') || !text(formData, 'startsAt') || !imageUrl) fail('Preencha título, data e imagem do evento.', 'conteudo', undefined, section)
  const { error } = await supabase.from('events').insert({ title: text(formData, 'title'), starts_at: text(formData, 'startsAt'), ends_at: text(formData, 'endsAt') || null, subtitle: text(formData, 'subtitle') || null, status_label: text(formData, 'statusLabel') || 'Em breve', status_tone: text(formData, 'statusTone') || 'inactive', image_url: imageUrl, featured_media_url: featuredUrl, registration_url: text(formData, 'registrationUrl') || null, cta_label: text(formData, 'ctaLabel') || 'Saiba mais', display_order: number(formData, 'displayOrder') })
  if (error) fail('Não foi possível publicar o evento.', 'conteudo', undefined, section)
  done('Evento publicado.', 'conteudo', undefined, section)
}

export async function createHeroSlideAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const section = contentSection(formData)
  const imageUrl = await mediaUrlOrFail(formData, 'image', 'conteudo', section)
  if (!imageUrl) fail('Envie uma imagem para o banner principal.', 'conteudo', undefined, section)
  const { error } = await supabase.from('hero_slides').insert({
    image_url: imageUrl,
    alt_text: text(formData, 'alt') || 'Banner principal da FEGEPI',
    link_url: text(formData, 'linkUrl') || null,
    display_order: number(formData, 'displayOrder'),
  })
  if (error) fail('Não foi possível publicar o banner.', 'conteudo', undefined, section)
  done('Banner publicado no topo do site.', 'conteudo', undefined, section)
}

export async function saveGalleryAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const section = contentSection(formData)
  const bannerUrl = await mediaUrlOrFail(formData, 'banner', 'conteudo', section)
  if (!bannerUrl) fail('Informe a imagem de capa da galeria.', 'conteudo', undefined, section)
  const { error } = await supabase.from('gallery_settings').upsert({ id: true, eyebrow: text(formData, 'eyebrow') || 'Fotos', title: text(formData, 'title') || 'Fotos do último evento', banner_title: text(formData, 'bannerTitle'), banner_description: text(formData, 'bannerDescription'), banner_image_url: bannerUrl, banner_image_alt: text(formData, 'bannerAlt') || 'Galeria de evento', updated_at: new Date().toISOString() })
  if (error) fail('Não foi possível atualizar a capa da galeria.', 'conteudo', undefined, section)
  done('Capa da galeria atualizada.', 'conteudo', undefined, section)
}

export async function createGalleryPhotoAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const section = contentSection(formData)
  const imageUrl = await mediaUrlOrFail(formData, 'image', 'conteudo', section)
  if (!imageUrl) fail('Envie uma foto para a galeria.', 'conteudo', undefined, section)
  const { error } = await supabase.from('gallery_photos').insert({ image_url: imageUrl, alt_text: text(formData, 'alt') || 'Foto de evento da FEGEPI', download_url: text(formData, 'downloadUrl') || imageUrl, display_order: number(formData, 'displayOrder') })
  if (error) fail('Não foi possível adicionar a foto.', 'conteudo', undefined, section)
  done('Foto adicionada à galeria.', 'conteudo', undefined, section)
}

export async function updateHeroSlideAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const section = 'banners'
  const id = z.string().uuid().safeParse(text(formData, 'id'))
  if (!id.success) fail('Banner inválido.', 'conteudo', undefined, section)
  const oldImageUrl = text(formData, 'oldImageUrl')
  const imageUrl = await mediaUrlOrFail(formData, 'image', 'conteudo', section, oldImageUrl)
  if (!imageUrl) fail('Informe uma imagem para o banner.', 'conteudo', undefined, section)
  const { error } = await supabase.from('hero_slides').update({
    image_url: imageUrl,
    alt_text: text(formData, 'alt') || 'Banner principal da FEGEPI',
    link_url: text(formData, 'linkUrl') || null,
    active: checked(formData, 'active'),
    display_order: number(formData, 'displayOrder'),
  }).eq('id', id.data)
  if (error) fail('Não foi possível atualizar o banner.', 'conteudo', undefined, section)
  const cleanupFailed = await cleanupReplacedMedia(supabase, [[oldImageUrl, imageUrl]])
  done(cleanupFailed ? 'Banner atualizado, mas a imagem anterior permaneceu no R2.' : 'Banner atualizado.', 'conteudo', undefined, section)
}

export async function updateGameAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const section = 'jogos'
  const id = z.string().uuid().safeParse(text(formData, 'id'))
  if (!id.success || !text(formData, 'name')) fail('Dados do jogo inválidos.', 'conteudo', undefined, section)
  const oldImageUrl = text(formData, 'oldImageUrl')
  const imageUrl = await mediaUrlOrFail(formData, 'image', 'conteudo', section, oldImageUrl)
  if (!imageUrl) fail('Informe uma imagem para o jogo.', 'conteudo', undefined, section)
  const { error } = await supabase.from('games').update({
    name: text(formData, 'name'),
    short_name: text(formData, 'shortName') || text(formData, 'name'),
    theme: text(formData, 'theme') || 'cs2',
    image_url: imageUrl,
    active: checked(formData, 'active'),
    display_order: number(formData, 'displayOrder'),
  }).eq('id', id.data)
  if (error) fail('Não foi possível atualizar o jogo.', 'conteudo', undefined, section)
  const cleanupFailed = await cleanupReplacedMedia(supabase, [[oldImageUrl, imageUrl]])
  done(cleanupFailed ? 'Jogo atualizado, mas a imagem anterior permaneceu no R2.' : 'Jogo atualizado.', 'conteudo', undefined, section)
}

export async function updateEventAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const section = 'eventos'
  const id = z.string().uuid().safeParse(text(formData, 'id'))
  if (!id.success || !text(formData, 'title') || !text(formData, 'startsAt')) fail('Dados do evento inválidos.', 'conteudo', undefined, section)
  const oldImageUrl = text(formData, 'oldImageUrl')
  const oldFeaturedUrl = text(formData, 'oldFeaturedUrl') || null
  const imageUrl = await mediaUrlOrFail(formData, 'image', 'conteudo', section, oldImageUrl)
  const featuredUrl = checked(formData, 'removeFeatured')
    ? null
    : await mediaUrlOrFail(formData, 'featured', 'conteudo', section, oldFeaturedUrl)
  if (!imageUrl) fail('Informe a imagem principal do evento.', 'conteudo', undefined, section)
  const { error } = await supabase.from('events').update({
    title: text(formData, 'title'),
    starts_at: text(formData, 'startsAt'),
    ends_at: text(formData, 'endsAt') || null,
    subtitle: text(formData, 'subtitle') || null,
    status_label: text(formData, 'statusLabel') || 'Em breve',
    status_tone: text(formData, 'statusTone') || 'inactive',
    image_url: imageUrl,
    featured_media_url: featuredUrl,
    registration_url: text(formData, 'registrationUrl') || null,
    cta_label: text(formData, 'ctaLabel') || 'Saiba mais',
    active: checked(formData, 'active'),
    display_order: number(formData, 'displayOrder'),
  }).eq('id', id.data)
  if (error) fail('Não foi possível atualizar o evento.', 'conteudo', undefined, section)
  const cleanupFailed = await cleanupReplacedMedia(supabase, [[oldImageUrl, imageUrl], [oldFeaturedUrl, featuredUrl]])
  done(cleanupFailed ? 'Evento atualizado, mas uma mídia anterior permaneceu no R2.' : 'Evento atualizado.', 'conteudo', undefined, section)
}

export async function updateGalleryPhotoAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const section = 'galeria'
  const id = z.string().uuid().safeParse(text(formData, 'id'))
  if (!id.success) fail('Foto inválida.', 'conteudo', undefined, section)
  const oldImageUrl = text(formData, 'oldImageUrl')
  const imageUrl = await mediaUrlOrFail(formData, 'image', 'conteudo', section, oldImageUrl)
  if (!imageUrl) fail('Informe uma imagem para a galeria.', 'conteudo', undefined, section)
  const requestedDownloadUrl = text(formData, 'downloadUrl')
  const downloadUrl = !requestedDownloadUrl || requestedDownloadUrl === oldImageUrl ? imageUrl : requestedDownloadUrl
  const { error } = await supabase.from('gallery_photos').update({
    image_url: imageUrl,
    alt_text: text(formData, 'alt') || 'Foto de evento da FEGEPI',
    download_url: downloadUrl,
    active: checked(formData, 'active'),
    display_order: number(formData, 'displayOrder'),
  }).eq('id', id.data)
  if (error) fail('Não foi possível atualizar a foto.', 'conteudo', undefined, section)
  const cleanupFailed = await cleanupReplacedMedia(supabase, [[oldImageUrl, imageUrl]])
  done(cleanupFailed ? 'Foto atualizada, mas a imagem anterior permaneceu no R2.' : 'Foto atualizada.', 'conteudo', undefined, section)
}

export async function updateTeamAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const id = z.string().uuid().safeParse(text(formData, 'id'))
  const name = text(formData, 'teamName')
  const gameIds = formData.getAll('gameIds').map(String).filter((value) => z.string().uuid().safeParse(value).success)
  if (!id.success || !name) fail('Dados do time inválidos.', 'times')
  if (!gameIds.length) fail('Selecione pelo menos uma modalidade para o time.', 'times')
  const oldCrestUrl = text(formData, 'oldCrestUrl') || null
  const crestUrl = await mediaUrlOrFail(formData, 'crest', 'times', undefined, oldCrestUrl)
  await replaceTeamGames(supabase, id.data, gameIds)
  const { error } = await supabase.from('teams').update({
    name,
    city: text(formData, 'city') || 'Piauí',
    initials: text(formData, 'initials').slice(0, 4).toUpperCase() || 'TM',
    crest_url: crestUrl,
  }).eq('id', id.data)
  if (error) fail('Não foi possível atualizar o time.', 'times')
  const cleanupFailed = await cleanupReplacedMedia(supabase, [[oldCrestUrl, crestUrl]])
  done(
    cleanupFailed ? 'Time atualizado, mas o escudo anterior permaneceu no R2.' : 'Time e modalidades atualizados.',
    'times',
    undefined,
    undefined,
    gameIds[0],
  )
}

export async function deleteContentAction(formData: FormData) {
  await requireAdmin()
  const table = text(formData, 'table')
  const id = text(formData, 'id')
  const tab = text(formData, 'tab') || 'conteudo'
  const section = text(formData, 'contentSection') || undefined
  const gameId = text(formData, 'gameId') || undefined
  if (!['hero_slides', 'games', 'events', 'gallery_photos', 'ranking_seasons', 'teams', 'ranking_entries'].includes(table)) fail('Ação inválida.', tab, undefined, section)
  const supabase = await createClient()
  const mediaColumns = mediaColumnsByTable[table] ?? []
  let mediaUrls: string[] = []
  if (mediaColumns.length) {
    const { data: item, error: lookupError } = await supabase.from(table).select(mediaColumns.join(',')).eq('id', id).maybeSingle()
    if (lookupError) fail('Não foi possível localizar a mídia deste item.', tab, undefined, section)
    const mediaItem = item as Record<string, unknown> | null
    mediaUrls = [...new Set(mediaColumns
      .map((column) => mediaItem?.[column])
      .filter((url): url is string => typeof url === 'string' && url.length > 0))]
  }
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) fail('Não foi possível remover este item.', tab, undefined, section)

  const removableUrls: string[] = []
  for (const mediaUrl of mediaUrls) {
    if (!await isMediaStillReferenced(supabase, mediaUrl)) removableUrls.push(mediaUrl)
  }
  const r2Results = await Promise.allSettled(removableUrls.map(deleteR2MediaByUrl))
  if (r2Results.some((result) => result.status === 'rejected')) {
    done('Item removido, mas uma mídia não pôde ser apagada do R2.', tab, undefined, section, gameId)
  }
  done('Item removido.', tab, undefined, section, gameId)
}
