'use server'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function saveChampionshipAction(formData: FormData) {
  await requireAdmin()
  const parsed = z.object({
    id: z.uuid().nullable(), seasonId: z.uuid(), name: z.string().trim().min(1).max(120),
    playedAt: z.iso.date(), status: z.enum(['draft', 'completed', 'cancelled']),
    version: z.coerce.number().int().min(0),
    results: z.array(z.object({ team_id: z.uuid(), placement: z.number().int().positive().nullable() })),
  }).safeParse({
    id: formData.get('id') || null, seasonId: formData.get('seasonId'), name: formData.get('name'),
    playedAt: formData.get('playedAt'), status: formData.get('status'), version: formData.get('version') || 0,
    results: formData.getAll('teamIds').map((teamId) => ({ team_id: String(teamId), placement: formData.get(`placement_${teamId}`) ? Number(formData.get(`placement_${teamId}`)) : null })),
  })
  const params = new URLSearchParams({ aba: 'campeonatos' })
  if (z.uuid().safeParse(formData.get('seasonId')).success) params.set('temporada', String(formData.get('seasonId')))
  if (z.uuid().safeParse(formData.get('id')).success) params.set('campeonato', String(formData.get('id')))
  const path = `/admin?${params}`
  if (!parsed.success) redirect(`${path}&erro=${encodeURIComponent('Confira nome, data, participantes e colocações.')}`)
  const values = parsed.data
  const supabase = await createClient()
  if (values.results.length) {
    const { data: inactive, error: teamError } = await supabase.from('teams').select('id').in('id', values.results.map((result) => result.team_id)).eq('active', false)
    const { data: previous, error: previousError } = values.id
      ? await supabase.from('championship_results').select('team_id').eq('championship_id', values.id)
      : { data: [], error: null }
    if (teamError || previousError) redirect(`${path}&erro=${encodeURIComponent('Não foi possível verificar os participantes.')}`)
    if (inactive?.some((team) => !previous?.some((result) => result.team_id === team.id))) {
      redirect(`${path}&erro=${encodeURIComponent('Reative o time antes de inscrevê-lo em outro campeonato.')}`)
    }
  }
  const { data: championshipId, error } = await supabase.rpc('save_championship', {
    p_id: values.id, p_season_id: values.seasonId, p_name: values.name,
    p_played_at: values.playedAt, p_status: values.status, p_version: values.version, p_results: values.results,
  })
  if (error) {
    const message = error.code === '23505' ? 'Não repita times ou colocações no campeonato.'
      : error.code === '23503' ? 'Todos os participantes precisam estar inscritos na temporada.'
      : error.code === 'P0001' ? error.message : 'Não foi possível salvar o campeonato. Verifique a configuração do banco e tente novamente.'
    redirect(`${path}&erro=${encodeURIComponent(message)}`)
  }
  revalidatePath('/', 'layout')
  revalidatePath('/admin')
  params.set('campeonato', championshipId)
  redirect(`/admin?${params}&mensagem=${encodeURIComponent('Campeonato salvo. Classificação atualizada automaticamente.')}`)
}
