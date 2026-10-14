const messages = {
  english: {
    object: 'A JSON object is required.', image: 'Please send a clear photo.', base64: 'The image data cannot be read. Choose another photo.',
    size: 'The image exceeds 5 MB. Choose a smaller photo.', mime: 'Choose a JPEG, PNG, or WebP photo.', language: 'Choose Bisaya, Filipino, or English.',
    json: 'The request could not be read. Please retry.', failed: 'The photo could not be checked. Retry or contact your agriculture office.',
    missingKey: 'GEMINI_API_KEY is not configured. Use a sample for now.', missingModel: 'GEMINI_MODEL is not configured.',
    timeout: 'The check took too long. Retry or use a sample.', low: 'We are not sure. Ask your local agriculture officer.',
    differ: 'The checks differ. Ask your local agriculture officer.', detector: 'This possible condition was suggested by Roboflow; it is not a confirmed diagnosis.',
  },
  bisaya: {
    object: 'Kinahanglan ang hustong datos sa hangyo.', image: 'Palihog pagpadala og klarong litrato.',
    base64: 'Dili mabasa ang datos sa litrato. Pagpili og laing litrato.', size: 'Sobra sa 5 MB ang litrato. Pagpili og mas gamay nga litrato.',
    mime: 'JPEG, PNG, o WebP nga litrato lang ang dawaton.', language: 'Pilia ang Bisaya o Filipino nga pinulongan.',
    json: 'Dili mabasa ang hangyo. Palihog sulayi pag-usab.', failed: 'Wala masusi ang litrato. Sulayi pag-usab o duol sa lokal nga opisina sa agrikultura.',
    missingKey: 'Wala pa maandam ang GEMINI_API_KEY sa serbisyo. Gamita una ang pananglitan.',
    missingModel: 'Wala pa maandam ang GEMINI_MODEL sa serbisyo. Kinahanglan kini alang sa pagsusi.',
    timeout: 'Dugay kaayo ang pagsusi. Sulayi pag-usab o gamita ang pananglitan.',
    low: 'Dili pa mi sigurado. Pangayo og tambag sa lokal nga opisyal sa agrikultura.',
    differ: 'Lahi ang mga pagsusi. Pangayo og tambag sa lokal nga opisyal sa agrikultura.',
    detector: 'Kini posibleng kahimtang nga gisugyot sa Roboflow; dili kini napamatud-ang sakit.',
  },
  filipino: {
    object: 'Kailangan ang wastong datos ng kahilingan.', image: 'Magpadala ng malinaw na larawan.',
    base64: 'Hindi mabasa ang datos ng larawan. Pumili ng ibang larawan.', size: 'Lampas sa 5 MB ang larawan. Pumili ng mas maliit na larawan.',
    mime: 'JPEG, PNG, o WebP na larawan lamang ang tinatanggap.', language: 'Piliin ang Bisaya o Filipino na wika.',
    json: 'Hindi mabasa ang kahilingan. Subukan muli.', failed: 'Hindi nasuri ang larawan. Subukan muli o lumapit sa lokal na tanggapan ng agrikultura.',
    missingKey: 'Hindi pa nakahanda ang GEMINI_API_KEY sa serbisyo. Gamitin muna ang halimbawa.',
    missingModel: 'Hindi pa nakahanda ang GEMINI_MODEL sa serbisyo. Kailangan ito para sa pagsusuri.',
    timeout: 'Masyadong matagal ang pagsusuri. Subukan muli o gamitin ang halimbawa.',
    low: 'Hindi pa kami sigurado. Humingi ng payo sa lokal na opisyal ng agrikultura.',
    differ: 'Magkaiba ang mga pagsusuri. Humingi ng payo sa lokal na opisyal ng agrikultura.',
    detector: 'Posibleng kalagayan ito na iminungkahi ng Roboflow; hindi ito kumpirmadong sakit.',
  },
}
export const message = (code, language) => messages[['bisaya', 'filipino', 'english'].includes(language) ? language : 'bisaya'][code] || messages.bisaya.failed
export const possibleName = (name, language) => `${language === 'english' ? 'Possible' : 'Posibleng'} ${name}`
export const localCondition = (id, language) => {
  if (language === 'english') return null
  const names = {
    'banana-healthy': ['himsog tan-awon nga saging', 'malusog tingnang saging'],
    'banana-black-and-yellow-sigatoka': ['itom o dalag nga Sigatoka', 'itim o dilaw na Sigatoka'],
    'banana-panama-wilt': ['pagkalaya nga Panama', 'pagkalantang Panama'],
    'banana-fruit-scarring-beetle-damage': ['kadaot sa bakukang sa bunga', 'pinsala ng salagubang sa bunga'],
    'cacao-healthy': ['himsog tan-awon nga kakaw', 'malusog tingnang kakaw'],
    'cacao-black-pod-rot': ['pagkadunot sa bunga sa kakaw', 'pagkabulok ng bunga ng kakaw'],
    'cacao-frosty-pod': ['Frosty pod sa kakaw', 'Frosty pod sa kakaw'],
    'cacao-pod-borer': ['ulod nga mosulod sa bunga', 'uod na bumubutas sa bunga'],
  }
  return names[id]?.[language === 'filipino' ? 1 : 0]
}
