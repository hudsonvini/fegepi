import Link from 'next/link'
import { Search, Shield, UsersRound } from 'lucide-react'
import ManagedNavbar from '@/components/ManagedNavbar/ManagedNavbar'
import { getCurrentUser } from '@/lib/auth'
import { getPublicPlayers } from '@/lib/players'
import { getProfileAvatar } from '@/lib/profile'
import styles from './page.module.scss'

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>
}) {
  const params = await searchParams
  const [user, players] = await Promise.all([getCurrentUser(), getPublicPlayers(params.busca)])

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <ManagedNavbar user={user} />
        <header className={styles.hero}>
          <span><UsersRound size={16} /> Comunidade FEGEPI</span>
          <h1>Jogadores</h1>
          <p>Conheça os competidores, seus jogos, times atuais e toda a trajetória dentro dos elencos.</p>
          <form className={styles.search}>
            <Search size={18} />
            <input name="busca" defaultValue={params.busca ?? ''} placeholder="Buscar por nome ou nick..." />
            <button>Buscar</button>
          </form>
        </header>

        <section className={styles.grid}>
          {players.map((player) => (
            <Link href={`/jogadores/${player.id}`} className={styles.card} key={player.id}>
              <img src={getProfileAvatar(player.avatar_url, player.gender)} alt="" />
              <div>
                <span>{player.player_tag ? `@${player.player_tag}` : 'Jogador FEGEPI'}</span>
                <h2>{player.full_name || 'Jogador'}</h2>
                <p>{player.favorite_game || 'Competidor da comunidade'}</p>
              </div>
              <Shield size={18} />
            </Link>
          ))}
          {!players.length && <div className={styles.empty}>Nenhum jogador encontrado.</div>}
        </section>
      </div>
    </main>
  )
}
