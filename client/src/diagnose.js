function validResult(result) {
  const text = value => typeof value === 'string' && value.trim().length > 0
  return result && ['banana', 'cacao', 'unknown'].includes(result.crop) &&
    ['High', 'Medium', 'Low'].includes(result.confidence) &&
    ['Mild', 'Moderate', 'Severe', 'Unknown'].includes(result.severity) &&
    text(result.problemNameEnglish) && text(result.problemNameLocal) && text(result.whenToCallExpert) &&
    Array.isArray(result.actionSteps) && result.actionSteps.length === 3 && result.actionSteps.every(text) &&
    typeof result.notAPlant === 'boolean'
}

export async function requestDiagnosis(photo, language, signal) {
  const response = await fetch('/api/diagnose', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: photo.imageBase64, mimeType: photo.mimeType, language }),
  })
  let body
  try { body = await response.json() } catch { throw new Error('The server is unavailable. Please try again.') }
  if (!response.ok) throw new Error(body.error || 'We could not check this photo. Please try again.')
  if (!validResult(body)) throw new Error('The response was incomplete. Please ask your agriculture office for advice.')
  return body
}
