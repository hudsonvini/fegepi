import Image from 'next/image'
import { ArrowUpRight, UsersRound } from 'lucide-react'
import styles from './Footer.module.scss'

const footerGroups = [
  {
    title: 'Navegue',
    links: [
      { label: 'Início', href: '#inicio' },
      { label: 'Eventos', href: '#eventos' },
      { label: 'Ranking', href: '#ranking' },
      { label: 'Jogadores', href: '#jogadores' },
      { label: 'Galeria', href: '#galeria' },
    ],
  },
  {
    title: 'Modalidades',
    links: [
      { label: 'League of Legends', href: '#ranking' },
      { label: 'Counter-Strike 2', href: '#ranking' },
      { label: 'Valorant', href: '#ranking' },
      { label: 'EA Sports FC', href: '#ranking' },
      { label: 'Free Fire', href: '#ranking' },
    ],
  },
  {
    title: 'Comunidade',
    links: [
      { label: 'Cadastre seu time', href: '/cadastro' },
      { label: 'Área do jogador', href: '/perfil' },
      { label: 'Todos os jogadores', href: '/jogadores' },
      { label: 'Login', href: '/login' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className={styles.footer} id="contato">
      <div className={styles.ambientGlow} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.topbar}>
        <a className={styles.miniBrand} href="#inicio" aria-label="Voltar ao início">
          <Image src="/images/logoWhite.png" alt="FEGEPI" width={144} height={72} />
        </a>
        <span>Federação de Games e E-Sports do Piauí</span>
        <a className={styles.backToTop} href="#inicio">
          Voltar ao topo <ArrowUpRight aria-hidden="true" size={16} />
        </a>
      </div>

      <div className={styles.main}>
        <div className={styles.statement}>
          <span className={styles.eyebrow}>O Piauí entra em jogo</span>
          <h2>Conectando talentos.<br />Criando campeões.</h2>
          <p>
            Fortalecemos o cenário competitivo, aproximamos equipes e levamos o
            e-sport piauiense cada vez mais longe.
          </p>
          <a className={styles.contactButton} href="/cadastro">
            <UsersRound aria-hidden="true" size={18} />
            Faça parte da FEGEPI
            <ArrowUpRight aria-hidden="true" size={18} />
          </a>
        </div>

        <div className={styles.linksGrid}>
          {footerGroups.map((group) => (
            <nav key={group.title} className={styles.linkGroup} aria-label={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden="true">FEGEPI</div>

      <div className={styles.bottomRow}>
        <p>© {new Date().getFullYear()} FEGEPI. Todos os direitos reservados.</p>
        <div className={styles.legalLinks}>
          <a href="#">Privacidade</a>
          <a href="#">Termos de uso</a>
        </div>
        <a className={styles.socialLink} href="#" aria-label="Instagram da FEGEPI">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
          Instagram
        </a>
      </div>

      <div className={styles.flagLine} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </footer>
  )
}
