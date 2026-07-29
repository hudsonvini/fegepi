import type { ReactNode } from 'react'
import styles from './AdminEmptyState.module.scss'

type Props = {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export default function AdminEmptyState({ icon, title, description, action }: Props) {
  return <div className={styles.empty}><span className={styles.icon}>{icon}</span><h2>{title}</h2><p>{description}</p>{action && <div className={styles.action}>{action}</div>}</div>
}
