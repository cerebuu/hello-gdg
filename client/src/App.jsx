import { useEffect, useRef, useState } from 'react'

const photos = {
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=1100&q=78',
  cacao: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1100&q=78',
  farm: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1500&q=80',
}

const copy = {
  bisaya: {
    subtitle: 'Tabang sa pag-ila sa sakit sa tanom',
    welcome: 'Ampingi ang imong mga tanom!',
    intro: 'I-upload ang litrato sa dahon o bunga aron masusi ang posibleng sakit.',
    chooseCrop: 'Pilia ang imong tanom',
    takePhoto: 'Kuha og Litrato',
    choosePhoto: 'Pagpili og Litrato',
    photoTip: 'Kuhai og klaro ang apektadong bahin. Siguroha nga hayag ang litrato.',
    supported: 'Gisuportahang tanom',
    banana: 'Saging',
    cacao: 'Cacao',
    online: 'Online',
    offline: 'Walay koneksyon',
    saved: 'na-save',
    home: 'Home',
    savedPhotos: 'Mga Litrato',
    help: 'Tabang',
    result: 'Resulta sa Pagsusi',
    report: 'Paghimo og Report',
    offlineTitle: 'Walay internet sa pagkakaron',
    offlineText: 'Dili pa magamit ang online nga pagsusi. I-save lang ang litrato ug ipadala kon makakonektar na.',
    savePhoto: 'I-save ang litrato dinhi',
    retry: 'Sulayi pag-usab',
    savedTitle: 'Mga litrato nga na-save',
    emptySaved: 'Wala pay na-save nga litrato.',
    reportTitle: 'Preview sa Report',
    share: 'I-share sa Agri Office',
    saveReport: 'I-save ang report sa device',
    helpTitle: 'Ania mi aron motabang',
    helpText: 'Ang Bisaya Crop Doctor makatabang sa pag-ila sa posibleng sakit sa saging ug cacao. Dili kini kapuli sa tambag sa eksperto.',
    supportTitle: 'Pangayo og tabang sa eksperto',
    supportText: 'Kon nagkadaghan ang sakit o dili ka sigurado sa resulta, pangayo og tabang sa agricultural technician sa inyong barangay.',
    backHome: 'Balik sa Home',
    analyzing: 'Gisusi ang litrato…',
    analyze: 'Tan-awa ang sample nga resulta',
    startHere: 'SUGOD DINHI',
    uploadStep: 'I-upload o kuhaa ang hulagway',
    goodPhoto: 'Maayong hulagway, mas maayong tabang.',
    photoHelp: 'Kuhaa ang dahon o bunga nga duol ug klaro ang makita nga kadaot.',
    farmRegion: 'Davao Region · Para sa atong mag-uuma',
    farmCredit: 'Gibuhat alang sa mga mag-uuma sa Davao',
    readyTitle: 'Andam mosusi',
    readyText: 'Online ka karon. Ang litrato ipadala alang sa demo nga pagsusi.',
    plantsDescription: 'Duha ka tanom sa atong rehiyon',
    plantParts: 'Mga dahon ug bunga',
    analysisDemo: 'Sample nga demonstrasyon · Dili tinuod nga AI diagnosis',
    diseaseLabel: 'POSIBLENG SAKIT',
    nextSteps: 'SUNOD NGA MGA LAKANG',
    nextStepsTitle: 'Unsay angay buhaton?',
    aiConfidence: 'Kasiguroan sa AI',
    confidenceNote: 'Sample nga confidence alang sa demonstrasyon',
    reportSubtitle: 'Ulat sa kahimtang sa tanom · Sample',
    reportDate: 'Petsa ug oras sa pagsumite',
    reportSteps: 'Girekomendang mga lakang',
    reportDisclaimer: 'Sample report lamang. Prediction sa AI, dili kumpirmadong diagnosis. Ang lokasyon boluntaryo; wala kini ipaambit gawas kon imong gisulat.',
    queueTitle: 'Hulaton ang koneksyon',
    noSavedPhotos: 'Wala pay litrato nga gihulat. I-save ang hulagway aron makasugod.',
    waiting: 'Naghulat',
    waitingPhoto: 'Naghulat nga ipadala',
    noDiagnosis: 'Wala pa masusi',
    offlineTruth: 'Ang pag-save sa litrato dili magpasabot nga adunay resulta sa AI. Wala pay diagnosis hangtod makakonektar na.',
    retryHint: 'Mobalik ang pagsulay kon mobalik ang koneksyon.',
    offlineQueueIntro: 'Mga litrato nga gi-save samtang walay internet.',
    emptySavedText: 'Kon walay koneksyon, i-save ang litrato dinhi aron ipadala sa ulahi.',
    reportLocation: 'Lokasyon',
    expertRecommendation: 'Pakigsulti sa inyong agricultural technician.',
    reportLocationPlaceholder: 'Pananglitan: Davao del Sur',
  },
  filipino: {
    subtitle: 'Tulong sa pagtukoy ng sakit ng halaman',
    welcome: 'Alagaan ang iyong mga pananim!',
    intro: 'Mag-upload ng larawan ng dahon o bunga para masuri ang posibleng sakit.',
    chooseCrop: 'Piliin ang iyong pananim',
    takePhoto: 'Kumuha ng Larawan',
    choosePhoto: 'Pumili ng Larawan',
    photoTip: 'Kunan nang malinaw ang apektadong bahagi. Tiyaking maliwanag ang larawan.',
    supported: 'Mga pananim na sakop',
    banana: 'Saging',
    cacao: 'Cacao',
    online: 'Online',
    offline: 'Walang koneksyon',
    saved: 'naka-save',
    home: 'Home',
    savedPhotos: 'Mga Larawan',
    help: 'Tulong',
    result: 'Resulta ng Pagsusuri',
    report: 'Gumawa ng Report',
    offlineTitle: 'Walang internet sa ngayon',
    offlineText: 'Hindi muna magagamit ang online na pagsusuri. I-save ang larawan at ipadala kapag may koneksyon na.',
    savePhoto: 'I-save ang larawan dito',
    retry: 'Subukan muli',
    savedTitle: 'Mga naka-save na larawan',
    emptySaved: 'Wala pang naka-save na larawan.',
    reportTitle: 'Preview ng Report',
    share: 'Ibahagi sa Agri Office',
    saveReport: 'I-save ang report sa device',
    helpTitle: 'Nandito kami para tumulong',
    helpText: 'Tumutulong ang Bisaya Crop Doctor na tukuyin ang posibleng sakit ng saging at cacao. Hindi ito kapalit ng payo ng eksperto.',
    supportTitle: 'Humingi ng tulong sa eksperto',
    supportText: 'Kung lumalala ang sakit o hindi ka sigurado sa resulta, humingi ng tulong sa agricultural technician sa inyong barangay.',
    backHome: 'Bumalik sa Home',
    analyzing: 'Sinusuri ang larawan…',
    analyze: 'Tingnan ang sample na resulta',
    startHere: 'MAGSIMULA DITO',
    uploadStep: 'Mag-upload o kumuha ng larawan',
    goodPhoto: 'Malinaw na larawan, mas mabuting tulong.',
    photoHelp: 'Kunan nang malapitan ang dahon o bunga para malinaw ang pinsala.',
    farmRegion: 'Rehiyon ng Davao · Para sa ating mga magsasaka',
    farmCredit: 'Para sa mga magsasaka ng Davao',
    readyTitle: 'Handa nang magsuri',
    readyText: 'May internet ka. Ipapadala ang larawan para sa demo na pagsusuri.',
    plantsDescription: 'Dalawang pananim sa ating rehiyon',
    plantParts: 'Mga dahon at bunga',
    analysisDemo: 'Sample na demonstrasyon · Hindi totoong AI diagnosis',
    diseaseLabel: 'POSIBLENG SAKIT',
    nextSteps: 'MGA SUSUNOD NA HAKBANG',
    nextStepsTitle: 'Ano ang dapat gawin?',
    aiConfidence: 'Tiwala ng AI',
    confidenceNote: 'Sample na confidence para sa demonstrasyon',
    reportSubtitle: 'Ulat sa kalagayan ng pananim · Sample',
    reportDate: 'Petsa at oras ng pagsusumite',
    reportSteps: 'Mga inirerekomendang hakbang',
    reportDisclaimer: 'Sample report lamang. Hula ng AI, hindi kumpirmadong diagnosis. Opsyonal ang lokasyon; hindi ito ibabahagi maliban kung ilalagay mo.',
    queueTitle: 'Hintayin ang koneksyon',
    noSavedPhotos: 'Wala pang larawang naghihintay. I-save ang larawan para makapagsimula.',
    waiting: 'Naghihintay',
    waitingPhoto: 'Naghihintay ipadala',
    noDiagnosis: 'Hindi pa nasusuri',
    offlineTruth: 'Hindi nangangahulugang may resulta ng AI ang pag-save ng larawan. Wala pang diagnosis hangga’t walang koneksyon.',
    retryHint: 'Subukan muli kapag bumalik na ang koneksyon.',
    offlineQueueIntro: 'Mga larawang na-save habang walang internet.',
    emptySavedText: 'Kapag walang koneksyon, i-save ang larawan dito para maipadala sa ibang pagkakataon.',
    reportLocation: 'Lokasyon',
    expertRecommendation: 'Kumonsulta sa inyong agricultural technician.',
    reportLocationPlaceholder: 'Halimbawa: Davao del Sur',
  },
}

