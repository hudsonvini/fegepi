import ContentTab from './tabs/ContentTab'
import OverviewTab from './tabs/OverviewTab'
import StandingsTab from './tabs/StandingsTab'
import TeamsTab from './tabs/TeamsTab'
import UsersTab from './tabs/UsersTab'
import type { AdminData, AdminTabId, ContentSectionId } from './types'

export default function AdminTabContent({
  activeTab,
  activeContentSection,
  data,
}: {
  activeTab: AdminTabId
  activeContentSection: ContentSectionId
  data: AdminData
}) {
  switch (activeTab) {
    case 'conteudo':
      return <ContentTab section={activeContentSection} data={data} />
    case 'times':
      return <TeamsTab data={data} />
    case 'tabela':
      return <StandingsTab data={data} />
    case 'usuarios':
      return <UsersTab data={data} />
    default:
      return <OverviewTab data={data} />
  }
}
