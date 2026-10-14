import express from 'express'
import cors from 'cors'
import { diagnoseWithGemini, validateDiagnosis } from './gemini.js'
import { matchKnowledge } from './knowledge.js'
import { startRoboflow } from './roboflow.js'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_BASE64_LENGTH = Math.ceil(MAX_IMAGE_BYTES / 3) * 4
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function parseDiagnosisRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'A JSON object is required' }
  }

  if (typeof body.imageBase64 !== 'string' || body.imageBase64.length === 0) {
    return { error: 'imageBase64 must be a non-empty base64 string' }
  }

  if (body.imageBase64.length > MAX_BASE64_LENGTH) {
    return { error: 'Image must be 5 MB or smaller' }
  }

  if (
    body.imageBase64.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(
      body.imageBase64,
    )
  ) {
    return { error: 'imageBase64 must contain valid base64 without a data URL prefix' }
  }

  const imageBytes = Buffer.from(body.imageBase64, 'base64')
  if (
    imageBytes.length === 0 ||
    imageBytes.length > MAX_IMAGE_BYTES ||
    imageBytes.toString('base64') !== body.imageBase64
  ) {
    return { error: 'Image must contain valid base64 data and be 5 MB or smaller' }
  }

  if (!ALLOWED_MIME_TYPES.has(body.mimeType)) {
    return { error: 'mimeType must be image/jpeg, image/png, or image/webp' }
  }

  if (!['bisaya', 'filipino'].includes(body.language)) {
    return { error: 'language must be bisaya or filipino' }
  }

  return { imageBytes, mimeType: body.mimeType, language: body.language }
}

export function createApp({ diagnose = diagnoseWithGemini, detector = startRoboflow, logger = console } = {}) {
  const app = express()

  app.use(cors({ origin: 'http://localhost:5173' }))
  app.use(express.json({ limit: '8mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.post('/api/diagnose', async (req, res) => {
    const parsed = parseDiagnosisRequest(req.body)
    if (parsed.error) return res.status(400).json({ error: parsed.error })

    // The request has no crop hint: start both checks, expose detector output only for banana.
    // Read an already-ready opinion when Gemini finishes; never wait for the optional check.
    let opinionJob
    try { opinionJob = detector(parsed) } catch { opinionJob = { result: null, cancel() {} } }
    try {
      const result = await diagnose(parsed)
      let knowledgeMatch = null
      try { knowledgeMatch = matchKnowledge(result) } catch { /* Optional lookup is best effort. */ }
      const secondOpinion = result.crop === 'banana' && !result.notAPlant ? opinionJob?.result || null : null
      const differs = secondOpinion && knowledgeMatch && knowledgeMatch.id !== `banana-${secondOpinion.label}`
      const note = differs ? (parsed.language === 'filipino' ?
        'Magkaiba ang dalawang pagsusuri. Humingi ng payo sa lokal na opisyal ng agrikultura.' :
        'Lahi ang duha ka pagsusi. Pangayo og tambag sa lokal nga opisyal sa agrikultura.') : null
      let enriched = { ...result, whenToCallExpert: note ? `${result.whenToCallExpert} ${note}` : result.whenToCallExpert, knowledgeMatch, secondOpinion, note }
      try { enriched = validateDiagnosis(enriched) }
      catch { enriched = validateDiagnosis({ ...result, knowledgeMatch: null, secondOpinion: null, note: null }) }
      return res.status(200).json(enriched)
    } catch (error) {
      logger.error('Diagnosis request failed')
      return res.status(500).json({ error: error.safeMessage || 'Diagnosis failed. Please try again or contact your agriculture office.' })
    } finally {
      try { opinionJob?.cancel?.() } catch { /* Optional cancellation must not affect the response. */ }
    }
  })

  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error)

    if (error?.type === 'entity.too.large') {
      return res.status(400).json({ error: 'Request body is too large; images must be 5 MB or smaller' })
    }

    if (error?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Request body must be valid JSON' })
    }

    logger.error('Request processing failed')
    return res.status(500).json({ error: 'Request failed' })
  })

  return app
}
