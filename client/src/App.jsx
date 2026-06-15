import { useState } from 'react'
import AutoFillSystemInfo from './components/AutoFillSystemInfo'
import ErrorMessage from './components/ErrorMessage'
import Hero from './components/Hero'
import LoadingState from './components/LoadingState'
import Results from './components/Results'
import SpecsForm from './components/SpecsForm'
import StepCard from './components/StepCard'
import { analyzeBuild, parseSystemInfo } from './utils/api'

const initialFormData = {
  cpu: '',
  gpu: '',
  ram: '',
  storage: '',
  motherboard: '',
  powerSupply: '',
  caseName: '',
  budget: '',
  useCase: 'Gaming',
}

function App() {
  const [formData, setFormData] = useState(initialFormData)
  const [systemInfoText, setSystemInfoText] = useState('')
  const [detectedSpecs, setDetectedSpecs] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  async function handleAutoFill() {
    setError('')
    setIsParsing(true)

    try {
      const parsed = await parseSystemInfo(systemInfoText)
      setDetectedSpecs(parsed)
      setFormData((currentData) => ({
        ...currentData,
        cpu: parsed.cpu || currentData.cpu,
        gpu: parsed.gpu || currentData.gpu,
        ram: parsed.ram || currentData.ram,
        storage: parsed.storage || currentData.storage,
        motherboard: parsed.motherboard || currentData.motherboard,
        caseName: parsed.case || parsed.systemModel || currentData.caseName,
      }))
    } catch {
      setError(
        'BuildBetter could not reach the backend parser. Make sure the backend is running on port 5000.',
      )
    } finally {
      setIsParsing(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const budgetNumber = Number(String(formData.budget).replace(/[^0-9.]/g, ''))
    if (formData.budget && (!Number.isFinite(budgetNumber) || budgetNumber <= 0)) {
      setError('Budget should be a positive number.')
      return
    }

    if (!formData.cpu && !formData.gpu) {
      setError('Enter at least a CPU or GPU before analyzing your PC.')
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzeBuild({
        ...formData,
        case: formData.caseName,
        budget: budgetNumber || formData.budget,
      })
      setAnalysis(result)
    } catch (requestError) {
      setError(
        requestError.message ||
          'BuildBetter could not reach the backend. Make sure the backend is running on port 5000.',
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Hero />

      <section className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
        <StepCard
          number="1"
          title="Enter Your Parts"
          description="Fill in your specs manually or paste Windows System Information."
        />
        <StepCard
          number="2"
          title="Check Pricing"
          description="Use mock pricing now, with Best Buy and eBay API scaffolding ready for keys."
        />
        <StepCard
          number="3"
          title="Recommend Upgrades"
          description="Get a backend-powered bottleneck, upgrade path, and explanation."
        />
      </section>

      <section id="pc-check" className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
                Your Current Build
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Enter your current PC specs
              </h2>
              <p className="mt-2 text-slate-400">
                Empty fields are okay. BuildBetter will warn you when it needs
                more information for a better recommendation.
              </p>
            </div>

            <AutoFillSystemInfo
              systemInfoText={systemInfoText}
              detectedSpecs={detectedSpecs}
              isParsing={isParsing}
              onTextChange={setSystemInfoText}
              onAutoFill={handleAutoFill}
            />

            <ErrorMessage message={error} />
            {isAnalyzing && <LoadingState />}

            <SpecsForm
              formData={formData}
              isAnalyzing={isAnalyzing}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          </section>

          <Results analysis={analysis} />
        </div>
      </section>
    </main>
  )
}

export default App
