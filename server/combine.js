import { matchKnowledge, entryFor, conditionFamily } from './knowledge.js'
import { knowledgeIdFor } from './roboflow.js'
import { message, possibleName, localCondition } from './messages.js'

export function combineDiagnosis(result, opinions, language) {
  const originalMatch = matchKnowledge(result)
  const valid = opinions.filter(opinion => opinion.crop === result.crop && !result.notAPlant &&
    opinion.source === 'roboflow' && Number.isFinite(opinion.confidence) && opinion.confidence >= .5 && opinion.confidence <= 1 && knowledgeIdFor(opinion))
  valid.sort((a,b) => b.confidence - a.confidence)
  const best = valid[0] || null
  const votes = [originalMatch?.id, ...valid.map(knowledgeIdFor)].filter(Boolean).map(conditionFamily)
  const agreement = votes.length < 2 ? null : new Set(votes).size === 1 ? 'agree' : 'differ'
  let primary = { ...result }, knowledgeMatch = originalMatch, primarySource = 'gemini'
  const notes = []
  if (best && (result.confidence === 'Low' || !originalMatch)) {
    const entry = entryFor(knowledgeIdFor(best))
    if (entry) {
      knowledgeMatch = { id: entry.id, name: entry.name }
      primary.problemNameEnglish = entry.name
      primary.problemNameLocal = possibleName(localCondition(entry.id, language) || entry.name, language)
      // A detector score is not a calibrated diagnosis probability; never raise confidence.
      primarySource = 'roboflow'
      notes.push(message('detector', language))
    }
  }
  if (agreement === 'differ') notes.push(message('differ', language))
  const lowConfidenceMessage = result.confidence === 'Low' ? message('low', language) : null
  if (lowConfidenceMessage) notes.push(lowConfidenceMessage)
  const note = notes.length ? notes.join(' ') : null
  return {
    ...primary, whenToCallExpert: note ? `${result.whenToCallExpert} ${note}` : result.whenToCallExpert,
    knowledgeMatch, secondOpinion: best ? { source: best.source, crop: best.crop, label: best.label, confidence: best.confidence } : null,
    secondOpinions: valid, agreement, note, primarySource, lowConfidenceMessage,
  }
}
