function ResultCard({ title, badge, children }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
          {title}
        </h3>
        {badge && (
          <span className="rounded-full border border-cyan-900 bg-cyan-950 px-3 py-1 text-xs font-semibold text-cyan-200">
            {badge}
          </span>
        )}
      </div>
      {children}
    </article>
  )
}

export default ResultCard
