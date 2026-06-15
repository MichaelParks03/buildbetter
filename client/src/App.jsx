import { useMemo, useState } from 'react'

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

const useCaseUpgradeMap = {
  Gaming: {
    bottleneck: 'GPU',
    firstUpgrade: 'Graphics card',
    reason:
      'Gaming performance usually depends most on the GPU, especially at 1080p high settings and above.',
  },
  School: {
    bottleneck: 'Storage or RAM',
    firstUpgrade: 'SSD or memory',
    reason:
      'Schoolwork benefits most from a responsive system with enough memory for browser tabs, documents, and video calls.',
  },
  CAD: {
    bottleneck: 'CPU, GPU, or RAM',
    firstUpgrade: 'CPU or workstation-friendly GPU',
    reason:
      'CAD workloads can need strong CPU performance, plenty of memory, and a capable GPU depending on the software.',
  },
  Streaming: {
    bottleneck: 'CPU or GPU encoder',
    firstUpgrade: 'CPU or modern GPU',
    reason:
      'Streaming needs enough game performance plus extra encoding headroom so the stream stays smooth.',
  },
  'General Use': {
    bottleneck: 'Storage',
    firstUpgrade: 'SSD',
    reason:
      'For everyday use, an SSD is often the most noticeable upgrade because it improves startup and app loading times.',
  },
}

function getSystemInfoValue(systemInfoText, label) {
  const lines = systemInfoText.split(/\r?\n/)
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matchingLine = lines.find((line) =>
    line.trim().toLowerCase().startsWith(label.toLowerCase()),
  )

  if (!matchingLine) return ''

  return matchingLine
    .trim()
    .replace(new RegExp(`^${escapedLabel}\\s*`, 'i'), '')
    .trim()
}

function parseSystemInfo(systemInfoText) {
  const cpu = getSystemInfoValue(systemInfoText, 'Processor')
  const ram = getSystemInfoValue(systemInfoText, 'Installed Physical Memory (RAM)')
  const systemModel = getSystemInfoValue(systemInfoText, 'System Model')
  const boardManufacturer = getSystemInfoValue(
    systemInfoText,
    'BaseBoard Manufacturer',
  )
  const boardProduct = getSystemInfoValue(systemInfoText, 'BaseBoard Product')
  const gpu =
    getSystemInfoValue(systemInfoText, 'Name') ||
    getSystemInfoValue(systemInfoText, 'Adapter Description')

  const motherboard = [boardManufacturer, boardProduct]
    .filter(Boolean)
    .join(' ')

  return {
    cpu,
    gpu: gpu.includes('Microsoft') ? '' : gpu,
    ram,
    motherboard,
    caseName: systemModel,
  }
}

function getBudgetNumber(budget) {
  const cleanedBudget = String(budget).replace(/[^0-9.]/g, '')
  return Number(cleanedBudget) || 0
}

function estimateUsedValue(formData) {
  const knownParts = [
    formData.cpu,
    formData.gpu,
    formData.ram,
    formData.storage,
    formData.motherboard,
  ].filter(Boolean).length

  if (knownParts >= 5) return '$550 - $900'
  if (knownParts >= 3) return '$350 - $650'
  if (knownParts >= 1) return '$150 - $400'
  return 'Add more parts for an estimate'
}

function getUpgradePath(budget) {
  if (budget >= 1200) {
    return [
      'Replace the main bottleneck part first.',
      'Upgrade any support parts needed for compatibility, like power supply or motherboard.',
      'Use remaining budget for cooling, storage, or monitor improvements.',
    ]
  }

  if (budget >= 700) {
    return [
      'Buy the best first upgrade that fits your current motherboard and power supply.',
      'Add RAM or storage if the system still feels limited.',
      'Keep a small budget buffer for cables, adapters, or a power supply upgrade.',
    ]
  }

  if (budget >= 300) {
    return [
      'Focus on one high-impact upgrade instead of replacing several parts.',
      'Compare used and previous-generation parts for better value.',
      'Avoid upgrades that require a new motherboard unless absolutely necessary.',
    ]
  }

  return [
    'Start with the cheapest improvement that solves the biggest daily frustration.',
    'Look for used SSD, RAM, or GPU deals depending on your main use case.',
    'Save toward a larger upgrade if the current platform is too limited.',
  ]
}

