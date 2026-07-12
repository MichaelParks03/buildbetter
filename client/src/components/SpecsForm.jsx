import { useCases } from '../data/useCases'

function SpecsForm({ formData, isAnalyzing, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <p className="text-sm text-slate-400">
        At least one of CPU or GPU is required.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        <Input label="CPU" name="cpu" value={formData.cpu} onChange={onChange} placeholder="Example: Ryzen 5 5600X" hint="CPU or GPU required" />
        <Input label="GPU" name="gpu" value={formData.gpu} onChange={onChange} placeholder="Example: RTX 3060" hint="CPU or GPU required" />
        <Input label="RAM" name="ram" value={formData.ram} onChange={onChange} placeholder="Example: 16GB DDR4" />
        <Input label="Storage" name="storage" value={formData.storage} onChange={onChange} placeholder="Example: 1TB SSD" />
        <Input label="Motherboard" name="motherboard" value={formData.motherboard} onChange={onChange} placeholder="Example: B550" />
        <Input label="Power Supply" name="powerSupply" value={formData.powerSupply} onChange={onChange} placeholder="Example: 650W Gold" />
        <Input label="Upgrade Budget" name="budget" value={formData.budget} onChange={onChange} placeholder="Example: $500" />
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-300">Main Use Case</span>
        <select
          name="useCase"
          value={formData.useCase}
          onChange={onChange}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
        >
          {useCases.map((useCase) => (
            <option key={useCase}>{useCase}</option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={isAnalyzing}
        className="w-full rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze My PC'}
      </button>
    </form>
  )
}

function Input({ label, name, value, onChange, placeholder, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-300">
        {label}
        {hint && <span className="ml-2 text-xs font-normal text-cyan-400">{hint}</span>}
      </span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
      />
    </label>
  )
}

export default SpecsForm
