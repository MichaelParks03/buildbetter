function StepCard({ number, title, description }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 font-bold text-slate-950">
        {number}
      </div>
      <h2 className="mt-4 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 leading-6 text-slate-400">{description}</p>
    </article>
  )
}

export default StepCard
