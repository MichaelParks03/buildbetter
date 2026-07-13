function LoadingState({ message = 'Working on your recommendation...' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-300"
    >
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-cyan-400" />
      </div>
      <p className="mt-4 text-sm">{message}</p>
    </div>
  )
}

export default LoadingState
