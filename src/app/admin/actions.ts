'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

function text(formData: FormData, name: string) { return String(formData.get(name) ?? '').trim() }
function number(formData: FormData, name: string) { return Math.max(0, Number(formData.get(name) ?? 0) || 0) }
function checked(formData: FormData, name: string) { return formData.get(name) === 'on' }
function adminPath(tab = 'visao-geral', seasonId?: string) {
  const params = new URLSearchParams({ aba: tab })
  if (seasonId) params.set('temporada', seasonId)
  return `/admin?${params}`
}
function done(message: string, tab?: string, seasonId?: string) {
  revalidatePath('/', 'layout')
  revalidatePath('/admin')
  revalidatePath('/perfil')
  redirect(`${adminPath(tab, seasonId)}&mensagem=${encodeURIComponent(message)}`)
}
function fail(message: string, tab?: string, seasonId?: string): never {
  redirect(`${adminPath(tab, seasonId)}&erro=${encodeURIComponent(message)}`)
}

async function mediaUrl(formData: FormData, field = 'image') {
  const directUrl = text(formData, `${field}Url`)
  const file = formData.get(field)
  if (!(file instanceof File) || file.size === 0) return directUrl || null
  if (file.size > 8 * 1024 * 1024) throw new Error('A imagem deve ter até 8 MB.')
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) throw new Error('Envie uma imagem ou vídeo válido.')
  const supabase = await createClient()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('fegepi-media').upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new Error('Não foi possível enviar o arquivo.')
  return supabase.storage.from('fegepi-media').getPublicUrl(path).data.publicUrl
}

export async function createGameAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const imageUrl = await mediaUrl(formData)
  if (!text(formData, 'name') || !imageUrl) fail('Informe nome e imagem do jogo.', 'conteudo')
  const { error } = await supabase.from('games').insert({ name: text(formData, 'name'), short_name: text(formData, 'shortName') || text(formData, 'name'), theme: text(formData, 'theme') || 'cs2', image_url: imageUrl, display_order: number(formData, 'displayOrder') })
  if (error) fail('Não foi possível cadastrar o jogo.', 'conteudo')
  done('Jogo cadastrado.', 'conteudo')
}

export async function createSeasonAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const gameId = z.string().uuid().safeParse(text(formData, 'gameId'))
  if (!gameId.success || !text(formData, 'label')) fail('Escolha um jogo e informe o nome da temporada.', 'tabela')
  if (checked(formData, 'isCurrent')) await supabase.from('ranking_seasons').update({ is_current: false }).eq('game_id', gameId.data)
  const { data: season, error } = await supabase.from('ranking_seasons').insert({ game_id: gameId.data, label: text(formData, 'label'), is_current: checked(formData, 'isCurrent') }).select('id').single()
  if (error || !season) fail('Não foi possível criar a temporada.', 'tabela')
  done('Temporada criada. Agora inclua os times na tabela.', 'tabela', season.id)
}

export async function createTeamAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const crestUrl = await mediaUrl(formData, 'crest')
  const name = text(formData, 'teamName')
  if (!name) fail('Informe o nome do time.', 'times')
  const { error } = await supabase.from('teams').insert({ name, city: text(formData, 'city') || 'Piauí', initials: text(formData, 'initials').slice(0, 4).toUpperCase() || 'TM', crest_url: crestUrl })
  if (error) fail('Não foi possível cadastrar esse time. Verifique se ele já existe.', 'times')
  done('Time cadastrado.', 'times')
}

export async function addTeamToSeasonAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const seasonId = z.string().uuid().safeParse(text(formData, 'seasonId'))
  const teamId = z.string().uuid().safeParse(text(formData, 'teamId'))
  if (!seasonId.success || !teamId.success) fail('Selecione uma temporada e um time.', 'tabela')
  const { error } = await supabase.from('ranking_entries').insert({ season_id: seasonId.data, team_id: teamId.data, points: number(formData, 'points'), wins: number(formData, 'wins'), draws: number(formData, 'draws'), losses: number(formData, 'losses'), previous_position: number(formData, 'previousPosition') })
  if (error) fail('Esse time já está nesta temporada ou não pôde ser adicionado.', 'tabela', seasonId.data)
  done('Time adicionado à tabela.', 'tabela', seasonId.data)
}

