export default function ResultCard({ result, source, sampleLabel, language }) {
  const unsure = result.notAPlant || result.confidence === 'Low'
  return <section className="panel result" aria-label="Diagnosis result">
    <p className="eyebrow">{source === 'live' ? 'AI guidance · not confirmed' : `SAMPLE result · ${sampleLabel}`}</p>
    <h2>{result.problemNameLocal}</h2>
    <p>{result.problemNameEnglish}</p>
    {unsure && <div className="notice"><strong>We're not sure / {language === 'bisaya' ? 'Dili pa mi sigurado' : 'Hindi pa kami sigurado'}</strong>
      <p>{language === 'bisaya' ? 'Pangayo og tabang sa lokal nga opisina sa agrikultura. Ayaw pagdesisyon base lang sa litrato.' : 'Humingi ng tulong sa lokal na tanggapan ng agrikultura. Huwag magdesisyon batay lamang sa litrato.'}</p></div>}
    <div className="badges"><span>Crop: {result.crop}</span><span>Confidence: {result.confidence}</span><span>Severity: {result.severity}</span></div>
    <h3>{language === 'bisaya' ? 'Tulo ka lakang' : 'Tatlong hakbang'}</h3>
    <ol className="steps">{result.actionSteps.map((step, i) => <li key={i}>{step}</li>)}</ol>
    <h3>When to call an expert</h3><p>{result.whenToCallExpert}</p>
  </section>
}
