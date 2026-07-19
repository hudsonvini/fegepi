export const profileGenders = ['masculino', 'feminino', 'indiferente'] as const

export type ProfileGender = (typeof profileGenders)[number]

export const defaultProfileAvatars: Record<ProfileGender, { src: string; label: string; description: string }> = {
  masculino: {
    src: '/images/profile-avatars/default-male.png',
    label: 'Masculino',
    description: 'Avatar padrão masculino',
  },
  feminino: {
    src: '/images/profile-avatars/default-female.png',
    label: 'Feminino',
    description: 'Avatar padrão feminino',
  },
  indiferente: {
    src: '/images/profile-avatars/default-neutral.png',
    label: 'Indiferente',
    description: 'Avatar padrão neutro',
  },
}

export function getProfileGender(value: string | null | undefined): ProfileGender {
  return profileGenders.includes(value as ProfileGender) ? (value as ProfileGender) : 'indiferente'
}

export function getProfileAvatar(avatarUrl: string | null | undefined, gender: string | null | undefined) {
  return avatarUrl || defaultProfileAvatars[getProfileGender(gender)].src
}
