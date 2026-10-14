import { useEffect, useRef, useState } from 'react'
import PhotoUpload from './components/PhotoUpload.jsx'
import LanguageToggle from './components/LanguageToggle.jsx'
import ResultCard from './components/ResultCard.jsx'
import SampleButtons from './components/SampleButtons.jsx'
import ShareReport from './components/ShareReport.jsx'
import { preparePhoto } from './photo.js'
import { requestDiagnosis } from './diagnose.js'
import samples from '../../data/samples.json'

export default function App() {
  const [language, setLanguage] = useState('bisaya')
  const [photo, setPhoto] = useState(null)
  const [preparing, setPreparing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [outcome, setOutcome] = useState(null)
  const [fallbackId, setFallbackId] = useState(samples[0].id)
  const active = useRef(null)
  const busy = preparing || loading
  useEffect(() => () => active.current?.abort(), [])

  function changeLanguage(value) {
    setLanguage(value)
    setError('')
    if (outcome?.sample) {
      setOutcome({ ...outcome, result: outcome.sample.results[value], language: value })
    } else setOutcome(null)
  }

  async function onFile(file) {
    setPreparing(true); setError(''); setOutcome(null); setPhoto(null)
    try { setPhoto(await preparePhoto(file)) }
    catch (problem) { setError(problem.message || 'This photo could not be opened. Please try another photo.') }
    finally { setPreparing(false) }
  }

  function showSample(sample) {
    setError('')
    setOutcome({ result: sample.results[language], sample, source: 'sample', language,
      image: sample.imagePath, date: new Date().toISOString() })
  }

  async function checkPlant() {
    if (!photo || busy) return
    setLoading(true); setError(''); setOutcome(null)
    const controller = new AbortController()
    active.current = controller
    const timeout = setTimeout(() => controller.abort(), 15000)
    try {
      const result = await requestDiagnosis(photo, language, controller.signal)
      setOutcome({ result, source: 'live', language, image: photo.preview, date: new Date().toISOString() })
    } catch (problem) {
      if (active.current !== controller) return
      const sample = samples.find(item => item.id === fallbackId)
      setError(problem.name === 'AbortError' ? 'The check took over 15 seconds. Live diagnosis is unavailable.' : problem.message)
      setOutcome({ result: sample.results[language], sample, source: 'offline', language,
        image: sample.imagePath, date: new Date().toISOString() })
    } finally {
      clearTimeout(timeout)
      if (active.current === controller) { active.current = null; setLoading(false) }
    }
  }

  return <main>
    <div className="app-shell">
      <header className="hero"><p className="eyebrow">For Davao farmers and helpers</p>
        <h1>Bisaya Crop Doctor</h1>
        <p>Take a banana or cacao photo and get simple next steps in Bisaya or Filipino, or explore a labeled sample with a farmer or helper.</p>
      </header>
      <p className="disclaimer">This is a decision aid, not a lab diagnosis.</p>
      <div className="interactive">
        <LanguageToggle language={language} onChange={changeLanguage} disabled={busy} />
        <PhotoUpload photo={photo} onFile={onFile} disabled={busy} processing={preparing} />
        <section className="panel">
          <h2>2. Check your plant</h2>
          <label htmlFor="fallback-case">Demo backup case</label>
          <select id="fallback-case" value={fallbackId} disabled={busy} onChange={event => setFallbackId(event.target.value)}>
            {samples.map(sample => <option key={sample.id} value={sample.id}>{sample.label}</option>)}
          </select>
          <p className="small">If the check fails, we show this selected SAMPLE case. It is not a diagnosis of your photo.</p>
          <button className="primary check-button" disabled={!photo || busy} onClick={checkPlant}>{loading ? 'Checking your plant…' : 'Check my plant'}</button>
          {loading && <p role="status" aria-live="polite">Please wait. We will switch to the selected demo sample after 15 seconds if needed.</p>}
          {error && <p className="error" role="alert">{error}</p>}
        </section>
        <SampleButtons samples={samples} onSelect={showSample} disabled={busy} />
      </div>
      {outcome && <div className="interactive outcome" aria-live="polite">
        {outcome.source === 'offline' && <p className="notice"><strong>Offline demo mode</strong> · SAMPLE result for {outcome.sample.label}. This is a saved example, not an assessment of your uploaded photo.</p>}
        <figure><img className="photo-preview" src={outcome.image} alt={outcome.sample ? `${outcome.sample.label} sample illustration` : 'Photo used for this AI guidance'} />
          <figcaption>{outcome.sample ? 'SAMPLE placeholder illustration — not a field photo' : 'Your checked photo'}</figcaption></figure>
        <ResultCard result={outcome.result} source={outcome.source} sampleLabel={outcome.sample?.label} language={outcome.language} />
        <ShareReport key={`${outcome.date}-${outcome.language}`} outcome={outcome} />
      </div>}
      <footer className="interactive">Bisaya and Filipino wording needs native-speaker review. Crop guidance needs local expert review.</footer>
    </div>
  </main>
}
