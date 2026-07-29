import type { ReactNode } from 'react'
import Link from 'next/link'
import { BarChart3, ChevronRight, Home, ShieldCheck } from 'lucide-react'
import type { CurrentUser } from '@/lib/auth'
import styles from '@/app/admin/page.module.scss'
import { adminHref, adminTabs, contentHref, contentSections } from './navigation'
import type { AdminTabId, ContentSectionId } from './types'

export default function AdminShell({
  user,
  avatar,
  activeTab,
  activeContentSection,
  children,
}: {
  user: CurrentUser
  avatar: string
  activeTab: AdminTabId
  activeContentSection: ContentSectionId
  children: ReactNode
}) {
  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/">
          <img src="/images/logo.png" alt="FEGEPI" />
        </Link>
        <div className={styles.sidebarLabel}>Administração</div>
        <nav className={styles.sideNav} aria-label="Seções administrativas">
          {adminTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <div key={tab.id}>
                <Link className={activeTab === tab.id ? styles.activeNav : ''} href={adminHref(tab.id)}>
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </Link>
                {tab.id === 'conteudo' && activeTab === 'conteudo' && (
                  <div className={styles.contentSubnav}>
                    {contentSections.map((section) => {
                      const SectionIcon = section.icon
                      return (
                        <Link
                          key={section.id}
                          href={contentHref(section.id)}
                          className={activeContentSection === section.id ? styles.activeSubnav : ''}
                        >
                          <SectionIcon size={15} />
                          {section.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className={styles.sideDivider} />
        <div className={styles.sidebarLabel}>Acesso rápido</div>
        <nav className={styles.sideNav}>
          <Link href="/"><Home size={18} /><span>Ver site</span></Link>
          <Link href="/perfil"><ShieldCheck size={18} /><span>Meu perfil</span></Link>
        </nav>

        <div className={styles.accountPreview}>
          <img src={avatar} alt="" />
          <div><strong>{user.fullName}</strong><span>Administrador</span></div>
          <Link href="/perfil" aria-label="Abrir meu perfil"><ChevronRight size={18} /></Link>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>
            <BarChart3 size={18} />
            <span>Dashboard</span>
            <ChevronRight size={15} />
            <strong>{adminTabs.find((tab) => tab.id === activeTab)?.label}</strong>
          </div>
          <div className={styles.topActions}>
            <Link href="/" className={styles.topLink}><Home size={16} /> Home</Link>
            <Link href="/perfil" className={styles.profileLink}>
              <img src={avatar} alt="" />
              <span>Minha conta</span>
            </Link>
          </div>
        </header>
        {children}
      </section>
    </main>
  )
}
