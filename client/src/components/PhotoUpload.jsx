export default function PhotoUpload({ photo, disabled, onFile, processing }) {
  function select(event) {
    const file = event.target.files?.[0]
    if (file) onFile(file)
    event.target.value = ''
  }
  return <section className="panel">
    <h2>1. Add a plant photo</h2>
    <p>Choose a clear banana or cacao leaf or fruit photo. It is resized on your phone before sending.</p>
    <div className="button-row">
      <label className={`file-button ${disabled ? 'disabled' : ''}`}>Choose photo
        <input aria-label="Choose photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={select} />
      </label>
      <label className={`file-button secondary ${disabled ? 'disabled' : ''}`}>Take photo
        <input aria-label="Take photo" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={disabled} onChange={select} />
      </label>
    </div>
    {processing && <p role="status">Preparing your photo…</p>}
    {photo && <figure><img className="photo-preview" src={photo.preview} alt="Your selected plant photo" />
      <figcaption>{photo.name} · Ready to check</figcaption></figure>}
    <p className="small">JPEG, PNG or WebP. When you check, your photo is sent to Google Gemini through our server. Avoid faces or personal details.</p>
  </section>
}
