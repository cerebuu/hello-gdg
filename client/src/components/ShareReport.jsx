import { useState } from 'react'
import { optionalCopy } from '../optionalCopy.js'

const disclaimer = 'This is a decision aid, not a lab diagnosis.'
export default function ShareReport({ outcome }) {
  const [location, setLocation] = useState('')
  const [visible, setVisible] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const { result, sample, source, language, image, date } = outcome
  const optionalT = optionalCopy[language]
  const secondOpinion = result.secondOpinion
  const dateLabel = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(date))
  const provenance = source === 'live' ? 'AI guidance — not confirmed' : `SAMPLE / ${source === 'offline' ? 'Offline demo mode / ' : ''}${sample.label} — not a diagnosis of an uploaded photo`
  const report = [
    'Bisaya Crop Doctor — agriculture office report', provenance,
    `Date: ${dateLabel} (Philippines)`, `Location: ${location.trim() || 'Not provided'}`,
    `Language: ${language}`, `Crop: ${result.crop}`,
    `Problem: ${result.problemNameEnglish}`, result.problemNameLocal,
    ...(result.knowledgeMatch ? [`${optionalT.knownCondition}: ${result.knowledgeMatch.name}`] : []),
    ...(secondOpinion ? [`${optionalT.secondCheck}: ${secondOpinion.label} (${formatConfidence(secondOpinion.confidence)})`, optionalT.detectorNote] : []),
    ...(result.note ? [`${optionalT.disagreement}: ${result.note}`] : []),
    `Confidence: ${result.confidence}`, `Severity: ${result.severity}`,
    ...result.actionSteps.map((step, i) => `${i + 1}. ${step}`),
    `When to call an expert: ${result.whenToCallExpert}`,
    ...(result.notAPlant || result.confidence === 'Low' ? ["We're not sure. Contact the local agriculture office."] : []),
    disclaimer,
    'Photo: included in the printable report; text copy does not contain the image.',
  ].join('\n')

  async function copy() {
    try { await navigator.clipboard.writeText(report); setCopyStatus('Report text copied. Use Print to include the photo.') }
    catch { setCopyStatus('Copy is unavailable here. Select and copy the report text below.') }
  }
  function print(kind) {
    document.body.dataset.print = kind
    window.print()
    delete document.body.dataset.print
  }

  return <section className="panel share">
    <h2>Share with agri office</h2>
    <p>Create a report to show a technician. Nothing is sent automatically.</p>
    <label htmlFor="location">Barangay or municipality</label>
    <input id="location" maxLength={150} placeholder="e.g. Barangay / Municipality" value={location} onChange={event => setLocation(event.target.value)} />
    <button className="secondary" onClick={() => setVisible(true)}>Create report</button>
    {visible && <>
      <article className="print-report">
        <h2>Bisaya Crop Doctor</h2><p className="provenance">{provenance}</p>
        <img className="report-photo" src={image} alt={sample ? 'Sample illustration, not the uploaded photo' : 'Checked plant photo'} />
        <p>{dateLabel} (Philippines) · {location.trim() || 'Location not provided'}</p>
        <h3>{result.problemNameLocal}</h3><p>{result.problemNameEnglish}</p>
        {result.knowledgeMatch && <p>{optionalT.knownCondition}: {result.knowledgeMatch.name}</p>}
        {secondOpinion && <p>{optionalT.secondCheck}: {secondOpinion.label} ({formatConfidence(secondOpinion.confidence)})<br />{optionalT.detectorNote}</p>}
        {result.note && <p><strong>{optionalT.disagreement}:</strong> {result.note}</p>}
        <p>Crop: {result.crop} · Confidence: {result.confidence} · Severity: {result.severity}</p>
        <ol>{result.actionSteps.map((step, i) => <li key={i}>{step}</li>)}</ol>
        <p><strong>When to call an expert:</strong> {result.whenToCallExpert}</p>
        {(result.notAPlant || result.confidence === 'Low') && <p>We're not sure. Contact the local agriculture office.</p>}
        <p>{disclaimer}</p>
      </article>
      <div className="button-row"><button onClick={copy}>Copy report</button><button className="secondary" onClick={() => print('report')}>Print report</button></div>
      {copyStatus && <p role="status">{copyStatus}</p>}
      <details><summary>Selectable report text</summary><textarea readOnly aria-label="Report text" value={report} rows={12} /></details>
      <article className="farmer-card">
        <h2>{language === 'bisaya' ? 'Kard sa mag-uuma' : 'Kard para sa magsasaka'} · Farmer card</h2>
        <p className="provenance">{provenance}</p><p>{result.problemNameLocal}</p>
        {result.knowledgeMatch && <p>{optionalT.knownCondition}: {result.knowledgeMatch.name}</p>}
        {secondOpinion && <p>{optionalT.secondCheck}: {secondOpinion.label} ({formatConfidence(secondOpinion.confidence)})<br />{optionalT.detectorNote}</p>}
        {result.note && <p><strong>{optionalT.disagreement}:</strong> {result.note}</p>}
        <ol>{result.actionSteps.map((step, i) => <li key={i}>{step}</li>)}</ol>
        <p>{result.whenToCallExpert}</p><p>{disclaimer}</p>
      </article>
      <button className="secondary" onClick={() => print('farmer')}>Print large-text farmer card</button>
    </>}
  </section>
}

function formatConfidence(value) {
  const numeric = typeof value === 'string' ? Number.parseFloat(value) : value
  if (!Number.isFinite(numeric)) return ''
  return `${Math.round(numeric <= 1 ? numeric * 100 : numeric)}%`
}
