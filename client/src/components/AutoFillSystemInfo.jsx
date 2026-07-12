function AutoFillSystemInfo({
  systemInfoText,
  detectedSpecs,
  isParsing,
  onTextChange,
  onAutoFill,
}) {
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
      <h3 className="mt-2 text-xl font-bold text-white">
        Paste Windows System Information
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Paste your Windows System Information text below. BuildBetter will try
        to fill in the parts it recognizes.
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
