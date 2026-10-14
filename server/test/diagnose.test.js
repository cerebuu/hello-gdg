import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from '../app.js'
import { createGeminiDiagnoser } from '../gemini.js'

const validResult = {
  crop: 'banana',
  problemNameEnglish: 'Possible leaf issue',
  problemNameLocal: 'Posibleng problema sa dahon',
  confidence: 'Low',
  severity: 'Unknown',
  actionSteps: ['Keep a clear photo', 'Record visible changes', 'Ask a local technician'],
  whenToCallExpert: 'Consult a local agricultural technician if symptoms continue.',
  notAPlant: false,
}

async function withServer(app, callback) {
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))

  try {
    await callback(`http://127.0.0.1:${server.address().port}`)
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
}

test('POST /api/diagnose validates and forwards the image request', async () => {
  let received
  const app = createApp({
    diagnose: async (input) => {
      received = input
      return validResult
    },
  })

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/diagnose`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', connection: 'close' },
      body: JSON.stringify({
        imageBase64: Buffer.from('test image').toString('base64'),
        mimeType: 'image/jpeg',
        language: 'bisaya',
      }),
    })

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), validResult)
    assert.equal(received.imageBytes.toString(), 'test image')
    assert.equal(received.mimeType, 'image/jpeg')
    assert.equal(received.language, 'bisaya')
  })
})

test('POST /api/diagnose rejects invalid fields before invoking Gemini', async () => {
  let calls = 0
  const app = createApp({
    diagnose: async () => {
      calls += 1
      return validResult
    },
  })

  await withServer(app, async (baseUrl) => {
    const invalidRequests = [
      { imageBase64: 'not base64', mimeType: 'image/jpeg', language: 'bisaya' },
      { imageBase64: 'dGVzdA==', mimeType: 'image/gif', language: 'bisaya' },
      { imageBase64: 'dGVzdA==', mimeType: 'image/jpeg', language: 'english' },
    ]

    for (const body of invalidRequests) {
      const response = await fetch(`${baseUrl}/api/diagnose`, {
        method: 'POST',
          headers: { 'content-type': 'application/json', connection: 'close' },
        body: JSON.stringify(body),
      })
      assert.equal(response.status, 400)
      assert.equal(typeof (await response.json()).error, 'string')
    }
    assert.equal(calls, 0)
  })
})

test('POST /api/diagnose reports provider failures', async () => {
  const errors = []
  const app = createApp({
    diagnose: async () => {
      throw new Error('provider detail')
    },
    logger: { error: (...args) => errors.push(args) },
  })

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/diagnose`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', connection: 'close' },
      body: JSON.stringify({
        imageBase64: 'dGVzdA==',
        mimeType: 'image/png',
        language: 'filipino',
      }),
    })

    assert.equal(response.status, 500)
    assert.deepEqual(await response.json(), { error: 'Diagnosis failed. Please try again or contact your agriculture office.' })
    assert.deepEqual(errors[0], ['Diagnosis request failed'])
  })
})

test('GET /api/health remains available', async () => {
  await withServer(createApp(), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { connection: 'close' },
    })
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { status: 'ok' })
  })
})

test('Gemini service requests structured localized output and validates it', async () => {
  let request
  const diagnose = createGeminiDiagnoser({
    client: {
      models: {
        generateContent: async (input) => {
          request = input
          return { text: JSON.stringify(validResult) }
        },
      },
    },
    model: 'test-model',
  })

  const result = await diagnose({
    imageBytes: Buffer.from('image'),
    mimeType: 'image/webp',
    language: 'filipino',
  })

  assert.deepEqual(result, validResult)
  assert.equal(request.model, 'test-model')
  assert.equal(request.config.responseMimeType, 'application/json')
  assert.equal(request.contents[0].parts[0].text.includes('Filipino'), true)
  assert.equal(request.contents[0].parts[1].inlineData.data, Buffer.from('image').toString('base64'))
})

test('Gemini service rejects invalid structured output and missing credentials', async () => {
  const malformedDiagnoser = createGeminiDiagnoser({
    model: 'test-model',
    client: {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({ ...validResult, actionSteps: ['only one'] }),
        }),
      },
    },
  })
  await assert.rejects(
    malformedDiagnoser({ imageBytes: Buffer.from('image'), mimeType: 'image/png', language: 'bisaya' }),
    /violates the API contract/,
  )

  const unconfiguredDiagnoser = createGeminiDiagnoser({ apiKey: '' })
  await assert.rejects(
    unconfiguredDiagnoser({ imageBytes: Buffer.from('image'), mimeType: 'image/png', language: 'bisaya' }),
    /GEMINI_API_KEY is not configured/,
  )
})
