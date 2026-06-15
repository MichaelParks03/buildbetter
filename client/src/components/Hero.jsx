function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 px-8 py-12 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
          PC Upgrade Recommendation Tool
        </p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-white">
          BuildBetter
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          Paste or enter your PC specs, estimate used value, compare demo
          pricing, and get a practical first-upgrade recommendation.
        </p>
        <a
          href="#pc-check"
          className="mt-8 inline-flex rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Start PC Check
        </a>
      </div>
    </section>
  )
}

export default Hero
