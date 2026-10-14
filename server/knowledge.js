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
  'Candidate conditions to consider: ' + diseases.map(entry => `${entry.crop}: ${entry.name}${entry.visibleSymptoms.length ? ' [' + entry.visibleSymptoms.join('; ') + ']' : ''}`).join('; ') +
  '. These sources do not describe visible symptoms; do not invent sourced symptom associations. Names are not diagnostic evidence.' : ''

export const conditionFamily = id => id === 'banana-black-and-yellow-sigatoka' ? 'banana-sigatoka' : id
export const entryFor = id => diseases.find(entry => entry.id === id)

export function matchKnowledge(result) {
  if (result.notAPlant || result.crop === 'unknown') return null
  const name = result.problemNameEnglish.toLowerCase().replace(/[-_]/g, ' ')
  if (/\b(not|no|without|unlikely|unknown|uncertain|or|versus|vs)\b/.test(name)) return null
  const matches = diseases.filter(entry => entry.crop === result.crop &&
    new RegExp(`\\b${entry.name.toLowerCase().replace(/[-_]/g, ' ')}\\b`).test(name))
  if (new Set(matches.map(entry => conditionFamily(entry.id))).size !== 1) return null
  matches.sort((a,b) => b.name.length - a.name.length)
  return matches.length ? { id: matches[0].id, name: matches[0].name } : null
}
