import { avatarFileError } from './avatar-rules'

export async function compressAvatar(file: File): Promise<File> {
  const error = avatarFileError(file)
  if (error) throw new Error(error)
  const input = Buffer.from(await file.arrayBuffer())
  let sharp: typeof import('sharp').default
  try {
    // Load the native codec only when uploading, never while rendering /perfil.
    sharp = (await import('sharp')).default
  } catch {
    console.error('[avatar-image]', { code: 'image_processor_unavailable' })
    throw new Error('O processamento de fotos está temporariamente indisponível. Tente novamente mais tarde.')
  }
  try {
    const pipeline = sharp(input, { limitInputPixels: 25_000_000, failOn: 'warning' })
    const metadata = await pipeline.metadata()
    if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? '') || (metadata.pages ?? 1) > 1) {
      throw new Error('unsupported')
    }
    // Corrige orientação e remove metadados (incluindo EXIF/GPS) ao recodificar.
    for (const size of [768, 512, 384]) {
      const output = await pipeline.clone().rotate().resize(size, size, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 }).toBuffer()
      if (output.length <= 256 * 1024) {
        return new File([new Uint8Array(output)], 'avatar.webp', { type: 'image/webp' })
      }
    }
  } catch {
    throw new Error('Não foi possível processar a foto. Use JPG, PNG ou WebP estático, com até 25 megapixels.')
  }
  throw new Error('Não foi possível comprimir essa foto. Escolha outra imagem.')
}
