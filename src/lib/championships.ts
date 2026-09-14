export type RecentPlacement = { id: string; name: string; placement: number | null }
export function placementPoints(placement: number | null): number {
  return ({ 1: 250, 2: 125, 3: 70, 4: 50 } as Record<number, number>)[placement ?? 0] ?? 0
}
export function placementLabel(result?: RecentPlacement): string {
  if (!result) return 'Sem campeonato concluído'
  if (result.placement === null) return `${result.name}: não participou`
  return `${result.name}: ${result.placement}º lugar · ${placementPoints(result.placement)} pontos`
}
