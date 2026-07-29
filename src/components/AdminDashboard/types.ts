export type AdminTabId = 'visao-geral' | 'conteudo' | 'times' | 'tabela' | 'usuarios'
export type ContentSectionId = 'banners' | 'jogos' | 'eventos' | 'galeria'

export type HeroSlide = {
  id: string
  image_url: string
  alt_text: string
  link_url: string | null
  active: boolean
  display_order: number
}

export type Game = {
  id: string
  name: string
  short_name: string
  theme: string
  image_url: string
  active: boolean
  display_order: number
}

export type Team = {
  id: string
  name: string
  city: string
  crest_url: string | null
  initials: string
}

export type TeamGame = {
  team_id: string
  game_id: string
  active: boolean
  created_at: string
}

export type MembershipRole = 'player' | 'captain' | 'coach' | 'reserve'

export type PlayerTeamMembership = {
  id: string
  profile_id: string
  team_id: string
  game_id: string
  role: MembershipRole
  started_at: string
  ended_at: string | null
  created_at: string
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'gender' | 'favorite_game' | 'player_tag'> | null
  teams: Team | null
  games: Pick<Game, 'id' | 'name' | 'short_name' | 'image_url'> | null
}

export type Season = {
  id: string
  label: string
  is_current: boolean
  game_id: string
  games: { name: string } | { name: string }[] | null
}

export type RankingEntry = {
  id: string
  season_id: string
  team_id: string
  points: number
  wins: number
  draws: number
  losses: number
  recent_form?: Array<'W' | 'D' | 'L'> | null
  previous_position: number
  teams: Team | null
}

export type Event = {
  id: string
  title: string
  starts_at: string
  ends_at: string | null
  subtitle: string | null
  status_label: string
  status_tone: string
  active: boolean
  image_url: string
  featured_media_url: string | null
  registration_url: string | null
  cta_label: string
  display_order: number
}

export type GalleryPhoto = {
  id: string
  alt_text: string
  active: boolean
  image_url: string
  download_url: string | null
  display_order: number
}

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  team: string | null
  team_id: string | null
  role: 'admin' | 'member'
  gender: string | null
  whatsapp: string | null
  address: string | null
  favorite_game: string | null
  player_tag: string | null
  bio: string | null
  public_profile: boolean
  created_at: string | null
}

export type AdminData = {
  heroSlides: HeroSlide[]
  games: Game[]
  seasons: Season[]
  teams: Team[]
  entries: RankingEntry[]
  events: Event[]
  photos: GalleryPhoto[]
  profiles: Profile[]
  teamGames: TeamGame[]
  memberships: PlayerTeamMembership[]
  selectedGame?: Game
  selectedSeason?: Season
  seasonEntries: RankingEntry[]
}