function buildRecommendation(formData) {
  const budget = getBudgetNumber(formData.budget)
  const useCaseData = useCaseUpgradeMap[formData.useCase]

  return {
    estimatedValue: estimateUsedValue(formData),
    likelyBottleneck: useCaseData.bottleneck,
    recommendedFirstUpgrade: `${useCaseData.firstUpgrade} upgrade`,
    upgradePath: getUpgradePath(budget),
    explanation:
      `${useCaseData.reason} With a budget of ` +
      `${budget > 0 ? `$${budget}` : 'your entered amount'}, BuildBetter ` +
      `would first compare your current parts against upgrade options that give ` +
      `the biggest real-world improvement for ${formData.useCase.toLowerCase()}. ` +
      'Later, this section can be replaced with an AI-generated explanation and live pricing data.',
  }
}

function App() {
  const [formData, setFormData] = useState(initialFormData)
  const [systemInfoText, setSystemInfoText] = useState('')
  const [results, setResults] = useState(null)
  const parsedPreview = useMemo(
    () => parseSystemInfo(systemInfoText),
    [systemInfoText],
  )

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function handleAutoFill() {
    const parsedSpecs = parseSystemInfo(systemInfoText)

    setFormData((currentData) => ({
      ...currentData,
      cpu: parsedSpecs.cpu || currentData.cpu,
      gpu: parsedSpecs.gpu || currentData.gpu,
      ram: parsedSpecs.ram || currentData.ram,
      motherboard: parsedSpecs.motherboard || currentData.motherboard,
      caseName: parsedSpecs.caseName || currentData.caseName,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setResults(buildRecommendation(formData))
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 px-8 py-12 shadow-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-cyan-400">
            PC Upgrade Recommendation Tool
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            BuildBetter
          </h1>

          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Enter your current PC parts, estimate the value of your build, and
            get smarter upgrade recommendations based on your budget and goals.
          </p>

          <a
            href="#pc-form"
            className="mt-8 inline-flex rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Start PC Check
          </a>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <StepCard
            number="1"
            title="Enter Your Parts"
            description="Add your specs manually or paste Windows System Information."
          />
          <StepCard
            number="2"
            title="Estimate Value"
            description="Get a rough used-value range for your existing build."
          />
          <StepCard
            number="3"
            title="Recommend Upgrades"
            description="See the first upgrade that best matches your budget and goal."
          />
        </div>
      </section>

      <section id="pc-form" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-8"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
                Your Current Build
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Enter your current PC specs
              </h2>
              <p className="mt-2 text-slate-400">
                Fill in what you know. You can also paste Windows System
                Information to auto-fill the parts BuildBetter recognizes.
              </p>
            </div>

            <AutoFillPanel
              parsedPreview={parsedPreview}
              systemInfoText={systemInfoText}
              onAutoFill={handleAutoFill}
              onSystemInfoChange={setSystemInfoText}
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <Input
                label="CPU"
                name="cpu"
                value={formData.cpu}
                onChange={handleChange}
                placeholder="CPU, ex: Ryzen 5 5600X"
                required
              />

              <Input
                label="GPU"
                name="gpu"
                value={formData.gpu}
                onChange={handleChange}
                placeholder="GPU, ex: RTX 3060"
                required
              />

              <Input
                label="RAM"
                name="ram"
                value={formData.ram}
                onChange={handleChange}
                placeholder="RAM, ex: 16GB DDR4"
              />

              <Input
                label="Storage"
                name="storage"
                value={formData.storage}
                onChange={handleChange}
                placeholder="Storage, ex: 1TB SSD"
              />

              <Input
                label="Motherboard"
                name="motherboard"
                value={formData.motherboard}
                onChange={handleChange}
                placeholder="Motherboard, ex: B550"
              />

              <Input
                label="Power Supply"
                name="powerSupply"
                value={formData.powerSupply}
                onChange={handleChange}
                placeholder="Power Supply, ex: 650W Gold"
              />

              <Input
                label="Case or System Model"
                name="caseName"
                value={formData.caseName}
                onChange={handleChange}
                placeholder="Optional"
              />

              <Input
                label="Upgrade Budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Upgrade Budget, ex: $500"
              />

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-300">
                  Main Use Case
                </span>
                <select
                  name="useCase"
                  value={formData.useCase}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option>Gaming</option>
                  <option>School</option>
                  <option>CAD</option>
                  <option>Streaming</option>
                  <option>General Use</option>
                </select>
              </label>

              <button
                type="submit"
                className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 md:col-span-2"
              >
                Analyze My PC
              </button>
            </div>
          </form>

          <Results formData={formData} results={results} />
        </div>
      </section>
    </main>
  )
}

function AutoFillPanel({
  parsedPreview,
  systemInfoText,
  onAutoFill,
  onSystemInfoChange,
}) {
  const detectedItems = [
    ['CPU', parsedPreview.cpu],
    ['GPU', parsedPreview.gpu],
    ['RAM', parsedPreview.ram],
    ['Motherboard', parsedPreview.motherboard],
    ['System Model', parsedPreview.caseName],
  ].filter((item) => item[1])

  return (
    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
        Auto-Fill From System Info
      </p>
      <h3 className="mt-2 text-xl font-bold">
        Paste Windows System Information
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Websites cannot scan your PC without permission, so this MVP uses a
        safer approach: paste the text from Windows System Information and
        BuildBetter will fill in what it can detect.
      </p>

      <textarea
        value={systemInfoText}
        onChange={(event) => onSystemInfoChange(event.target.value)}
        placeholder="Paste your System Information text here..."
        className="mt-4 min-h-40 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
      />

      {detectedItems.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-300">
            Detected specs
          </p>
          <dl className="grid gap-2 text-sm text-slate-400">
            {detectedItems.map(([label, value]) => (
              <SummaryItem key={label} label={label} value={value} />
            ))}
          </dl>
        </div>
      )}

      <button
        type="button"
        onClick={onAutoFill}
        className="mt-4 rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-950 hover:bg-white"
      >
        Auto-Fill My Specs
      </button>
    </section>
  )
}

function Results({ formData, results }) {
  if (!results) {
    return (
      <aside className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center text-slate-400">
        Fill out the form and click Analyze My PC to see your upgrade plan.
      </aside>
    )
  }

  return (
    <aside className="space-y-5 rounded-3xl border border-cyan-900 bg-slate-900 p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
          Recommendation
        </p>
        <h2 className="mt-2 text-3xl font-bold">Your Upgrade Plan</h2>
      </div>

      <ResultCard title="Current Build Summary">
        <dl className="grid gap-2 text-sm text-slate-300">
          <SummaryItem label="CPU" value={formData.cpu} />
          <SummaryItem label="GPU" value={formData.gpu} />
          <SummaryItem label="RAM" value={formData.ram} />
          <SummaryItem label="Storage" value={formData.storage} />
          <SummaryItem label="Motherboard" value={formData.motherboard} />
          <SummaryItem label="Power Supply" value={formData.powerSupply} />
          <SummaryItem label="Case or Model" value={formData.caseName} />
          <SummaryItem label="Budget" value={formData.budget} />
          <SummaryItem label="Use Case" value={formData.useCase} />
        </dl>
      </ResultCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard title="Estimated Used Value">
          <p className="text-2xl font-bold text-cyan-300">
            {results.estimatedValue}
          </p>
        </ResultCard>

        <ResultCard title="Likely Bottleneck">
          <p className="text-2xl font-bold text-cyan-300">
            {results.likelyBottleneck}
          </p>
        </ResultCard>
      </div>

      <ResultCard title="Recommended First Upgrade">
        <p className="text-xl font-semibold text-white">
          {results.recommendedFirstUpgrade}
        </p>
      </ResultCard>

      <ResultCard title="Upgrade Path">
        <ol className="list-inside list-decimal space-y-2 text-slate-300">
          {results.upgradePath.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </ResultCard>

      <ResultCard title="AI Explanation Placeholder">
        <p className="leading-7 text-slate-300">{results.explanation}</p>
      </ResultCard>
    </aside>
  )
}

function StepCard({ number, title, description }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 font-bold text-slate-950">
        {number}
      </div>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-slate-400">{description}</p>
    </article>
  )
}

function Input({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-300">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
      />
    </label>
  )
}

function ResultCard({ title, children }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyan-400">
        {title}
      </h3>
      {children}
    </article>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right">{value || 'Not entered'}</dd>
    </div>
  )
}

export default App
