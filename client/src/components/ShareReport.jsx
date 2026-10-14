import { useState } from 'react'
import { optionalCopy } from '../optionalCopy.js'

export default function ShareReport({ outcome }) {
  const [location, setLocation] = useState('')
  const [visible, setVisible] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const { result, sample, source, language, image, date } = outcome
  const optionalT = optionalCopy[language]
  const displayChecks = result.secondOpinions?.length
    ? result.secondOpinions
    : result.secondOpinion ? [result.secondOpinion] : []
  const dateLabel = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(date))
  const provenance = source === 'live' ? optionalT.liveProvenance : `${optionalT.sampleProvenance}${sample ? ` / ${sample.label}` : ''}`
  const report = [
    'Bisaya Crop Doctor — agriculture office report', provenance,
    `${optionalT.date}: ${dateLabel} (Philippines)`, `${optionalT.location}: ${location.trim() || 'Not provided'}`,
    `${optionalT.language}: ${language}`, `${optionalT.crop}: ${optionalT.cropLabels[result.crop] || result.crop}`,
    `${optionalT.problem}: ${result.problemNameEnglish}`, result.problemNameLocal,
    ...(result.knowledgeMatch ? [`${optionalT.knownCondition}: ${result.knowledgeMatch.name}`] : []),
    ...(displayChecks.length ? [
      optionalT.secondCheck,
      ...displayChecks.map(check => `${check.label} (${formatConfidence(check.confidence)})`),
      optionalT.detectorNote,
    ] : []),
    ...(result.agreement === 'agree' ? [optionalT.checksAgree] : []),
    ...(result.note ? [`${optionalT.disagreement}: ${result.note}`] : []),
    `${optionalT.confidence}: ${optionalT.confidenceLabels[result.confidence] || result.confidence}`, `${optionalT.severity}: ${optionalT.severityLabels[result.severity] || result.severity}`,
    ...result.actionSteps.map((step, i) => `${i + 1}. ${step}`),
    `${optionalT.whenToCallExpert} ${result.whenToCallExpert}`,
    ...(result.notAPlant || result.confidence === 'Low' ? [`${optionalT.uncertain} ${optionalT.contactOffice}`] : []),
    optionalT.disclaimer,
    optionalT.photoIncluded,
  ].join('\n')

  async function copy() {
    try { await navigator.clipboard.writeText(report); setCopyStatus(optionalT.copySuccess) }
    catch { setCopyStatus(optionalT.copyFailure) }
  }
  function print(kind) {
    document.body.dataset.print = kind
    window.print()
    delete document.body.dataset.print
  }

  return <section className="panel share">
    <h2>{optionalT.reportTitle}</h2>
    <p>{optionalT.reportIntro}</p>
    <label htmlFor="location">{optionalT.locationLabel}</label>
    <input id="location" maxLength={150} placeholder={optionalT.locationPlaceholder} value={location} onChange={event => setLocation(event.target.value)} />
    <button className="secondary" onClick={() => setVisible(true)}>{optionalT.createReport}</button>
    {visible && <>
      <article className="print-report">
        <h2>Bisaya Crop Doctor</h2><p className="provenance">{provenance}</p>
        <img className="report-photo" src={image} alt={sample ? optionalT.reportSamplePhoto : optionalT.reportPhoto} onError={event => { if (sample) event.currentTarget.src = sample.imagePath }} />
        <p>{dateLabel} (Philippines) · {location.trim() || optionalT.location}</p>
        <h3>{result.problemNameLocal}</h3><p>{result.problemNameEnglish}</p>
        {result.knowledgeMatch && <p>{optionalT.knownCondition}: {result.knowledgeMatch.name}</p>}
        {displayChecks.length > 0 && <p>{optionalT.secondCheck}: {displayChecks.map(check => `${check.label} (${formatConfidence(check.confidence)})`).join(', ')}<br />{optionalT.detectorNote}</p>}
        {result.agreement === 'agree' && <p>{optionalT.checksAgree}</p>}
        {result.note && <p><strong>{optionalT.disagreement}:</strong> {result.note}</p>}
        <p>{optionalT.crop}: {optionalT.cropLabels[result.crop] || result.crop} · {tConfidence(optionalT, result.confidence)} · {optionalT.severity}: {optionalT.severityLabels[result.severity] || result.severity}</p>
        <ol>{result.actionSteps.map((step, i) => <li key={i}>{step}</li>)}</ol>
        <p><strong>{optionalT.whenToCallExpert}</strong> {result.whenToCallExpert}</p>
        {(result.notAPlant || result.confidence === 'Low') && <p>{optionalT.uncertain} {optionalT.contactOffice}</p>}
        <p>{optionalT.disclaimer}</p>
      </article>
      <div className="button-row"><button onClick={copy}>{optionalT.copyReport}</button><button className="secondary" onClick={() => print('report')}>{optionalT.printReport}</button></div>
      {copyStatus && <p role="status">{copyStatus}</p>}
      <details><summary>{optionalT.reportText}</summary><textarea readOnly aria-label={optionalT.reportText} value={report} rows={12} /></details>
      <article className="farmer-card">
        <h2>{optionalT.farmerCard}</h2>
        <p className="provenance">{provenance}</p><p>{result.problemNameLocal}</p>
        {result.knowledgeMatch && <p>{optionalT.knownCondition}: {result.knowledgeMatch.name}</p>}
        {displayChecks.length > 0 && <p>{optionalT.secondCheck}: {displayChecks.map(check => `${check.label} (${formatConfidence(check.confidence)})`).join(', ')}<br />{optionalT.detectorNote}</p>}
        {result.agreement === 'agree' && <p>{optionalT.checksAgree}</p>}
        {result.note && <p><strong>{optionalT.disagreement}:</strong> {result.note}</p>}
        <ol>{result.actionSteps.map((step, i) => <li key={i}>{step}</li>)}</ol>
        <p>{result.whenToCallExpert}</p><p>{optionalT.disclaimer}</p>
      </article>
      <button className="secondary" onClick={() => print('farmer')}>{optionalT.printFarmerCard}</button>
    </>}
  </section>
}

function tConfidence(copy, value) {
  return `${copy.aiConfidence}: ${copy.confidenceLabels[value] || value}`
}

function formatConfidence(value) {
  const numeric = typeof value === 'string' ? Number.parseFloat(value) : value
  if (!Number.isFinite(numeric)) return ''
  return `${Math.round(numeric <= 1 ? numeric * 100 : numeric)}%`
}
