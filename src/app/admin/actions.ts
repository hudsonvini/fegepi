'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

function text(formData: FormData, name: string) { return String(formData.get(name) ?? '').trim() }
function number(formData: FormData, name: string) { return Number(formData.get(name) ?? 0) }
function checked(formData: FormData, name: string) { return formData.get(name) === 'on' }
function done(message: string) { revalidatePath('/'); revalidatePath('/admin'); redirect(`/admin?mensagem=${encodeURIComponent(message)}`) }

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
  await requireAdmin(); const supabase = await createClient(); const imageUrl = await mediaUrl(formData)
  if (!text(formData, 'name') || !imageUrl) redirect('/admin?erro=Informe%20nome%20e%20imagem%20do%20jogo.')
  await supabase.from('games').insert({ name: text(formData, 'name'), short_name: text(formData, 'shortName') || text(formData, 'name'), theme: text(formData, 'theme') || 'cs2', image_url: imageUrl, display_order: number(formData, 'displayOrder') })
  done('Jogo cadastrado.')
}

export async function createSeasonAction(formData: FormData) {
  await requireAdmin(); const supabase = await createClient()
  await supabase.from('ranking_seasons').insert({ game_id: text(formData, 'gameId'), label: text(formData, 'label'), is_current: checked(formData, 'isCurrent') })
  done('Temporada cadastrada.')
}

export async function createTeamRankingAction(formData: FormData) {
  await requireAdmin(); const supabase = await createClient(); const crestUrl = await mediaUrl(formData, 'crest')
  const { data: team, error } = await supabase.from('teams').insert({ name: text(formData, 'teamName'), city: text(formData, 'city') || 'Piauí', initials: text(formData, 'initials') || 'TM', crest_url: crestUrl }).select('id').single()
  if (error || !team) redirect('/admin?erro=Não%20foi%20possível%20cadastrar%20o%20time.')
  await supabase.from('ranking_entries').insert({ season_id: text(formData, 'seasonId'), team_id: team.id, points: number(formData, 'points'), previous_position: number(formData, 'previousPosition') })
  done('Time incluído no ranking.')
}

export async function createEventAction(formData: FormData) {
  await requireAdmin(); const supabase = await createClient(); const imageUrl = await mediaUrl(formData); const featuredUrl = await mediaUrl(formData, 'featured')
  if (!text(formData, 'title') || !text(formData, 'startsAt') || !imageUrl) redirect('/admin?erro=Preencha%20título%2C%20data%20e%20imagem%20do%20evento.')
  await supabase.from('events').insert({ title: text(formData, 'title'), starts_at: text(formData, 'startsAt'), ends_at: text(formData, 'endsAt') || null, subtitle: text(formData, 'subtitle') || null, status_label: text(formData, 'statusLabel') || 'Em breve', status_tone: text(formData, 'statusTone') || 'inactive', image_url: imageUrl, featured_media_url: featuredUrl, registration_url: text(formData, 'registrationUrl') || null, cta_label: text(formData, 'ctaLabel') || 'Saiba mais', display_order: number(formData, 'displayOrder') })
  done('Evento publicado.')
}

export async function saveGalleryAction(formData: FormData) {
  await requireAdmin(); const supabase = await createClient(); const bannerUrl = await mediaUrl(formData, 'banner')
  if (!bannerUrl) redirect('/admin?erro=Informe%20a%20imagem%20de%20capa%20da%20galeria.')
  await supabase.from('gallery_settings').upsert({ id: true, eyebrow: text(formData, 'eyebrow') || 'Fotos', title: text(formData, 'title') || 'Fotos do último evento', banner_title: text(formData, 'bannerTitle'), banner_description: text(formData, 'bannerDescription'), banner_image_url: bannerUrl, banner_image_alt: text(formData, 'bannerAlt') || 'Galeria de evento', updated_at: new Date().toISOString() })
  done('Capa da galeria atualizada.')
}

export async function createGalleryPhotoAction(formData: FormData) {
  await requireAdmin(); const supabase = await createClient(); const imageUrl = await mediaUrl(formData)
  if (!imageUrl) redirect('/admin?erro=Envie%20uma%20foto%20para%20a%20galeria.')
  await supabase.from('gallery_photos').insert({ image_url: imageUrl, alt_text: text(formData, 'alt') || 'Foto de evento da FEGEPI', download_url: text(formData, 'downloadUrl') || imageUrl, display_order: number(formData, 'displayOrder') })
  done('Foto adicionada à galeria.')
}

export async function deleteContentAction(formData: FormData) {
  await requireAdmin(); const table = text(formData, 'table'); const id = text(formData, 'id')
  if (!['games', 'events', 'gallery_photos', 'ranking_seasons'].includes(table)) redirect('/admin?erro=Ação%20inválida.')
  const supabase = await createClient(); await supabase.from(table).delete().eq('id', id)
  done('Item removido.')
}
