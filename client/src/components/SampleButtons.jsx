export default function SampleButtons({ samples, onSelect, disabled }) {
  return <section className="panel">
    <h2>Try a sample</h2><p>Instant examples, no API call. These are SAMPLE results with placeholder illustrations.</p>
    <div className="sample-buttons">{samples.map(sample => <button className="secondary" key={sample.id} onClick={() => onSelect(sample)} disabled={disabled}>{sample.label}</button>)}</div>
  </section>
}
