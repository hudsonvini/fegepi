export const MAX_AVATAR_BYTES = 3 * 1024 * 1024
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function avatarFileError(file: { size: number; type: string }) {
  if (!file.size) return 'Selecione uma imagem válida.'
  if (file.size > MAX_AVATAR_BYTES) return 'A imagem deve ter no máximo 3 MB antes da compressão.'
  if (!AVATAR_TYPES.includes(file.type)) return 'Use uma imagem JPG, PNG ou WebP.'
  return null
}
