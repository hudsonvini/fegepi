import {
  CalendarDays,
  FileText,
  Gamepad2,
  ImagePlus,
  LayoutDashboard,
  PanelsTopLeft,
  Trophy,
  Users,
  UsersRound,
} from 'lucide-react'
import type { AdminTabId, ContentSectionId } from './types'

export const adminTabs = [
  { id: 'visao-geral', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'conteudo', label: 'Gestão de conteúdo', icon: FileText },
  { id: 'times', label: 'Times', icon: UsersRound },
  { id: 'tabela', label: 'Temporadas e tabela', icon: Trophy },
  { id: 'usuarios', label: 'Usuários e permissões', icon: Users },
] as const

export const contentSections = [
  { id: 'banners', label: 'Banners', icon: PanelsTopLeft },
  { id: 'jogos', label: 'Jogos', icon: Gamepad2 },
  { id: 'eventos', label: 'Eventos', icon: CalendarDays },
  { id: 'galeria', label: 'Galeria', icon: ImagePlus },
] as const

export function adminHref(tab: AdminTabId, seasonId?: string, gameId?: string) {
  const params = new URLSearchParams({ aba: tab })
  if (seasonId) params.set('temporada', seasonId)
  if (gameId) params.set('jogo', gameId)
  return `/admin?${params}`
}

export function contentHref(section: ContentSectionId) {
  return `/admin?${new URLSearchParams({ aba: 'conteudo', secao: section })}`
}

export function isAdminTab(value?: string): value is AdminTabId {
  return adminTabs.some((tab) => tab.id === value)
}

export function isContentSection(value?: string): value is ContentSectionId {
  return contentSections.some((section) => section.id === value)
}
