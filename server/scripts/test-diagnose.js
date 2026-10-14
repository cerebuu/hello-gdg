// Safe smoke check: no .env loading and no live model requests.
import assert from 'node:assert/strict'
const base = process.env.TEST_BASE_URL || 'http://localhost:3001'
const response = await fetch(`${base}/api/diagnose`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ imageBase64: '', mimeType: 'image/jpeg', language: 'bisaya' }),
})
assert.equal(response.status, 400)
assert.equal(typeof (await response.json()).error, 'string')
console.log('PASS: invalid diagnosis request returns HTTP 400 JSON.')
