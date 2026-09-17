export type RecentPlacement = { id: string; name: string; placement: number | null }
export const PLACEMENT_POINTS = [250, 200, 100, 80, 60, 40, 20, 10] as const
export function placementPoints(placement: number | null): number {
  return PLACEMENT_POINTS[(placement ?? 0) - 1] ?? 0
}
export function placementLabel(result?: RecentPlacement): string {
  if (!result) return 'Sem campeonato concluído'
  if (result.placement === null) return `${result.name}: não participou`
  return `${result.name}: ${result.placement}º lugar · ${placementPoints(result.placement)} pontos`
}
