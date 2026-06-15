function RecommendationCard({ part, path = [] }) {
  return (
    <div>
      <p className="text-xl font-semibold text-white">{part || 'Not available yet'}</p>
      <ol className="mt-4 list-inside list-decimal space-y-2 text-slate-300">
        {path.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  )
}

export default RecommendationCard
