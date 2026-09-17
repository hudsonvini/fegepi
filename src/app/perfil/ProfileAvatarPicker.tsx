'use client'

import { Check, UploadCloud } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { avatarFileError } from '@/lib/avatar-rules'
import { defaultProfileAvatars, getProfileGender, type ProfileGender } from '@/lib/profile'
import styles from './page.module.scss'

type Props = {
  initialGender: string | null
  customAvatarUrl: string | null
}

export function ProfileAvatarPicker({ initialGender, customAvatarUrl }: Props) {
  const [gender, setGender] = useState<ProfileGender>(getProfileGender(initialGender))
  const [mode, setMode] = useState<'keep' | 'upload' | 'default'>('keep')
  const [tab, setTab] = useState<'photo' | 'default'>('photo')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])
  const preview = file ? previewUrl : mode === 'default' ? defaultProfileAvatars[gender].src : customAvatarUrl || defaultProfileAvatars[gender].src

  function clearSelection() {
    setFile(null)
    setPreviewUrl('')
    setError('')
    if (inputRef.current) { inputRef.current.value = ''; inputRef.current.setCustomValidity('') }
  }

  function selectFile(files: FileList | null) {
    const next = files?.[0]
    const issue = files && files.length > 1 ? 'Selecione apenas uma foto.' : next ? avatarFileError(next) : null
    if (issue) {
      clearSelection()
      setMode('keep')
      setError(issue)
      inputRef.current?.setCustomValidity(issue)
      return
    }
    if (!next) return
    const transfer = new DataTransfer()
    transfer.items.add(next)
    if (inputRef.current) { inputRef.current.files = transfer.files; inputRef.current.setCustomValidity('') }
    setFile(next)
    setPreviewUrl(URL.createObjectURL(next))
    setError('')
    setMode('upload')
  }

  return (
    <section className={styles.avatarSection} aria-labelledby="avatar-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>Sua identidade</p>
          <h2 id="avatar-title">Foto de perfil</h2>
        </div>
        <img className={styles.avatarPreview} src={preview} alt="Prévia do avatar do perfil" />
      </div>
      <input type="hidden" name="avatarMode" value={mode} />
      <div className={styles.photoTabs} role="group" aria-label="Escolha da foto">
        <button type="button" aria-pressed={tab === 'photo'} onClick={() => setTab('photo')}>Minha foto</button>
        <button type="button" aria-pressed={tab === 'default'} onClick={() => { clearSelection(); setMode('default'); setTab('default') }}>Avatar padrão</button>
      </div>
      <div hidden={tab !== 'photo'}>
        <label className={`${styles.photoDropzone} ${dragging ? styles.photoDragging : ''}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files) }}>
          <UploadCloud size={30} aria-hidden="true" />
          <strong>Arraste sua foto aqui ou selecione uma imagem</strong>
          <span>JPG, PNG ou WebP · Até 3 MB</span>
          <input ref={inputRef} name="avatarFile" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Selecionar foto de perfil" aria-describedby="photo-help photo-error" onChange={(event) => selectFile(event.target.files)} />
        </label>
        <p id="photo-help" className={styles.help}>Sua foto será ajustada e comprimida automaticamente ao salvar o perfil.</p>
        {file && <p className={styles.help}>{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB · Pronta para salvar</p>}
        {file && <button type="button" className={styles.photoCancel} onClick={() => { clearSelection(); setMode('keep') }}>Cancelar nova foto</button>}
        <p id="photo-error" className={styles.photoError} role="alert">{error}</p>
      </div>
      <div hidden={tab !== 'default'}>
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
      <p className={styles.help}>Ao salvar, o avatar escolhido substitui sua foto pessoal.</p>
      </div>
    </section>
  )
}
