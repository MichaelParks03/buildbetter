function SummaryItem({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-200">{value || 'Not entered'}</dd>
    </div>
  )
}

export default SummaryItem
