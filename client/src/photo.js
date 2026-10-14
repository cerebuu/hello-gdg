export async function preparePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Please choose a JPEG, PNG, or WebP photo. Convert HEIC photos to JPEG first.')
  }
  if (file.size > 25 * 1024 * 1024) throw new Error('Please choose a photo smaller than 25 MB.')
  const bitmap = await createImageBitmap(file)
  try {
    const scale = 1280 / Math.max(bitmap.width, bitmap.height)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const preview = canvas.toDataURL('image/jpeg', 0.85)
    const imageBase64 = preview.split(',')[1]
    if (Math.floor(imageBase64.length * 3 / 4) > 5 * 1024 * 1024) {
      throw new Error('This photo is still too large. Please choose a smaller photo.')
    }
    return { preview, imageBase64, mimeType: 'image/jpeg', name: file.name }
  } finally { bitmap.close() }
}