const recommendations = {
  banana: [
    ['Unsa ang buhaton karon?', 'Putla ug tangtanga ang mga dahon nga daghan og itom nga mga tuldok. Ayaw kini ibilin sa yuta.'],
    ['Unsaon pagpugong sa pagkaylap?', 'Limpyohi ang mga gunting human gamita. Hatagi og igong gilay-on ang mga punoan ug ayaw bas-a ang mga dahon.'],
    ['Kanus-a mangayo og tabang?', 'Kon mokatag ang mga tuldok bisan natangtang na ang mga dahon, pakigsulti sa inyong agricultural technician.'],
  ],
  cacao: [
    ['Unsa ang buhaton karon?', 'Kuhaa ang bunga nga nangitom o nangadunot. Ibutang kini sa layo sa mga himsog nga punoan.'],
    ['Unsaon pagpugong sa pagkaylap?', 'Kuhaa ang mga sagbot ug palig-ona ang agianan sa hangin taliwala sa mga sanga. Susiha kanunay ang mga bunga.'],
    ['Kanus-a mangayo og tabang?', 'Kon daghang bunga ang maapektuhan o dili ka sigurado, pakigsulti sa inyong agricultural technician.'],
  ],
}

const recommendationsFilipino = {
  banana: [
    ['Ano ang dapat gawin ngayon?', 'Putulin at alisin ang mga dahong maraming maiitim na batik. Huwag iwan ang mga ito sa lupa.'],
    ['Paano mapipigilan ang pagkalat?', 'Linisin ang gunting pagkatapos gamitin. Bigyan ng sapat na pagitan ang mga puno at iwasang mabasa ang mga dahon.'],
    ['Kailan hihingi ng tulong?', 'Kung kumakalat pa ang mga batik kahit naalis na ang mga dahon, kumonsulta sa inyong agricultural technician.'],
  ],
  cacao: [
    ['Ano ang dapat gawin ngayon?', 'Alisin ang mga nangingitim o nabubulok na bunga. Ilayo ang mga ito sa malulusog na puno.'],
    ['Paano mapipigilan ang pagkalat?', 'Alisin ang mga damo at panatilihing maaliwalas ang pagitan ng mga sanga. Regular na suriin ang mga bunga.'],
    ['Kailan hihingi ng tulong?', 'Kung maraming bunga ang apektado o hindi ka sigurado, kumonsulta sa inyong agricultural technician.'],
  ],
}

