'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'
import { defaultProfileAvatars, getProfileGender, type ProfileGender } from '@/lib/profile'
import styles from './page.module.scss'

type Props = {
  initialGender: string | null
  customAvatarUrl: string | null
}

export function ProfileAvatarPicker({ initialGender, customAvatarUrl }: Props) {
  const [gender, setGender] = useState<ProfileGender>(getProfileGender(initialGender))
  const preview = customAvatarUrl || defaultProfileAvatars[gender].src

  return (
    <section className={styles.avatarSection} aria-labelledby="avatar-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>Sua identidade</p>
          <h2 id="avatar-title">Escolha seu avatar padrão</h2>
        </div>
        <img className={styles.avatarPreview} src={preview} alt="Prévia do avatar do perfil" />
      </div>
      <div className={styles.avatarChoices} role="radiogroup" aria-label="Gênero e avatar padrão">
        {(Object.entries(defaultProfileAvatars) as [ProfileGender, (typeof defaultProfileAvatars)[ProfileGender]][]).map(([value, avatar]) => (
          <label className={`${styles.avatarChoice} ${gender === value ? styles.avatarChoiceSelected : ''}`} key={value}>
            <input type="radio" name="gender" value={value} checked={gender === value} onChange={() => setGender(value)} />
            <img src={avatar.src} alt={avatar.description} />
            <span>{avatar.label}</span>
            {gender === value && <i aria-hidden="true"><Check size={14} strokeWidth={3} /></i>}
          </label>
        ))}
      </div>
      <p className={styles.help}>O avatar acompanha sua escolha. Se preferir, você pode informar uma foto pessoal abaixo.</p>
    </section>
  )
}