export async function updateRankingEntryAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const entryId = z.string().uuid().safeParse(text(formData, 'entryId'))
  const seasonId = z.string().uuid().safeParse(text(formData, 'seasonId'))
  if (!entryId.success || !seasonId.success) fail('Registro de classificação inválido.', 'tabela')
  const { error } = await supabase.from('ranking_entries').update({ points: number(formData, 'points'), wins: number(formData, 'wins'), draws: number(formData, 'draws'), losses: number(formData, 'losses'), previous_position: number(formData, 'previousPosition') }).eq('id', entryId.data)
  if (error) fail('Não foi possível atualizar a tabela.', 'tabela', seasonId.data)
  done('Classificação atualizada.', 'tabela', seasonId.data)
}

export async function updateUserManagementAction(formData: FormData) {
  const admin = await requireAdmin()
  const supabase = await createClient()
  const userId = z.string().uuid().safeParse(text(formData, 'userId'))
  const role = z.enum(['member', 'admin']).safeParse(text(formData, 'role'))
  const teamId = z.string().uuid().or(z.literal('')).safeParse(text(formData, 'teamId'))
  if (!userId.success || !role.success || !teamId.success) fail('Dados de usuário inválidos.', 'usuarios')
  if (userId.data === admin.id && role.data !== 'admin') fail('Você não pode remover sua própria permissão administrativa.', 'usuarios')

  let teamName: string | null = null
  if (teamId.data) {
    const { data: team } = await supabase.from('teams').select('name').eq('id', teamId.data).maybeSingle()
    if (!team) fail('Time não encontrado.', 'usuarios')
    teamName = team.name
  }
  const { error } = await supabase.from('profiles').update({ role: role.data, team_id: teamId.data || null, team: teamName }).eq('id', userId.data)
  if (error) fail('Não foi possível atualizar o usuário.', 'usuarios')
  done('Permissões e time atualizados.', 'usuarios')
}

export async function createEventAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const imageUrl = await mediaUrl(formData)
  const featuredUrl = await mediaUrl(formData, 'featured')
  if (!text(formData, 'title') || !text(formData, 'startsAt') || !imageUrl) fail('Preencha título, data e imagem do evento.', 'conteudo')
  const { error } = await supabase.from('events').insert({ title: text(formData, 'title'), starts_at: text(formData, 'startsAt'), ends_at: text(formData, 'endsAt') || null, subtitle: text(formData, 'subtitle') || null, status_label: text(formData, 'statusLabel') || 'Em breve', status_tone: text(formData, 'statusTone') || 'inactive', image_url: imageUrl, featured_media_url: featuredUrl, registration_url: text(formData, 'registrationUrl') || null, cta_label: text(formData, 'ctaLabel') || 'Saiba mais', display_order: number(formData, 'displayOrder') })
  if (error) fail('Não foi possível publicar o evento.', 'conteudo')
  done('Evento publicado.', 'conteudo')
}

export async function saveGalleryAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const bannerUrl = await mediaUrl(formData, 'banner')
  if (!bannerUrl) fail('Informe a imagem de capa da galeria.', 'conteudo')
  const { error } = await supabase.from('gallery_settings').upsert({ id: true, eyebrow: text(formData, 'eyebrow') || 'Fotos', title: text(formData, 'title') || 'Fotos do último evento', banner_title: text(formData, 'bannerTitle'), banner_description: text(formData, 'bannerDescription'), banner_image_url: bannerUrl, banner_image_alt: text(formData, 'bannerAlt') || 'Galeria de evento', updated_at: new Date().toISOString() })
  if (error) fail('Não foi possível atualizar a capa da galeria.', 'conteudo')
  done('Capa da galeria atualizada.', 'conteudo')
}

export async function createGalleryPhotoAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  const imageUrl = await mediaUrl(formData)
  if (!imageUrl) fail('Envie uma foto para a galeria.', 'conteudo')
  const { error } = await supabase.from('gallery_photos').insert({ image_url: imageUrl, alt_text: text(formData, 'alt') || 'Foto de evento da FEGEPI', download_url: text(formData, 'downloadUrl') || imageUrl, display_order: number(formData, 'displayOrder') })
  if (error) fail('Não foi possível adicionar a foto.', 'conteudo')
  done('Foto adicionada à galeria.', 'conteudo')
}

export async function deleteContentAction(formData: FormData) {
  await requireAdmin()
  const table = text(formData, 'table')
  const id = text(formData, 'id')
  const tab = text(formData, 'tab') || 'conteudo'
  if (!['games', 'events', 'gallery_photos', 'ranking_seasons', 'teams', 'ranking_entries'].includes(table)) fail('Ação inválida.', tab)
  const supabase = await createClient()
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) fail('Não foi possível remover este item.', tab)
  done('Item removido.', tab)
}
