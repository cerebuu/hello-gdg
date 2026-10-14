import { GoogleGenAI, Type } from '@google/genai'

const DEFAULT_MODEL = 'gemini-2.5-flash'

const diagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    crop: { type: Type.STRING, enum: ['banana', 'cacao', 'unknown'] },
    problemNameEnglish: { type: Type.STRING },
    problemNameLocal: { type: Type.STRING },
    confidence: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
    severity: {
      type: Type.STRING,
      enum: ['Mild', 'Moderate', 'Severe', 'Unknown'],
    },
    actionSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    whenToCallExpert: { type: Type.STRING },
    notAPlant: { type: Type.BOOLEAN },
  },
  required: [
    'crop',
    'problemNameEnglish',
    'problemNameLocal',
    'confidence',
    'severity',
    'actionSteps',
    'whenToCallExpert',
    'notAPlant',
  ],
}

const localizedLanguage = {
  bisaya: 'Bisaya (Cebuano)',
  filipino: 'Filipino',
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function validateDiagnosis(result) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('Gemini returned a non-object diagnosis')
  }

  const valid =
    ['banana', 'cacao', 'unknown'].includes(result.crop) &&
    isNonEmptyString(result.problemNameEnglish) &&
    isNonEmptyString(result.problemNameLocal) &&
    ['High', 'Medium', 'Low'].includes(result.confidence) &&
    ['Mild', 'Moderate', 'Severe', 'Unknown'].includes(result.severity) &&
    Array.isArray(result.actionSteps) &&
    result.actionSteps.length === 3 &&
    result.actionSteps.every(isNonEmptyString) &&
    isNonEmptyString(result.whenToCallExpert) &&
    typeof result.notAPlant === 'boolean' &&
    (!result.notAPlant ||
      (result.crop === 'unknown' && result.severity === 'Unknown'))

  if (!valid) throw new Error('Gemini returned a diagnosis that violates the API contract')

  return {
    crop: result.crop,
    problemNameEnglish: result.problemNameEnglish.trim(),
    problemNameLocal: result.problemNameLocal.trim(),
    confidence: result.confidence,
    severity: result.severity,
    actionSteps: result.actionSteps.map((step) => step.trim()),
    whenToCallExpert: result.whenToCallExpert.trim(),
    notAPlant: result.notAPlant,
  }
}

export function createGeminiDiagnoser({
  client,
  apiKey = process.env.GEMINI_API_KEY,
  model = process.env.GEMINI_MODEL || DEFAULT_MODEL,
} = {}) {
  let gemini = client

  return async function diagnose({ imageBytes, mimeType, language }) {
    if (!gemini) {
      if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')
      gemini = new GoogleGenAI({ apiKey })
    }

    const response = await gemini.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: [
                'Assess the crop shown in this image as a cautious agricultural decision aid.',
                `Write problemNameLocal, each action step, and whenToCallExpert in ${localizedLanguage[language]}.`,
                'Do not claim certainty or invent evidence that is not visible. If the image is unclear, the crop is not banana or cacao, or the issue cannot be assessed, use crop "unknown", confidence "Low", and appropriately cautious guidance. Use severity "Unknown" whenever severity cannot be assessed.',
                'If the image does not depict a plant, set notAPlant to true, crop to "unknown", severity to "Unknown", and explain that in both problem-name fields and the expert guidance.',
                'Do not recommend pesticide products, application rates, or other hazardous chemical use. Suggest safe observation and consultation with a local agricultural technician when uncertain.',
                'Return only the requested structured result.',
              ].join(' '),
            },
            {
              inlineData: {
                mimeType,
                data: imageBytes.toString('base64'),
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: diagnosisSchema,
        temperature: 0.2,
      },
    })

    if (!isNonEmptyString(response.text)) {
      throw new Error('Gemini returned an empty diagnosis')
    }

    let parsed
    try {
      parsed = JSON.parse(response.text)
    } catch (error) {
      throw new Error('Gemini returned invalid JSON', { cause: error })
    }

    return validateDiagnosis(parsed)
  }
}

export const diagnoseWithGemini = createGeminiDiagnoser()