function Icon({ name, size = 20, ...props }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...props }
  const paths = {
    leaf: <><path d="M20.8 3.2C12 3.2 5.1 5.3 4 11.2c-.8 4.3 2.7 7 6.1 6.3 4.3-.9 7.8-6.7 10.7-14.3Z" /><path d="M3 21c2.4-5.3 6.1-8.6 11.2-11.1" /></>,
    camera: <><path d="M14 5H9L7.5 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2.5L15 5h-1Z" /><circle cx="12" cy="13" r="3.5" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.4" /><path d="m21 15-5-5L5 20" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    wifi: <><path d="M5 9a11 11 0 0 1 14 0" /><path d="M8 12a6.5 6.5 0 0 1 8 0" /><path d="M11 15a2 2 0 0 1 2 0" /><path d="M12 19h.01" /></>,
    wifiOff: <><path d="M3 3 21 21" /><path d="M5 9a11 11 0 0 1 14 0M8 12a6.5 6.5 0 0 1 3-1.5M11 15a2 2 0 0 1 2 0M12 19h.01" /></>,
    arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    back: <><path d="m15 18-6-6 6-6" /><path d="M9 12h11" /></>,
    plant: <><path d="M12 21v-9" /><path d="M12 12C4 12 4 5 4 5c5.5 0 8 2.7 8 7ZM12 15c0-5 3-8 8-8 0 0 0 8-8 8Z" /><path d="M6 21h12" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.7 6.8-4.4M8.6 13.3l6.8 4.4" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 1 1 4.7 1.2c-.8 1.2-2.3 1.3-2.3 3" /><path d="M12 17h.01" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    sprout: <><path d="M12 21v-9" /><path d="M12 12C5 12 5 5 5 5c5 0 7 3 7 7ZM12 15c0-5 3-8 7-8 0 0 0 8-7 8Z" /></>,
  }
  return <svg {...common}>{paths[name] || paths.leaf}</svg>
}

