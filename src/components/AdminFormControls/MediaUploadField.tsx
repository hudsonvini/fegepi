'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
} from 'react'
import { FileImage, ImagePlus, RefreshCw, UploadCloud, X } from 'lucide-react'
import { displayMediaUrl } from '@/lib/media-url'
import styles from './AdminFormControls.module.scss'

type Props = {
  name: string
  urlName?: string
  label: string
  description?: string
  defaultUrl?: string | null
  accept?: string
  required?: boolean
  allowVideo?: boolean
  maxSizeMb?: number
}

export default function MediaUploadField({
  name,
  urlName = `${name}Url`,
  label,
  description = 'Arraste uma imagem para cá ou escolha um arquivo.',
  defaultUrl,
  accept = 'image/*,.gif',
  required = false,
  allowVideo = false,
  maxSizeMb = 20,
}: Props) {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(displayMediaUrl(defaultUrl) ?? null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  useEffect(() => () => {
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const validate = (nextFile: File | null) => {
    if (nextFile) {
      const isImage = nextFile.type.startsWith('image/') || nextFile.name.toLowerCase().endsWith('.gif')
      const isVideo = allowVideo && nextFile.type.startsWith('video/')
      if (!isImage && !isVideo) return 'Escolha uma imagem válida' + (allowVideo ? ' ou um vídeo MP4.' : '.')
      if (nextFile.size > maxSizeMb * 1024 * 1024) return `O arquivo deve ter no máximo ${maxSizeMb} MB.`
      return ''
    }
    if (required && !defaultUrl) return 'Selecione um arquivo para continuar.'
    return ''
  }

  const showValidation = (nextFile: File | null) => {
    const message = validate(nextFile)
    fileInputRef.current?.setCustomValidity(message)
    setError(message)
  }

  const selectFile = (nextFile: File | null) => {
    setFile(nextFile)
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : displayMediaUrl(defaultUrl) ?? null)
    showValidation(nextFile)
  }

  const receiveDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    const droppedFile = event.dataTransfer.files[0]
    if (!droppedFile || !fileInputRef.current) return

    const transfer = new DataTransfer()
    transfer.items.add(droppedFile)
    fileInputRef.current.files = transfer.files
    selectFile(droppedFile)
  }

  const removeSelectedFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = ''
    selectFile(null)
  }

  const previewIsVideo = Boolean(
    previewUrl && (
      file?.type.startsWith('video/')
      || /\.(mp4|webm|mov)(\?|$)/i.test(previewUrl)
    ),
  )

  const previewFailed = () => {
    const message = file
      ? 'Não foi possível carregar a prévia. Verifique o arquivo selecionado.'
      : 'A prévia atual não pôde ser carregada. Você ainda pode manter ou substituir a mídia.'
    setError(message)
    fileInputRef.current?.setCustomValidity(file ? message : '')
  }

  return (
    <div className={styles.mediaField}>
      <div className={styles.mediaHeading}>
        <div>
          <span className={styles.label}>{label}{!required && <small>Opcional</small>}</span>
          <p>{description}</p>
        </div>
        {file && (
          <button type="button" className={styles.clearFile} onClick={removeSelectedFile}>
            <X size={14} /> Remover seleção
          </button>
        )}
      </div>

      <label
        htmlFor={inputId}
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${error ? styles.dropzoneError : ''}`}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={receiveDrop}
      >
        <input type="hidden" name={urlName} value={defaultUrl ?? ''} />
        <input
          ref={fileInputRef}
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          required={required && !defaultUrl}
          className={styles.hiddenFile}
          onChange={(event) => selectFile(event.currentTarget.files?.[0] ?? null)}
          onInvalid={() => setError('Selecione um arquivo para continuar.')}
        />

        {previewUrl ? (
          <div className={styles.preview}>
            {previewIsVideo
              ? <video src={previewUrl} muted playsInline onLoadedData={() => showValidation(file)} onError={previewFailed} />
              : <img src={previewUrl} alt="" onLoad={() => showValidation(file)} onError={previewFailed} />}
            <span className={styles.replaceBadge}><RefreshCw size={14} /> Substituir mídia</span>
          </div>
        ) : (
          <div className={styles.dropzoneContent}>
            <span className={styles.uploadIcon}><ImagePlus size={25} /></span>
            <strong>Solte o arquivo aqui</strong>
            <p>ou clique para procurar no computador</p>
            <span className={styles.chooseButton}><UploadCloud size={16} /> Escolher arquivo</span>
            <small>Imagens e GIF de até {maxSizeMb} MB{allowVideo ? ' · MP4 aceito' : ''}</small>
          </div>
        )}
      </label>

      {file && (
        <div className={styles.fileMeta}>
          <FileImage size={16} />
          <span><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></span>
        </div>
      )}

      <p id={`${inputId}-error`} className={error ? styles.error : styles.mediaHelp} aria-live="polite">
        {error || (defaultUrl ? 'A mídia atual será mantida se você não selecionar outro arquivo.' : 'Selecione um arquivo para enviar.')}
      </p>
    </div>
  )
}
