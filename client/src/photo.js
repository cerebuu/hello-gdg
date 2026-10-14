export async function preparePhoto(file, language = 'bisaya') {
  const messages = language === 'filipino'
    ? { type: 'Pumili ng JPEG, PNG, o WebP na larawan.', size: 'Pumili ng larawang 5 MB o mas maliit.', large: 'Masyado pa ring malaki ang larawan. Pumili ng mas maliit na larawan.' }
    : language === 'english'
      ? { type: 'Please choose a JPEG, PNG, or WebP image.', size: 'Please choose an image 5 MB or smaller.', large: 'This image is still too large. Please choose a smaller image.' }
    : { type: 'Pilia ang JPEG, PNG, o WebP nga litrato.', size: 'Pilia ang litrato nga 5 MB o mas gamay.', large: 'Dako pa gihapon ang litrato. Pilia ang mas gamay nga litrato.' }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error(messages.type)
  }
  if (file.size > 5 * 1024 * 1024) throw new Error(messages.size)
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
      throw new Error(messages.large)
    }
    return { preview, imageBase64, mimeType: 'image/jpeg', name: file.name }
  } finally { bitmap.close() }
}
