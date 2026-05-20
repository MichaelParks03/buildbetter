import { useState } from 'react'

function App() {
  const [formData, setFormData] = useState({
    cpu: '',
    gpu: '',
    ram: '',
    storage: '',
    motherboard: '',
    powerSupply: '',
    caseName: '',
    budget: '',
    useCase: 'Gaming',
  })

  const [showResults, setShowResults] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setShowResults(true)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-cyan-400">
            PC Upgrade Recommendation Tool
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            BuildBetter
          </h1>

          <p className="mb-8 text-lg leading-8 text-slate-300">
            Enter your current PC parts, estimate the value of your build, and
            get smarter upgrade recommendations based on your budget and goals.
          </p>

          <a
            href="#pc-form"
            className="inline-block rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Start PC Check
          </a>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold">1. Enter Your Parts</h2>
            <p className="text-slate-400">
              Add your CPU, GPU, RAM, storage, power supply, and budget.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold">2. Estimate Value</h2>
            <p className="text-slate-400">
              BuildBetter will help estimate what your current parts are worth.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold">3. Recommend Upgrades</h2>
            <p className="text-slate-400">
              Get upgrade suggestions based on performance, price, and value.
            </p>
          </div>
        </div>
      </section>

      <section id="pc-form" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="mb-2 text-3xl font-bold">Enter Your Current PC</h2>
          <p className="mb-8 text-slate-400">
            Fill out what you know. The case is optional because many people do
            not know their exact case model.
          </p>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <input
              name="cpu"
              value={formData.cpu}
              onChange={handleChange}
              placeholder="CPU, ex: Ryzen 5 5600X"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="gpu"
              value={formData.gpu}
              onChange={handleChange}
              placeholder="GPU, ex: RTX 3060"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="ram"
              value={formData.ram}
              onChange={handleChange}
              placeholder="RAM, ex: 16GB DDR4"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="storage"
              value={formData.storage}
              onChange={handleChange}
              placeholder="Storage, ex: 1TB SSD"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="motherboard"
              value={formData.motherboard}
              onChange={handleChange}
              placeholder="Motherboard, ex: B550"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="powerSupply"
              value={formData.powerSupply}
              onChange={handleChange}
              placeholder="Power Supply, ex: 650W Gold"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="caseName"
              value={formData.caseName}
              onChange={handleChange}
              placeholder="Case, optional"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="Upgrade Budget, ex: $500"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <select
              name="useCase"
              value={formData.useCase}
              onChange={handleChange}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 md:col-span-2"
            >
              <option>Gaming</option>
              <option>School</option>
              <option>CAD</option>
              <option>Streaming</option>
              <option>General Use</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 md:col-span-2"
            >
              Analyze My PC
            </button>
          </form>
        </div>

        {showResults && (
          <div className="mt-8 rounded-3xl border border-cyan-900 bg-slate-900 p-8">
            <h2 className="mb-4 text-3xl font-bold">Mock Results</h2>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                <h3 className="mb-2 text-xl font-semibold">Current Build</h3>
                <p className="text-slate-400">
                  CPU: {formData.cpu || 'Not entered'}
                </p>
                <p className="text-slate-400">
                  GPU: {formData.gpu || 'Not entered'}
                </p>
                <p className="text-slate-400">
                  RAM: {formData.ram || 'Not entered'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                <h3 className="mb-2 text-xl font-semibold">
                  Estimated Value
                </h3>
                <p className="text-slate-400">
                  Estimated used value: $650
                </p>
                <p className="text-slate-400">
                  This is placeholder data for now.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                <h3 className="mb-2 text-xl font-semibold">
                  Upgrade Recommendation
                </h3>
                <p className="text-slate-400">
                  Best first upgrade: GPU
                </p>
                <p className="text-slate-400">
                  Budget target: {formData.budget || 'Not entered'}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default App