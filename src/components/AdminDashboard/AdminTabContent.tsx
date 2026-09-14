import ChampionshipsTab from './tabs/ChampionshipsTab'
import ContentTab from './tabs/ContentTab'
import OverviewTab from './tabs/OverviewTab'
import StandingsTab from './tabs/StandingsTab'
import TeamsTab from './tabs/TeamsTab'
import PlayersTab from './tabs/PlayersTab'
import UsersTab from './tabs/UsersTab'
import type { AdminData, AdminTabId, ContentSectionId } from './types'

export default function AdminTabContent({
  activeTab,
  activeContentSection,
  data,
  championshipId,
}: {
  activeTab: AdminTabId
  activeContentSection: ContentSectionId
  data: AdminData
  championshipId?: string
}) {
  switch (activeTab) {
    case 'conteudo':
      return <ContentTab section={activeContentSection} data={data} />
    case 'times':
      return <TeamsTab data={data} />
    case 'jogadores':
      return <PlayersTab data={data} />
    case 'campeonatos':
      return <ChampionshipsTab data={data} championshipId={championshipId} />
    case 'tabela':
      return <StandingsTab data={data} />
    case 'usuarios':
      return <UsersTab data={data} />
    default:
      return <OverviewTab data={data} />
  }
}
