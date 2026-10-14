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
