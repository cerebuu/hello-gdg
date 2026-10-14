export default function LanguageToggle({ language, onChange, disabled }) {
  return <fieldset className="language" disabled={disabled}>
    <legend>Advice language / Pinulongan</legend>
    <div className="button-row">{[['bisaya', 'Bisaya'], ['filipino', 'Filipino']].map(([value, label]) =>
      <button type="button" key={value} aria-pressed={language === value}
        className={language === value ? 'selected' : 'secondary'} onClick={() => onChange(value)}>{label}</button>
    )}</div>
  </fieldset>
}
