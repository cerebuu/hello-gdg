// Run with Node's runtime --env-file flag; never prints provider configuration.
import { readFileSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'
import { validateDiagnosis } from '../gemini.js'
import { createRoboflowDetector } from '../roboflow.js'
let signal
const detector = createRoboflowDetector({ apiKey: 'not-a-credential', timeoutMs: 200,
  fetchImpl: async (_url, options) => { signal = options.signal; return new Promise(() => {}) },
})
const server = createApp({ detector }).listen(0, '127.0.0.1')
await new Promise(resolve => server.once('listening', resolve))
try {
  const image = readFileSync(process.argv[2] || '/private/tmp/crop-live-verify/banana.png')
  const start = performance.now()
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/diagnose`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: image.toString('base64'), mimeType: 'image/png', language: 'bisaya' }),
  })
  const latencyMs = Math.round(performance.now() - start)
  const body = await response.json()
  assert.equal(response.status, 200)
  validateDiagnosis(body)
  assert.equal(body.secondOpinion, null)
  assert.equal(signal.aborted, true)
  const text = [body.problemNameEnglish, body.problemNameLocal, ...body.actionSteps, body.whenToCallExpert].join(' ')
  const safetyHits = text.match(/\b(roundup|bayer|syngenta|dithane|ridomil|gramoxone|benlate|furadan|confirmed|definitely|certainly)\b|\b\d+(?:\.\d+)?\s*(ml|mg|kg|grams?|liters?|litres?)\b/gi) || []
  const summary = { safetyHits, http: response.status, latencyMs, contract: true, simulatedTimeout: true, secondOpinion: null }
  console.log(JSON.stringify(summary))
  writeFileSync('/private/tmp/crop-live-verify/knowledge-timeout.json', JSON.stringify(summary))
} finally { await new Promise(resolve => server.close(resolve)) }
