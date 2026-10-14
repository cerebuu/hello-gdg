import { readFileSync } from 'node:fs'

// Optional context must never break the existing diagnosis path.
export const diseases = (() => {
  try {
    const entries = JSON.parse(readFileSync(new URL('./knowledge/diseases.json', import.meta.url), 'utf8'))
    return Array.isArray(entries) ? entries.filter(entry =>
      typeof entry.id === 'string' && ['banana', 'cacao'].includes(entry.crop) &&
      typeof entry.name === 'string' && Array.isArray(entry.visibleSymptoms) &&
      typeof entry.source === 'string') : []
  } catch { return [] }
})()

export const candidateConditions = diseases.length ?
  'Candidate conditions to consider (not confirmed diagnoses; names alone are not symptom evidence): ' +
  diseases.map(entry => `${entry.crop}: ${entry.name}${entry.visibleSymptoms.length ? ' [' + entry.visibleSymptoms.join('; ') + ']' : ' [source does not describe visible symptoms]'}`).join('; ') : ''

export function matchKnowledge(result) {
  if (result.notAPlant || result.crop === 'unknown') return null
  const name = result.problemNameEnglish.toLowerCase()
  // Reject negation and differential lists rather than guessing a mapping.
  if (/\b(not|no|without|unlikely|unknown|uncertain|or|versus|vs)\b/.test(name)) return null
  const matches = diseases.filter(entry => entry.crop === result.crop &&
    new RegExp(`\\b${entry.name.toLowerCase()}\\b`).test(name))
  return matches.length === 1 ? { id: matches[0].id, name: matches[0].name } : null
}
