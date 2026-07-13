import { useState } from 'react'

const ABOUT_STEPS = [
  'Press the Windows key, type "About your PC", and press Enter.',
  'This opens Settings → System → About.',
  'Under "Device specifications", click the Copy button (Windows 11). On Windows 10, select the Processor and Installed RAM lines and copy them.',
  'Come back here and paste it into the box below.',
]

function AutoFillSystemInfo({
  systemInfoText,
  detectedSpecs,
  isParsing,
  onTextChange,
  onAutoFill,
}) {
  const [showHelp, setShowHelp] = useState(false)

  const detectedItems = [
    ['CPU', detectedSpecs?.cpu],
    ['GPU', detectedSpecs?.gpu],
    ['RAM', detectedSpecs?.ram],
    ['Storage', detectedSpecs?.storage],
    ['Motherboard', detectedSpecs?.motherboard],
    ['OS', detectedSpecs?.os],
  ].filter((item) => item[1])

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
        Auto-Fill From System Info
      </p>
      <div className="mt-2 flex items-center gap-2">
        <h3 className="text-xl font-bold text-white">
          Paste your PC info from Windows
        </h3>
        <button
          type="button"
          aria-label="Where do I find my PC info?"
          onClick={() => setShowHelp((current) => !current)}
          onBlur={() => setShowHelp(false)}
          className="relative flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 text-sm font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          i
          {showHelp && (
            <span className="absolute left-1/2 top-8 z-10 w-72 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900 p-4 text-left text-sm font-normal normal-case text-slate-200 shadow-xl">
              <span className="mb-2 block font-semibold text-white">
                How to find your PC info:
              </span>
              <span className="block space-y-1">
                {ABOUT_STEPS.map((step, index) => (
                  <span key={step} className="block">
                    {index + 1}. {step}
                  </span>
                ))}
              </span>
              <span className="mt-2 block text-slate-400">
                The About page covers your processor and RAM. For your graphics
                card and storage too: press the Windows key, type "System
                Information", press Enter, then copy System Summary plus the
                Components sections for Display and Storage, and paste it all
                here together.
              </span>
            </span>
          )}
        </button>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Open <span className="text-slate-200">Settings → System → About</span>,
        copy your Device specifications, and paste them below — BuildBetter fills
        in the parts it recognizes. Click the ⓘ for exact steps.
      </p>
      <textarea
        value={systemInfoText}
        onChange={(event) => onTextChange(event.target.value)}
        placeholder="Paste your About / Device specifications text here..."
        className="mt-4 min-h-40 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
      />

      {detectedItems.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-300">
            Detected specs
          </p>
          <dl className="grid gap-2 text-sm">
            {detectedItems.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right text-slate-200">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <button
        type="button"
        onClick={onAutoFill}
        disabled={isParsing}
        className="mt-4 rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isParsing ? 'Reading Specs...' : 'Auto-Fill My Specs'}
      </button>
    </section>
  )
}

export default AutoFillSystemInfo
