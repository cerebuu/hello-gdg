import express from 'express'
import cors from 'cors'
import { diagnoseWithGemini, validateDiagnosis } from './gemini.js'
import { runDetectors } from './roboflow.js'
import { combineDiagnosis } from './combine.js'
import { message } from './messages.js'
import { detectCrop } from './crop-gate.js'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_BASE64_LENGTH = Math.ceil(MAX_IMAGE_BYTES / 3) * 4
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function parseDiagnosisRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'object' }
  }

  if (typeof body.imageBase64 !== 'string' || body.imageBase64.length === 0) {
    return { error: 'image' }
  }

  if (body.imageBase64.length > MAX_BASE64_LENGTH) {
    return { error: 'size' }
  }

  if (
    body.imageBase64.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(
      body.imageBase64,
    )
  ) {
    return { error: 'base64' }
  }

  const imageBytes = Buffer.from(body.imageBase64, 'base64')
  if (
    imageBytes.length === 0 ||
    imageBytes.length > MAX_IMAGE_BYTES ||
    imageBytes.toString('base64') !== body.imageBase64
  ) {
    return { error: 'size' }
  }

  if (!ALLOWED_MIME_TYPES.has(body.mimeType)) {
    return { error: 'mime' }
  }

  if (!['bisaya', 'filipino', 'english'].includes(body.language)) {
    return { error: 'language' }
  }

  return { imageBytes, mimeType: body.mimeType, language: body.language }
}

export function createApp({ diagnose = diagnoseWithGemini, detector = runDetectors, classifyCrop = detectCrop, logger = console } = {}) {
  const app = express()

  app.use(cors({ origin: 'http://localhost:5173' }))
  app.use(express.json({ limit: '8mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.post('/api/diagnose', async (req, res) => {
    const parsed = parseDiagnosisRequest(req.body)
    if (parsed.error) return res.status(400).json({ error: message(parsed.error, req.body?.language) })

    const started = performance.now()
    let detectorTimer
    try {
      let cropHint = 'unknown'
      try { cropHint = await classifyCrop(parsed) } catch { /* Optional crop gate failed. */ }
      const remaining = Math.max(20, 4950 - (performance.now() - started))
      const peers = ['banana', 'cacao'].includes(cropHint) ? Promise.race([
        Promise.resolve().then(() => detector(parsed, cropHint, Math.min(3000, remaining))).catch(() => []),
        new Promise(resolve => { detectorTimer = setTimeout(() => resolve([]), Math.min(3000, remaining)) }),
      ]) : Promise.resolve([])
      const result = await diagnose({ ...parsed, deadlineMs: remaining })
      const opinions = await peers
      let enriched
      try { enriched = validateDiagnosis(combineDiagnosis(result, Array.isArray(opinions) ? opinions : [], parsed.language)) }
      catch { enriched = validateDiagnosis(combineDiagnosis(result, [], parsed.language)) }
      return res.status(200).json(enriched)
    } catch (error) {
      logger.error('Diagnosis request failed')
      return res.status(500).json({ error: error.safeMessage || message('failed', parsed.language) })
    } finally { clearTimeout(detectorTimer) }
  })

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)

    if (error?.type === 'entity.too.large') {
      return res.status(400).json({ error: message('size', req.body?.language) })
    }

    if (error?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: message('json', req.body?.language) })
    }

    logger.error('Request processing failed')
    return res.status(500).json({ error: message('failed', req.body?.language) })
  })

  return app
}
