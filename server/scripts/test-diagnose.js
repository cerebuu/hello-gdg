// No .env loading or live model requests. Optionally check a running TEST_BASE_URL.
import assert from 'node:assert/strict'
import { createApp } from '../app.js'
const server = process.env.TEST_BASE_URL ? null : createApp().listen(0, '127.0.0.1')
if (server) await new Promise(resolve => server.once('listening', resolve))
try {
  const base = process.env.TEST_BASE_URL || `http://127.0.0.1:${server.address().port}`
  const response = await fetch(`${base}/api/diagnose`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: '', mimeType: 'image/jpeg', language: 'bisaya' }),
  })
  assert.equal(response.status, 400)
  assert.equal(typeof (await response.json()).error, 'string')
  console.log('PASS: invalid diagnosis request returns HTTP 400 JSON.')
} finally { if (server) await new Promise(resolve => server.close(resolve)) }
