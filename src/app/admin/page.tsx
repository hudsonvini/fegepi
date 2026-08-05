import { redirect } from 'next/navigation'
import AdminShell from '@/components/AdminDashboard/AdminShell'
import AdminTabContent from '@/components/AdminDashboard/AdminTabContent'
import {
  isAdminTab,
  isContentSection,
} from '@/components/AdminDashboard/navigation'
import { getAdminData } from '@/lib/admin-data'
import { getCurrentUser } from '@/lib/auth'
import { getProfileAvatar } from '@/lib/profile'
import styles from './page.module.scss'

type AdminSearchParams = {
  aba?: string
  secao?: string
  temporada?: string
  jogo?: string
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'admin') redirect('/perfil')

  const params = await searchParams
  const activeTab = isAdminTab(params.aba) ? params.aba : 'visao-geral'
  const activeContentSection = isContentSection(params.secao) ? params.secao : 'banners'
  const data = await getAdminData(params.temporada, activeTab === 'times' && !params.jogo ? 'all' : params.jogo)
  const avatar = getProfileAvatar(user.avatarUrl, user.gender)

  return (
    <AdminShell
      user={user}
      avatar={avatar}
      activeTab={activeTab}
      activeContentSection={activeContentSection}
    >
      <div className={styles.mainContent}>
        <AdminTabContent
          activeTab={activeTab}
          activeContentSection={activeContentSection}
          data={data}
        />
      </div>
    </AdminShell>
  )
}
