import express from 'express'
import cors from 'cors'
import { diagnoseWithGemini } from './gemini.js'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
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
    return { error: 'Image must be 10 MB or smaller' }
  }

  if (
    body.imageBase64.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
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
    return { error: 'Image must contain valid base64 data and be 10 MB or smaller' }
  }

  if (!ALLOWED_MIME_TYPES.has(body.mimeType)) {
    return { error: 'mimeType must be image/jpeg, image/png, or image/webp' }
  }

  if (!['bisaya', 'filipino'].includes(body.language)) {
    return { error: 'language must be bisaya or filipino' }
  }

  return { imageBytes, mimeType: body.mimeType, language: body.language }
}

export function createApp({ diagnose = diagnoseWithGemini, logger = console } = {}) {
  const app = express()

  app.use(cors({ origin: 'http://localhost:5173' }))
  app.use(express.json({ limit: '14mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.post('/api/diagnose', async (req, res) => {
    const parsed = parseDiagnosisRequest(req.body)
    if (parsed.error) return res.status(400).json({ error: parsed.error })

    try {
      const result = await diagnose(parsed)
      return res.status(200).json(result)
    } catch (error) {
      logger.error('Diagnosis request failed:', error)
      return res.status(500).json({ error: 'Diagnosis failed' })
    }
  })

  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error)

    if (error?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request body is too large; images must be 10 MB or smaller' })
    }

    if (error?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Request body must be valid JSON' })
    }

    logger.error('Request processing failed:', error)
    return res.status(500).json({ error: 'Request failed' })
  })

  return app
}
