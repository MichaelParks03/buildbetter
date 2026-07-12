import { useState } from 'react'

// Pulls the readable GPU name out of strings like
// "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002503) Direct3D11 vs_5_0 ps_5_0, D3D11)"
function cleanGpuName(renderer) {
  const text = String(renderer || '')
  const angleMatch = text.match(/^ANGLE \((.+)\)$/)
  if (!angleMatch) return text

  const inner = angleMatch[1]
  const segments = inner.split(',').map((segment) => segment.trim())
  const candidate = segments.length >= 2 ? segments[1] : segments[0]

  return candidate
    .replace(/\(0x[0-9A-Fa-f]+\)/g, '')
    .replace(/Direct3D\d+.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function detectBrowserSpecs() {
  const specs = { gpu: '', cores: 0, ramHint: '' }

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      const renderer = ext
        ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER)
      specs.gpu = cleanGpuName(renderer)
    }
  } catch {
    // Some browsers block this — that's fine, we just detect less.
  }

  specs.cores = Number(navigator.hardwareConcurrency) || 0

  // deviceMemory is capped at 8 by browsers, so it can only say "at least".
  const deviceMemory = Number(navigator.deviceMemory) || 0
  if (deviceMemory >= 8) specs.ramHint = 'at least 8GB'
  else if (deviceMemory > 0) specs.ramHint = `about ${deviceMemory}GB`

  return specs
}

const PASTE_STEPS = [
  'Press the Windows key, type "System Information", and press Enter.',
  'In the window that opens: click Edit, then Select All, then press Ctrl+C.',
  'Come back here and paste it into the box below.',
]

function AutoFillSystemInfo({
  systemInfoText,
  detectedSpecs,
  isParsing,
  onTextChange,
  onAutoFill,
  onBrowserGpu,
}) {
  const [showHelp, setShowHelp] = useState(false)
  const [browserSpecs, setBrowserSpecs] = useState(null)

  const detectedItems = [
    ['CPU', detectedSpecs?.cpu],
    ['GPU', detectedSpecs?.gpu],
    ['RAM', detectedSpecs?.ram],
    ['Storage', detectedSpecs?.storage],
    ['Motherboard', detectedSpecs?.motherboard],
    ['OS', detectedSpecs?.os],
  ].filter((item) => item[1])

  function handleBrowserDetect() {
    const specs = detectBrowserSpecs()
    setBrowserSpecs(specs)
    if (specs.gpu) {
      onBrowserGpu(specs.gpu)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
        Auto-Fill From System Info
      </p>
      <div className="mt-2 flex items-center gap-2">
        <h3 className="text-xl font-bold text-white">
          Paste Windows System Information
        </h3>
        <button
          type="button"
          aria-label="Where do I find my system information?"
          onClick={() => setShowHelp((current) => !current)}
          onBlur={() => setShowHelp(false)}
          className="relative flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 text-sm font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          i
          {showHelp && (
            <span className="absolute left-1/2 top-8 z-10 w-72 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900 p-4 text-left text-sm font-normal normal-case text-slate-200 shadow-xl">
              <span className="mb-2 block font-semibold text-white">
                Where to find your system info:
              </span>
              <span className="block space-y-1">
                {PASTE_STEPS.map((step, index) => (
                  <span key={step} className="block">
                    {index + 1}. {step}
                  </span>
                ))}
              </span>
              <span className="mt-2 block text-slate-400">
                Shortcut: Settings → System → About works too — copy the
                "Device specifications" text.
              </span>
            </span>
          )}
        </button>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Paste your Windows System Information text below and BuildBetter fills
        in the parts it recognizes. Click the ⓘ for exact steps.
      </p>
      <textarea
        value={systemInfoText}
        onChange={(event) => onTextChange(event.target.value)}
        placeholder="Paste your System Information text here..."
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

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onAutoFill}
          disabled={isParsing}
          className="rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isParsing ? 'Reading Specs...' : 'Auto-Fill My Specs'}
        </button>
        <button
          type="button"
          onClick={handleBrowserDetect}
          className="rounded-xl border border-slate-600 px-5 py-3 font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          Detect From This Browser
        </button>
      </div>

      {browserSpecs && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm">
          <p className="mb-2 font-semibold text-slate-300">
            What your browser can see:
          </p>
          <ul className="space-y-1 text-slate-400">
            <li>
              Graphics: {browserSpecs.gpu ? (
                <span className="text-slate-200">{browserSpecs.gpu} (added to the form)</span>
              ) : (
                'your browser kept this hidden'
              )}
            </li>
            {browserSpecs.cores > 0 && <li>Processor cores: <span className="text-slate-200">{browserSpecs.cores}</span></li>}
            {browserSpecs.ramHint && <li>Memory: <span className="text-slate-200">{browserSpecs.ramHint}</span> (browsers can’t see the exact amount)</li>}
          </ul>
          <p className="mt-2 text-slate-500">
            Browsers can’t see your exact CPU model, motherboard, storage, or
            power supply — pasting your system info above is still the best way.
          </p>
        </div>
      )}
    </section>
  )
}

export default AutoFillSystemInfo
