import { ShieldCheck, Users, UsersRound } from 'lucide-react'
import { updateUserManagementAction } from '@/app/admin/actions'
import styles from '@/app/admin/page.module.scss'
import AdminSubmitButton from '@/components/AdminSubmitButton/AdminSubmitButton'
import { getProfileAvatar } from '@/lib/profile'
import Link from 'next/link'
import { SectionTitle } from '../shared'
import type { AdminData } from '../types'

export default function UsersTab({ data }: { data: AdminData }) {
  const adminCount = data.profiles.filter((profile) => profile.role === 'admin').length
  const linkedCount = new Set(data.memberships.filter((item) => !item.ended_at).map((item) => item.profile_id)).size

  return (
    <>
      <SectionTitle
        eyebrow="Acesso e comunidade"
        title="Usuários e permissões"
        description="Consulte os perfis e defina quem pode administrar a FEGEPI. Os elencos são gerenciados dentro de cada time, por jogo."
      />

      <div className={styles.userStats}>
        <span><Users size={18} /><strong>{data.profiles.length}</strong> membros</span>
        <span><ShieldCheck size={18} /><strong>{adminCount}</strong> administradores</span>
        <span><UsersRound size={18} /><strong>{linkedCount}</strong> vinculados a times</span>
      </div>

      <div className={styles.userCards}>
        {data.profiles.map((profile) => {
          const profileAvatar = getProfileAvatar(profile.avatar_url, profile.gender)
          return (
            <article className={styles.userCard} key={profile.id}>
              <div className={styles.userIdentity}>
                <img src={profileAvatar} alt="" />
                <div>
                  <h2>{profile.full_name || 'Membro sem nome'}</h2>
                  <p>{profile.email || 'E-mail disponível após a migração'}</p>
                  <span>{profile.favorite_game || 'Jogador FEGEPI'}</span>
                </div>
              </div>
              <form action={updateUserManagementAction} className={styles.userForm}>
                <input type="hidden" name="userId" value={profile.id} />
                <div className={styles.userMemberships}>
                  {data.memberships.filter((item) => item.profile_id === profile.id && !item.ended_at).map((item) => (
                    <span key={item.id}>{item.games?.short_name}: <strong>{item.teams?.name}</strong></span>
                  ))}
                  {!data.memberships.some((item) => item.profile_id === profile.id && !item.ended_at) && <span>Sem elenco atual</span>}
                  {profile.public_profile && <Link href={`/jogadores/${profile.id}`}>Ver perfil público</Link>}
                </div>
                <label>
                  Nível de permissão
                  <select name="role" defaultValue={profile.role}>
                    <option value="member">Membro</option>
                    <option value="admin">Administrador</option>
                  </select>
                </label>
                <AdminSubmitButton className={styles.primaryButton} pendingLabel="Salvando acesso...">
                  Salvar acesso
                </AdminSubmitButton>
              </form>
            </article>
          )
        })}
      </div>
    </>
  )
}
