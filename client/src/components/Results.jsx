//This file displays the results after the user clicks Analyze My PC.

function Results({ formData, recommendation, analyzeClickCount }) {
  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Sample Recommendation</h2>

        <p className="text-slate-600 mt-1">
          This is fake sample data for now. Later, this will come from the backend.
        </p>

        <p className="text-sm text-slate-500 mt-2">
          Analyze button clicked {analyzeClickCount} time(s) during this session.
        </p>
      </div>

      <div className="bg-slate-100 rounded-xl p-4">
        <h3 className="font-bold text-slate-900 mb-2">Your Submitted Build</h3>

        <p><strong>CPU:</strong> {formData.cpu}</p>
        <p><strong>GPU:</strong> {formData.gpu}</p>
        <p><strong>RAM:</strong> {formData.ram}</p>
        <p><strong>Budget:</strong> {formData.budget}</p>
        <p><strong>Use Case:</strong> {formData.useCase}</p>

        {formData.motherboard && (
          <p><strong>Motherboard:</strong> {formData.motherboard}</p>
        )}

        {formData.psu && (
          <p><strong>PSU:</strong> {formData.psu}</p>
        )}

        {formData.caseName && (
          <p><strong>Case:</strong> {formData.caseName}</p>
        )}
      </div>

      <div className="border-l-4 border-blue-600 pl-4">
        <h3 className="text-xl font-bold text-slate-900">Best Upgrade</h3>

        <p className="text-lg mt-1">{recommendation.bestUpgrade.part}</p>

        <p className="text-slate-700 mt-2">
          {recommendation.bestUpgrade.reason}
        </p>

        <p className="mt-2">
          <strong>Estimated Price:</strong> {recommendation.bestUpgrade.estimatedPrice}
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900">Compatibility Warnings</h3>

        <ul className="mt-3 space-y-2">
          {recommendation.compatibilityNotes.map((note, index) => (
            <li
              key={index}
              className="bg-yellow-100 border border-yellow-300 rounded-xl p-3 text-slate-800"
            >
              {note}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900">Where to Buy</h3>

        <div className="grid md:grid-cols-2 gap-4 mt-3">
          {recommendation.buyOptions.map((option) => (
            <a
              key={option.store}
              href={option.url}
              target="_blank"
              rel="noreferrer"
              className="block border border-slate-300 rounded-xl p-4 hover:border-blue-500 transition"
            >
              <h4 className="font-bold text-slate-900">{option.store}</h4>
              <p className="text-slate-600">{option.price}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Results;