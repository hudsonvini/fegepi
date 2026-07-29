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
function recentForm(formData: FormData) {
  return formData.getAll('recentForm')
    .map(String)
    .filter((result): result is 'W' | 'D' | 'L' => result === 'W' || result === 'D' || result === 'L')
    .slice(0, 5)
}
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
  redirect(`${adminPath(tab, seasonId, section, gameId)}&mensagem=${encodeURIComponent(message)}`)
}
function fail(message: string, tab?: string, seasonId?: string, section?: string, gameId?: string): never {
  redirect(`${adminPath(tab, seasonId, section, gameId)}&erro=${encodeURIComponent(message)}`)
}
function contentSection(formData: FormData) { return text(formData, 'contentSection') || 'jogos' }

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
  const entry = { season_id: seasonId.data, team_id: teamId.data, points: number(formData, 'points'), wins: number(formData, 'wins'), draws: number(formData, 'draws'), losses: number(formData, 'losses'), recent_form: recentForm(formData), previous_position: number(formData, 'previousPosition') }
  let { error } = await supabase.from('ranking_entries').insert(entry)
  if (error?.code === 'PGRST204' || error?.code === '42703') {
    const { recent_form: _recentForm, ...legacyEntry } = entry
    void _recentForm
    error = (await supabase.from('ranking_entries').insert(legacyEntry)).error
  }
  if (error) fail('Esse time já está nesta temporada ou não pôde ser adicionado.', 'tabela', seasonId.data, undefined, season.game_id)
  done('Time adicionado à tabela.', 'tabela', seasonId.data, undefined, season.game_id)
}

export async function updateRankingEntryAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const entryId = z.string().uuid().safeParse(text(formData, 'entryId'))
  const seasonId = z.string().uuid().safeParse(text(formData, 'seasonId'))
  if (!entryId.success || !seasonId.success) fail('Registro de classificação inválido.', 'tabela')
  const changes = { points: number(formData, 'points'), wins: number(formData, 'wins'), draws: number(formData, 'draws'), losses: number(formData, 'losses'), recent_form: recentForm(formData), previous_position: number(formData, 'previousPosition') }
  let { error } = await supabase.from('ranking_entries').update(changes).eq('id', entryId.data)
  if (error?.code === 'PGRST204' || error?.code === '42703') {
    const { recent_form: _recentForm, ...legacyChanges } = changes
    void _recentForm
    error = (await supabase.from('ranking_entries').update(legacyChanges).eq('id', entryId.data)).error
  }
  if (error) fail('Não foi possível atualizar a tabela.', 'tabela', seasonId.data)
  done('Classificação atualizada.', 'tabela', seasonId.data, undefined, text(formData, 'gameId') || undefined)
}

export async function updateTeamGamesAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const teamId = z.string().uuid().safeParse(text(formData, 'teamId'))
  const gameIds = formData.getAll('gameIds').map(String).filter((value) => z.string().uuid().safeParse(value).success)
  if (!teamId.success || !gameIds.length) fail('Selecione pelo menos um jogo para o time.', 'times')

  const { error: deactivateError } = await supabase.from('team_games').update({ active: false }).eq('team_id', teamId.data)
  if (deactivateError) fail('Não foi possível atualizar os jogos do time.', 'times')
  const { error } = await supabase.from('team_games').upsert(
    gameIds.map((gameId) => ({ team_id: teamId.data, game_id: gameId, active: true })),
    { onConflict: 'team_id,game_id' },
  )
  if (error) fail('Não foi possível vincular os jogos ao time.', 'times')
  done('Jogos do time atualizados.', 'times', undefined, undefined, gameIds[0])
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

  const [{ data: teamGame }, { data: team }] = await Promise.all([
    supabase.from('team_games').select('team_id').eq('team_id', teamId.data).eq('game_id', gameId.data).eq('active', true).maybeSingle(),
    supabase.from('teams').select('name').eq('id', teamId.data).maybeSingle(),
  ])
  if (!teamGame || !team) fail('O time não está ativo nesse jogo.', 'times', undefined, undefined, gameId.data)

  const { data: current } = await supabase.from('player_team_memberships')
    .select('id,team_id')
    .eq('profile_id', profileId.data)
    .eq('game_id', gameId.data)
    .is('ended_at', null)
    .maybeSingle()
  if (current?.team_id === teamId.data) fail('Esse jogador já está neste time para o jogo selecionado.', 'times', undefined, undefined, gameId.data)
  if (current) {
    const { error: endError } = await supabase.from('player_team_memberships').update({ ended_at: startedAt.data }).eq('id', current.id)
    if (endError) fail('Não foi possível encerrar o vínculo anterior do jogador.', 'times', undefined, undefined, gameId.data)
  }

  const { error } = await supabase.from('player_team_memberships').insert({
    profile_id: profileId.data,
    team_id: teamId.data,
    game_id: gameId.data,
    role: role.data,
    started_at: startedAt.data,
  })
  if (error) fail('Não foi possível vincular o jogador ao time.', 'times', undefined, undefined, gameId.data)
  await supabase.from('profiles').update({ team_id: teamId.data, team: team.name }).eq('id', profileId.data)
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
  if (!id.success || !name) fail('Dados do time inválidos.', 'times')
  const oldCrestUrl = text(formData, 'oldCrestUrl') || null
  const crestUrl = await mediaUrlOrFail(formData, 'crest', 'times', undefined, oldCrestUrl)
  const { error } = await supabase.from('teams').update({
    name,
    city: text(formData, 'city') || 'Piauí',
    initials: text(formData, 'initials').slice(0, 4).toUpperCase() || 'TM',
    crest_url: crestUrl,
  }).eq('id', id.data)
  if (error) fail('Não foi possível atualizar o time.', 'times')
  const cleanupFailed = await cleanupReplacedMedia(supabase, [[oldCrestUrl, crestUrl]])
  done(cleanupFailed ? 'Time atualizado, mas o escudo anterior permaneceu no R2.' : 'Time atualizado.', 'times')
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
