// Browser integration checks using Chrome's built-in DevTools protocol; no test dependency.
import { spawn } from 'node:child_process'
import { mkdirSync, existsSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import assert from 'node:assert/strict'
const mode = process.argv[2] || 'online'
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync('node_modules', { recursive: true })
const profile = mkdtempSync('node_modules/.core-browser-')
const browser = spawn(chrome, ['--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${process.cwd()}/${profile}`, 'about:blank'], { stdio: 'ignore' })
let socket
const checks = []
try {
  for (let i = 0; i < 100 && !existsSync(`${profile}/DevToolsActivePort`); i++) await new Promise(r => setTimeout(r, 100))
  const port = readFileSync(`${profile}/DevToolsActivePort`, 'utf8').split('\n')[0]
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  let sequence = 0
  const pending = new Map()
  socket.onmessage = event => {
    const item = JSON.parse(event.data)
    if (pending.has(item.id)) {
      const { resolve, reject } = pending.get(item.id)
      pending.delete(item.id)
      item.error ? reject(new Error(JSON.stringify(item.error))) : resolve(item.result)
    }
  }
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }))
  })
  const evaluate = async expression => {
    const response = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails))
    return response.result.value
  }
  const check = (name, pass) => { assert.ok(pass, name); checks.push(name); console.log(`PASS: ${name}`) }
  const waitFor = async (expression, timeout = 5000) => {
    const start = Date.now()
    while (Date.now() - start < timeout) { if (await evaluate(expression)) return; await new Promise(r => setTimeout(r, 100)) }
    throw new Error(`Timed out: ${expression}`)
  }
  const click = text => evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === ${JSON.stringify(text)}).click()`)
  await call('Page.enable')
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await call('Page.navigate', { url: 'http://localhost:5173/' })
  await waitFor(`!!document.querySelector('.check-button')`)
  check('mobile title, intro, and disclaimer', await evaluate(`document.body.innerText.includes('Bisaya Crop Doctor') && document.body.innerText.includes('This is a decision aid, not a lab diagnosis.')`))
  check('camera input and disabled check before photo', await evaluate(`document.querySelector('[capture]').getAttribute('capture') === 'environment' && document.querySelector('.check-button').disabled`))
  check('large touch targets and no horizontal overflow at 390px', await evaluate(`document.documentElement.scrollWidth <= innerWidth && [...document.querySelectorAll('button')].every(b => b.getBoundingClientRect().height >= 44)`))
  let apiCalls = 0
  await call('Network.enable')
  const previousMessage = socket.onmessage
  socket.onmessage = event => {
    const item = JSON.parse(event.data)
    if (item.method === 'Network.requestWillBeSent' && item.params.request.url.includes('/api/diagnose')) apiCalls++
    previousMessage(event)
  }
  const samples = JSON.parse(readFileSync('data/samples.json', 'utf8'))
  for (const lang of ['Bisaya', 'Filipino']) {
    await click(lang)
    for (const sample of samples) {
      await click(sample.label)
      check(`${lang}: ${sample.id} sample and three steps`, await evaluate(`document.querySelector('.result').innerText.includes('SAMPLE') && document.querySelector('.result').innerText.includes(${JSON.stringify(sample.results[lang.toLowerCase()].problemNameLocal)}) && document.querySelectorAll('.result .steps li').length === 3`))
      if (sample.results[lang.toLowerCase()].confidence === 'Low') check(`${lang}: ${sample.id} honest uncertainty`, await evaluate(`document.querySelector('.result').innerText.includes("We're not sure")`))
    }
  }
  check('sample selection makes no diagnosis API calls', apiCalls === 0)
  await click('Bisaya'); await click(samples[0].label)
  await evaluate(`(() => {const field=document.querySelector('#location');const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(field,'Barangay Demo, Davao');field.dispatchEvent(new Event('input',{bubbles:true}));})()`)
  await click('Create report')
  check('report includes location, photo, date, severity, sample provenance, disclaimer', await evaluate(`(() => {const r=document.querySelector('.print-report');return r.innerText.includes('Barangay Demo, Davao') && r.innerText.includes('Philippines') && r.innerText.includes('Severity:') && r.innerText.includes('SAMPLE') && r.innerText.includes('This is a decision aid, not a lab diagnosis.') && !!r.querySelector('img')})()`))
  await evaluate(`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedReport=text}}})`)
  await click('Copy report')
  await waitFor(`!!window.copiedReport`)
  check('copy button sends full report text to clipboard API', await evaluate(`window.copiedReport.includes('Barangay Demo, Davao') && window.copiedReport.includes('SAMPLE') && window.copiedReport.includes('This is a decision aid, not a lab diagnosis.')`))
  await evaluate(`window.print=()=>{window.printModes=(window.printModes||[]).concat(document.body.dataset.print)}`)
  await click('Print report'); await click('Print large-text farmer card')
  check('print buttons select report and farmer layouts', await evaluate(`JSON.stringify(window.printModes)==='["report","farmer"]'`))
  await call('Emulation.setEmulatedMedia', { media: 'print' })
  for (const kind of ['report', 'farmer']) {
    await evaluate(`document.body.dataset.print=${JSON.stringify(kind)}`)
    check(`${kind} print layout excludes upload controls`, await evaluate(`getComputedStyle(document.querySelector('.hero')).display==='none' && getComputedStyle(document.querySelector(${JSON.stringify(kind === 'report' ? '.print-report' : '.farmer-card')})).display==='block'`))
    const pdf = await call('Page.printToPDF', { printBackground: true, preferCSSPageSize: true })
    writeFileSync(`node_modules/.core-${kind}.pdf`, Buffer.from(pdf.data, 'base64'))
    check(`${kind} PDF generated`, Buffer.from(pdf.data, 'base64').length > 1000)
  }
  await call('Emulation.setEmulatedMedia', { media: '' })
  await evaluate(`delete document.body.dataset.print`)
  await evaluate(`(() => {const input=document.querySelector('[aria-label="Choose photo"]');const data=new DataTransfer();data.items.add(new File(['not an image'],'bad.svg',{type:'image/svg+xml'}));input.files=data.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`)
  await waitFor(`!!document.querySelector('[role=alert]')`)
  check('unsupported photo has friendly error and cannot submit', await evaluate(`document.querySelector('[role=alert]').innerText.includes('JPEG, PNG, or WebP') && document.querySelector('.check-button').disabled`))
  await evaluate(`(() => {const input=document.querySelector('[aria-label="Choose photo"]');const data=new DataTransfer();data.items.add(new File([new Uint8Array(26*1024*1024)],'large.png',{type:'image/png'}));input.files=data.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`)
  await waitFor(`document.querySelector('[role=alert]')?.innerText.includes('25 MB')`)
  check('oversized source photo has friendly error', await evaluate(`document.querySelector('.check-button').disabled`))
  await evaluate(`(() => {const select=document.querySelector('#fallback-case');select.value='cacao-pod-rot';select.dispatchEvent(new Event('change',{bubbles:true}));})()`)
  await evaluate(`(async () => {const canvas=document.createElement('canvas');canvas.width=2400;canvas.height=1800;const ctx=canvas.getContext('2d');ctx.fillStyle='green';ctx.fillRect(0,0,2400,1800);const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));const file=new File([blob],'test-plant.png',{type:'image/png'});const transfer=new DataTransfer();transfer.items.add(file);const input=document.querySelector('[aria-label="Choose photo"]');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`)
  await waitFor(`!!document.querySelector('.panel .photo-preview') && !document.querySelector('.check-button').disabled`)
  check('photo resized and compressed to JPEG at most 1280px', await evaluate(`(async()=>{const img=document.querySelector('.panel .photo-preview');await img.decode();return img.naturalWidth<=1280 && img.naturalHeight<=1280 && img.src.startsWith('data:image/jpeg;base64,')})()`))
  await click('Check my plant')
  check('loading state appears', await evaluate(`document.querySelector('.check-button').textContent.includes('Checking')`))
  await waitFor(`!!document.querySelector('.outcome .notice') && !document.querySelector('.check-button').disabled`)
  check(`${mode}: failure triggers explicitly labeled offline sample`, await evaluate(`document.querySelector('.outcome').innerText.includes('Offline demo mode') && document.querySelector('.outcome').innerText.includes('not an assessment of your uploaded photo')`))
  check('fallback matches the explicitly selected cacao sample and uses its illustration', await evaluate(`document.querySelector('.outcome .result').innerText.includes('cacao') && document.querySelector('.outcome > figure img').src.includes('cacao-pod-rot.svg')`))
  if (mode === 'online') check('missing key error is visible', await evaluate(`document.querySelector('[role=alert]').innerText.includes('GEMINI_API_KEY is not configured')`))
  if (mode === 'online') {
    const mock = { ...samples[0].results.bisaya, confidence: 'Medium' }
    await evaluate(`window.originalFetch=window.fetch;window.fetch=async(...args)=>String(args[0]).includes('/api/diagnose')?new Response(JSON.stringify(${JSON.stringify(mock)}),{status:200,headers:{'Content-Type':'application/json'}}):window.originalFetch(...args)`)
    await click('Check my plant')
    await waitFor(`!!document.querySelector('.result') && /AI guidance/i.test(document.querySelector('.result').innerText)`)
    check('successful API response is shown with uploaded photo', await evaluate(`document.querySelector('.outcome > figure img').src.startsWith('data:image/jpeg') && !document.querySelector('.outcome').innerText.includes('SAMPLE')`))
    await click('Filipino')
    check('changing language clears stale live result', await evaluate(`!document.querySelector('.result')`))
    await evaluate(`window.fetch=(url,options)=>String(url).includes('/api/diagnose')?new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')))):window.originalFetch(url,options)`)
    const started = Date.now()
    await click('Check my plant')
    await waitFor(`!!document.querySelector('.outcome') && document.querySelector('.outcome').innerText.includes('Offline demo mode')`, 18000)
    check('15-second timeout aborts and returns sample', Date.now() - started >= 14500 && Date.now() - started < 18000)
    check('timeout fallback follows selected Filipino language', await evaluate(`document.querySelector('.result').innerText.includes(${JSON.stringify(samples[2].results.filipino.problemNameLocal)})`))
    await evaluate(`window.fetch=window.originalFetch`)
  }
  await call('Emulation.setDeviceMetricsOverride', { width: 320, height: 568, deviceScaleFactor: 1, mobile: true })
  check('no horizontal overflow at 320px with results', await evaluate(`document.documentElement.scrollWidth<=innerWidth`))
  const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync(`node_modules/.core-${mode}-phone.png`, Buffer.from(shot.data, 'base64'))
  writeFileSync(`node_modules/.core-${mode}-checks.json`, JSON.stringify(checks, null, 2))
  console.log(`PASS: ${checks.length} ${mode} browser checks.`)
} finally { socket?.close(); browser.kill('SIGTERM') }