function Brand({ t, onHome }) {
  return (
    <button className="brand" onClick={onHome} aria-label="Bisaya Crop Doctor home">
      <span className="brand-mark"><Icon name="leaf" size={24} /></span>
      <span className="brand-copy"><strong>Bisaya Crop Doctor</strong><small>{t.subtitle}</small></span>
    </button>
  )
}

function App() {
  const [language, setLanguage] = useState('bisaya')
  const [page, setPage] = useState('home')
  const [crop, setCrop] = useState('banana')
  const [online, setOnline] = useState(true)
  const [photo, setPhoto] = useState(null)
  const [savedPhotos, setSavedPhotos] = useState([])
  const [notice, setNotice] = useState('')
  const [location, setLocation] = useState('')
  const fileInput = useRef(null)
  const t = copy[language]
  const localizedRecommendations = language === 'filipino' ? recommendationsFilipino : recommendations

  useEffect(() => {
    document.documentElement.lang = language === 'filipino' ? 'fil' : 'ceb'
  }, [language])

  function showNotice(message) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3600)
  }

  function runAnalysis(selectedCrop = crop, selectedPhoto = null) {
    setCrop(selectedCrop)
    if (selectedPhoto) setPhoto(selectedPhoto)
    if (!online) {
      setPage('offline')
      return
    }
    setPhoto(selectedPhoto || photos[selectedCrop])
    setPage('result')
  }

  function handleFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showNotice('Palihog pagpili og hulagway nga litrato.')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => runAnalysis(crop, reader.result)
    reader.onerror = () => showNotice('Wala mabasa ang litrato. Sulayi pag-usab.')
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  async function saveOfflinePhoto() {
    try {
      let savedImage = photo || photos[crop]
      let imageBlob
      if (!savedImage.startsWith('data:')) {
        const response = await fetch(savedImage)
        if (!response.ok) throw new Error(`Image download failed: ${response.status}`)
        imageBlob = await response.blob()
        savedImage = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(new Error('Unable to read downloaded image'))
          reader.readAsDataURL(imageBlob)
        })
      } else {
        const response = await fetch(savedImage)
        if (!response.ok) throw new Error(`Image conversion failed: ${response.status}`)
        imageBlob = await response.blob()
      }
      const item = { id: Date.now(), crop, photo: savedImage, date: new Date().toLocaleDateString('en-PH') }
      setSavedPhotos((current) => [item, ...current])
      const downloadUrl = URL.createObjectURL(imageBlob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `crop-photo-${item.id}.jpg`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000)
      showNotice('Na-save ang litrato. Wala pay resulta sa AI.')
    } catch (error) {
      console.error('Unable to save crop photo for offline submission.', error)
      showNotice('Wala ma-save ang litrato. Susiha ang koneksyon ug sulayi pag-usab.')
    }
  }

  function toggleConnection() {
    if (online) {
      setOnline(false)
      setPage('offline')
      return
    }
    setOnline(true)
  }

  function downloadReport() {
    const report = {
      title: 'Bisaya Crop Doctor — Sample Report',
      crop: t[crop],
      predictedDisease: crop === 'banana' ? 'Black Sigatoka' : 'Black Pod Rot',
      confidence: crop === 'banana' ? '87%' : '91%',
      submittedAt: new Date().toLocaleString('en-PH'),
      location: location || 'Wala gihatag',
      recommendations: localizedRecommendations[crop].map((item) => item[1]),
      note: 'Sample demonstration only. AI prediction, not a confirmed diagnosis.',
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'bisaya-crop-doctor-report.json'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    showNotice('Na-save ang report sa imong device.')
  }

  function shareReport() {
    showNotice('Demo lamang: gi-simulate ang malampusong pag-share sa Agri Office.')
  }

  function startPhotoFlow() {
    if (!online) {
      setPhoto(null)
      setPage('offline')
      return
    }
    runAnalysis()
  }

  const disease = crop === 'banana' ? 'Black Sigatoka' : 'Black Pod Rot'
  const confidence = crop === 'banana' ? 87 : 91
  const section = page === 'result' || page === 'report' || page === 'offline' ? 'home' : page

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Brand t={t} onHome={() => setPage('home')} />
          <div className="top-actions">
            <div className="language-switch" aria-label="Pilia ang pinulongan">
              <button className={language === 'bisaya' ? 'active' : ''} onClick={() => setLanguage('bisaya')}>Bisaya</button>
              <button className={language === 'filipino' ? 'active' : ''} onClick={() => setLanguage('filipino')}>Filipino</button>
            </div>
            <button className={`connection-pill ${online ? 'is-online' : 'is-offline'}`} onClick={toggleConnection} aria-label={online ? 'Switch to offline demo state' : 'Switch to online demo state'}>
              <Icon name={online ? 'wifi' : 'wifiOff'} size={16} />
              <span>{online ? t.online : t.offline}</span>
            </button>
          </div>
        </div>
      </header>
      <input ref={fileInput} className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={handleFile} aria-label={language === 'filipino' ? 'Pumili ng larawan ng halaman' : 'Pilia ang hulagway sa tanom'} />

      <main className="main-layout">
        <div className="page-wrap">
          {page !== 'home' && page !== 'saved' && page !== 'help' && (
            <button className="back-link" onClick={() => setPage(page === 'report' ? 'result' : 'home')}><Icon name="back" size={17} /> {t.backHome}</button>
          )}

          {page === 'home' && (
            <>
              <section className="hero-card">
                <img className="hero-photo" src={photos.farm} alt="Lush green fields in a tropical farming landscape" />
                <div className="hero-overlay" />
                <svg className="hero-art" viewBox="0 0 280 240" role="img" aria-label={language === 'filipino' ? 'Magsasakang nagsusuri ng halaman' : 'Mag-uuma nga nagsusi sa tanom'}>
                  <circle cx="146" cy="128" r="101" fill="#dce7c2" opacity=".32" />
                  <path d="M27 212V148m0 25c-23-3-25-26-25-26 19-1 25 11 25 26Zm0-14c22-3 24-25 24-25-18-1-24 11-24 25Zm0-24c-15-6-12-26-12-26 15 4 18 16 12 26Z" fill="#9db879" />
                  <path d="M248 215V136m0 37c-27-4-29-31-29-31 22-1 29 13 29 31Zm0-20c25-4 27-29 27-29-20-1-27 13-27 29Zm0-27c-17-8-13-30-13-30 17 5 20 19 13 30Z" fill="#b5c98b" />
                  <path d="M91 220c6-30 16-47 40-52l13-3 16 4c24 6 33 22 38 51Z" fill="#d89b62" />
                  <path d="M108 220c4-22 12-37 30-43 5 11 18 11 24 0 19 7 26 22 30 43Z" fill="#537b54" />
                  <path d="M122 91c0-20 11-33 28-33s28 13 28 33v16c0 17-12 29-28 29s-28-12-28-29Z" fill="#c98155" />
                  <path d="M119 85c2-22 14-35 32-35 15 0 27 11 30 31-10-2-21-8-27-15-7 10-19 16-35 19Z" fill="#342f25" />
                  <path d="M112 64c5-18 20-28 40-28s35 10 40 28h-80Z" fill="#d9bd78" stroke="#f3e4b6" strokeWidth="3" />
                  <path d="M106 67h92c-2 8-19 13-46 13s-44-5-46-13Z" fill="#c8a761" />
                  <path d="M126 104h1m42 0h1" stroke="#44392d" strokeWidth="4" strokeLinecap="round" />
                  <path d="M141 117c5 4 10 4 15 0" stroke="#754933" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M107 177c-14-14-23-31-22-48 1-10 10-13 16-5 6 10 11 22 20 31" fill="none" stroke="#c98155" strokeWidth="12" strokeLinecap="round" />
                  <path d="M84 128c-13-9-20-20-19-30 16 1 25 10 28 25" fill="#84aa67" stroke="#e3f0d3" strokeWidth="2" />
                  <path d="M84 128c3-12 9-19 19-24" fill="none" stroke="#4f7b4d" strokeWidth="2" />
                  <path d="M111 224h82" stroke="#d5c491" strokeWidth="5" strokeLinecap="round" />
                </svg>
                <div className="hero-content">
                  <span className="eyebrow"><Icon name="sprout" size={15} /> {t.farmRegion}</span>
                  <h1>{t.welcome}</h1>
                  <p>{t.intro}</p>
                  <a href="#upload" className="hero-link">Atimanon nato ang uma <Icon name="arrow" size={16} /></a>
                </div>
                <div className="hero-stamp"><Icon name="leaf" size={21} /><span>Giya sa<br />atong uma</span></div>
              </section>

              <section className="home-grid">
                <div className="main-column">
                  <section className="upload-card" id="upload">
                    <div className="section-heading">
                      <div><span className="step-label">{t.startHere}</span><h2>{t.chooseCrop}</h2></div>
                      <span className="step-number">01</span>
                    </div>
                    <div className="crop-options">
                      <button className={`crop-option ${crop === 'banana' ? 'selected' : ''}`} onClick={() => setCrop('banana')} aria-pressed={crop === 'banana'}>
                        <img src={photos.banana} alt="" /><span className="crop-meta"><strong>{t.banana}</strong><small>Banana</small></span>
                        {crop === 'banana' && <span className="crop-check"><Icon name="check" size={14} /></span>}
                      </button>
                      <button className={`crop-option ${crop === 'cacao' ? 'selected' : ''}`} onClick={() => setCrop('cacao')} aria-pressed={crop === 'cacao'}>
                        <img src={photos.cacao} alt="" /><span className="crop-meta"><strong>{t.cacao}</strong><small>Theobroma cacao</small></span>
                        {crop === 'cacao' && <span className="crop-check"><Icon name="check" size={14} /></span>}
                      </button>
                    </div>
                    <div className="upload-divider"><span>02</span><p>{t.uploadStep}</p></div>
                    <div className="upload-actions">
                      <button className="button-primary" onClick={startPhotoFlow}><Icon name="camera" size={20} />{t.takePhoto}<Icon name="arrow" size={17} /></button>
                      <button className="button-secondary" onClick={() => fileInput.current?.click()}><Icon name="image" size={19} />{t.choosePhoto}</button>
                    </div>
                    <p className="photo-tip"><Icon name="check" size={15} />{t.photoTip}</p>
                    <button className="sample-link" onClick={() => startPhotoFlow()}>{t.analyze} <Icon name="arrow" size={14} /></button>
                  </section>

                  <div className="tip-strip"><span className="tip-icon"><Icon name="help" size={18} /></span><p><strong>{t.goodPhoto}</strong> {t.photoHelp}</p></div>
                </div>

                <aside className="side-column">
                  <section className="side-card crops-card">
                    <div className="side-card-title"><span className="side-icon"><Icon name="plant" size={19} /></span><div><h3>{t.supported}</h3><p>{t.plantsDescription}</p></div></div>
                    <div className="crop-mini"><img src={photos.banana} alt={t.banana} /><span><strong>{t.banana}</strong><small>{t.plantParts}</small></span><Icon name="arrow" size={16} /></div>
                    <div className="crop-mini"><img src={photos.cacao} alt={t.cacao} /><span><strong>{t.cacao}</strong><small>{t.plantParts}</small></span><Icon name="arrow" size={16} /></div>
                  </section>
                  <section className={`status-card ${online ? '' : 'status-offline'}`}>
                    <div className="status-top"><span className="status-dot" /><strong>{online ? t.readyTitle : t.offline}</strong><Icon name={online ? 'wifi' : 'wifiOff'} size={17} /></div>
                    {online ? <p>{t.readyText}</p> : <p>{t.offlineText}</p>}
                    <button className="saved-count" onClick={() => setPage('saved')}><Icon name="image" size={15} />{savedPhotos.length} {t.saved} nga litrato <Icon name="arrow" size={14} /></button>
                  </section>
                  <div className="trust-note"><Icon name="leaf" size={15} /><span>{t.farmCredit}</span></div>
                </aside>
              </section>
            </>
          )}

          {page === 'result' && (
            <section className="content-page result-page">
              <div className="page-heading"><span className="step-label">{t.supported.toLocaleUpperCase()}</span><h1>{t.result}</h1><p>{t.analysisDemo}</p></div>
              <div className="result-layout">
                <div className="result-left">
                  <div className="photo-preview"><img src={photo || photos[crop]} alt={`Sample nga hulagway sa ${t[crop]}`} /><span className="photo-badge"><Icon name="image" size={14} /> Sample nga hulagway</span></div>
                  <div className="photo-details"><span><Icon name="plant" size={16} />{t[crop]}</span><span><Icon name="clock" size={16} />{new Date().toLocaleDateString('en-PH')}</span></div>
                  <div className="demo-disclaimer"><Icon name="help" size={18} /><p><strong>Timan-i: sample nga prediction kini.</strong> Dili pa konektado ang AI sa prototype. Dili kini kumpirmadong diagnosis.</p></div>
                </div>
                <div className="result-right">
                  <div className="diagnosis-card">
                    <div className="diagnosis-overline"><span className="diagnosis-dot" /> {t.diseaseLabel} <span className="demo-tag">DEMO</span></div>
                    <h2>{disease}</h2>
                    <p className="disease-local">{crop === 'banana' ? 'Sigatoka sa saging' : 'Itom nga pagkadunot sa bunga sa cacao'}</p>
                    <div className="confidence-label"><span>{t.aiConfidence}</span><strong>{confidence}%</strong></div>
                    <div className="confidence-track"><span style={{ width: `${confidence}%` }} /></div>
                    <p className="confidence-note">{t.confidenceNote}</p>
                  </div>
                  <div className="recommendation-heading"><div><span className="step-label">{t.nextSteps}</span><h2>{t.nextStepsTitle}</h2></div><Icon name="leaf" size={21} /></div>
                  <div className="recommendations">{localizedRecommendations[crop].map(([title, text], index) => (
                    <article className="recommendation" key={title}>
                      <span className="rec-number">0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div>
                    </article>
                  ))}</div>
                  <button className="button-primary report-button" onClick={() => setPage('report')}><Icon name="image" size={19} />{t.report}<Icon name="arrow" size={17} /></button>
                </div>
              </div>
            </section>
          )}

          {page === 'report' && (
            <section className="content-page report-page">
              <div className="page-heading"><span className="step-label">ALANG SA PAGPAAMBIT</span><h1>{t.reportTitle}</h1><p>Tan-awa ang detalye sa dili pa ipaambit.</p></div>
              <div className="report-sheet">
                <div className="report-banner"><span className="brand-mark"><Icon name="leaf" size={23} /></span><div><strong>Bisaya Crop Doctor</strong><small>{t.reportSubtitle}</small></div><span className="report-status">DRAFT</span></div>
                <div className="report-top">
                  <img src={photo || photos[crop]} alt={`Sample nga hulagway sa ${t[crop]}`} />
                  <div className="report-diagnosis"><span className="step-label">POSIBLENG SAKIT · DEMO</span><h2>{disease}</h2><p>{t[crop]} <span>·</span> {confidence}% confidence</p></div>
                </div>
                <div className="report-meta">
                  <div><span>{t.reportDate}</span><strong>{new Date().toLocaleString('en-PH')}</strong></div>
                  <label><span><Icon name="pin" size={15} /> {t.reportLocation} <small>(opsyonal)</small></span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder={t.reportLocationPlaceholder} /></label>
                </div>
                <div className="report-steps"><h3>{t.reportSteps}</h3>{localizedRecommendations[crop].map(([title, text], index) => <div className="report-step" key={title}><span>{index + 1}</span><div><strong>{title}</strong><p>{text}</p></div></div>)}</div>
                <p className="report-disclaimer">{t.reportDisclaimer}</p>
                <div className="report-actions"><button className="button-primary" onClick={shareReport}><Icon name="share" size={19} />{t.share}</button><button className="button-secondary" onClick={downloadReport}><Icon name="download" size={18} />{t.saveReport}</button></div>
              </div>
            </section>
          )}

          {page === 'offline' && (
            <section className="content-page offline-page">
              <div className="offline-hero">
                <div className="offline-icon"><Icon name="wifiOff" size={31} /></div>
                <span className="step-label">OFFLINE NGA KAHIMTANG</span>
                <h1>{t.offlineTitle}</h1><p>{t.offlineText}</p>
                <div className="offline-truth"><Icon name="help" size={17} /><span>{t.offlineTruth}</span></div>
                <button className="button-secondary offline-choose" onClick={() => fileInput.current?.click()}><Icon name="image" size={18} />{t.choosePhoto}</button>
                <button className="button-primary" onClick={saveOfflinePhoto}><Icon name="download" size={19} />{t.savePhoto}</button>
                {savedPhotos.length > 0 && <button className="button-text" onClick={() => setPage('saved')}>Tan-awa ang mga na-save nga litrato <Icon name="arrow" size={15} /></button>}
              </div>
              <div className="offline-queue"><div className="queue-heading"><div><span className="step-label">SA DEVICE NIMO</span><h2>{t.queueTitle}</h2></div><span className="queue-count">{savedPhotos.length}</span></div>
                {savedPhotos.length === 0 ? <p className="queue-empty">{t.noSavedPhotos}</p> : savedPhotos.map((item) => <div className="queue-item" key={item.id}><img src={item.photo} alt="" /><div><strong>{t[item.crop]}</strong><small>Na-save {item.date} · {t.waitingPhoto}</small></div><span className="pending-pill">{t.waiting}</span></div>)}
                <button className="button-secondary retry-button" disabled={!online} onClick={() => savedPhotos.length ? runAnalysis(savedPhotos[0].crop, savedPhotos[0].photo) : showNotice('Wala pay hulagway nga ipadala.') }><Icon name="wifi" size={18} />{t.retry}</button>
                {!online && <small className="retry-hint">{t.retryHint}</small>}
              </div>
            </section>
          )}

          {page === 'saved' && (
            <section className="content-page saved-page">
              <div className="page-heading"><span className="step-label">LITRATO SA DEVICE</span><h1>{t.savedTitle}</h1><p>{t.offlineQueueIntro}</p></div>
              <div className="saved-list">
                {savedPhotos.length === 0 ? <div className="empty-state"><span className="empty-icon"><Icon name="image" size={25} /></span><h2>{t.emptySaved}</h2><p>{t.emptySavedText}</p><button className="button-secondary" onClick={() => setPage('home')}>{t.backHome}</button></div> : savedPhotos.map((item) => <article className="saved-row" key={item.id}><img src={item.photo} alt="" /><div className="saved-row-info"><strong>{t[item.crop]}</strong><small>Na-save {item.date}</small><span className="pending-pill">{t.noDiagnosis}</span></div><button className="button-secondary" disabled={!online} onClick={() => runAnalysis(item.crop, item.photo)}>{t.retry}</button></article>)}
              </div>
            </section>
          )}

          {page === 'help' && (
            <section className="content-page help-page">
              <div className="help-hero"><span className="help-hero-icon"><Icon name="plant" size={29} /></span><span className="step-label">GIYA PARA SA MAG-UUMA</span><h1>{t.helpTitle}</h1><p>{t.helpText}</p></div>
              <div className="help-cards"><article className="help-card"><span className="help-card-icon"><Icon name="camera" size={20} /></span><h2>Unsaon pagkuha og litrato?</h2><p>Ibutang ang apektadong dahon o bunga sa maayong kahayag. Duola ang camera aron klaro ang mga marka o kadaot.</p></article><article className="help-card"><span className="help-card-icon"><Icon name="wifiOff" size={20} /></span><h2>Walay internet?</h2><p>Mahimo nimong i-save ang litrato sa imong device. Dili makahatag og diagnosis hangtod makabalik ang koneksyon.</p></article><article className="help-card"><span className="help-card-icon"><Icon name="help" size={20} /></span><h2>{t.supportTitle}</h2><p>{t.supportText}</p></article></div>
              <button className="button-primary help-home" onClick={() => setPage('home')}>{t.backHome}<Icon name="arrow" size={17} /></button>
            </section>
          )}
        </div>
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {[['home', 'plant', t.home], ['saved', 'image', t.savedPhotos], ['help', 'help', t.help]].map(([destination, icon, label]) => (
          <button className={section === destination ? 'active' : ''} key={destination} onClick={() => setPage(destination)} aria-current={section === destination ? 'page' : undefined}><Icon name={icon} size={19} /><span>{label}</span>{destination === 'saved' && savedPhotos.length > 0 && <i>{savedPhotos.length}</i>}</button>
        ))}
      </nav>
      {notice && <div className="toast" role="status"><Icon name="check" size={17} />{notice}</div>}
    </div>
  )
}

export default App
