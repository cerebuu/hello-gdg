import PhotoUpload from './components/PhotoUpload.jsx'
import LanguageToggle from './components/LanguageToggle.jsx'
import ResultCard from './components/ResultCard.jsx'
import SampleButtons from './components/SampleButtons.jsx'

export default function App() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-6">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Bisaya Crop Doctor</h1>
          <p className="text-stone-600">
            Crop disease guidance for Davao banana and cacao farmers in Bisaya or Filipino.
          </p>
        </header>
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
          This is a decision aid, not a lab diagnosis.
        </p>
        <div className="space-y-4">
          <PhotoUpload />
          <LanguageToggle />
          <ResultCard />
          <SampleButtons />
        </div>
      </div>
    </main>
  )
}
