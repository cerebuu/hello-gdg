const endpoint = 'https://serverless.roboflow.com/banana-leaf-disease-qesr2-m44h9/1'
const labels = new Set(['healthy', 'sigatoka', 'cordana', 'pestalotiopsis'])

export function createRoboflowDetector({ apiKey = process.env.ROBOFLOW_API_KEY, fetchImpl = fetch, timeoutMs = 3000 } = {}) {
  return function start({ imageBytes }) {
    const controller = new AbortController()
    let timer, finishDeadline
    const state = { result: null, cancel: () => { controller.abort(); clearTimeout(timer); finishDeadline?.(null) } }
    if (!apiKey?.trim()) return state
    const deadline = new Promise(resolve => {
      finishDeadline = resolve
      timer = setTimeout(() => { resolve(null); controller.abort() }, Math.min(timeoutMs, 3000))
    })
    const request = (async () => {
      try {
        const response = await fetchImpl(endpoint, {
          method: 'POST', signal: controller.signal,
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: imageBytes.toString('base64'),
        })
        if (!response.ok) return null
        const data = await response.json()
        const predictions = Array.isArray(data.predictions) ? data.predictions : []
        const eligible = predictions.filter(prediction =>
          typeof prediction.class === 'string' && labels.has(prediction.class.toLowerCase().trim()) &&
          Number.isFinite(prediction.confidence) && prediction.confidence >= 0.5 && prediction.confidence <= 1)
        eligible.sort((a, b) => b.confidence - a.confidence)
        if (!eligible.length) return null
        return { source: 'roboflow', crop: 'banana', label: eligible[0].class.toLowerCase().trim(), confidence: eligible[0].confidence }
      } catch { return null }
    })()
    state.done = Promise.race([request, deadline]).then(result => {
      if (!controller.signal.aborted) state.result = result
    }).finally(() => clearTimeout(timer))
    return state
  }
}

export const startRoboflow = createRoboflowDetector()

// Multi-model path: crop-gated after Gemini; peers run concurrently within remaining budget.
import { readFileSync } from 'node:fs'
export const detectorModels = (() => {
  try {
    return JSON.parse(readFileSync(new URL('./detectors.json', import.meta.url), 'utf8'))
      .filter(model => ['banana', 'cacao'].includes(model.crop) && /^[\w/-]+$/.test(model.model) && model.labels).slice(0, 3)
  } catch { return [] }
})()
export function knowledgeIdFor(opinion) {
  return detectorModels.find(model => model.crop === opinion?.crop && (!opinion.model || model.model === opinion.model) && model.labels[opinion.label])?.labels[opinion.label] || null
}

export function createDetectorRunner({ apiKey = process.env.ROBOFLOW_API_KEY, fetchImpl = fetch, models = detectorModels } = {}) {
  return async function run(input, crop, budgetMs = 3000) {
    if (!apiKey?.trim() || !['banana', 'cacao'].includes(crop) || budgetMs < 20) return []
    const jobs = models.filter(model => model.crop === crop).slice(0, 3).map(async model => {
      const controller = new AbortController()
      let timer
      const deadline = new Promise(resolve => { timer = setTimeout(() => { resolve(null); controller.abort() }, Math.min(3000, budgetMs)) })
      const request = (async () => {
        try {
          const response = await fetchImpl(`https://serverless.roboflow.com/${model.model}`, {
            method: 'POST', signal: controller.signal,
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: input.imageBytes.toString('base64'),
          })
          if (!response.ok) return null
          let data = await response.json()
          if (Array.isArray(data)) data = data[0]
          let predictions = Array.isArray(data.predictions) ? data.predictions :
            Object.entries(data.predictions || {}).map(([label, value]) => ({ class: label, confidence: typeof value === 'number' ? value : value.confidence }))
          if (!predictions.length && data.top) predictions = [{ class: data.top, confidence: data.confidence }]
          const valid = predictions.filter(prediction => model.labels[prediction.class] &&
            Number.isFinite(prediction.confidence) && prediction.confidence >= 0.5 && prediction.confidence <= 1)
          valid.sort((a,b) => b.confidence - a.confidence)
          return valid.length ? { source: 'roboflow', model: model.model, crop, label: valid[0].class, confidence: valid[0].confidence } : null
        } catch { return null }
      })()
      try { return await Promise.race([request, deadline]) }
      finally { clearTimeout(timer); controller.abort() }
    })
    return (await Promise.all(jobs)).filter(Boolean)
  }
}
export const runDetectors = createDetectorRunner()
