import RecommendationCard from './RecommendationCard'
import ResultCard from './ResultCard'
import SummaryItem from './SummaryItem'

function Results({ analysis }) {
  if (!analysis) {
    return (
      <aside className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center text-slate-400">
        Fill out the form and click Analyze My PC to see backend-powered results.
      </aside>
    )
  }

  const build = analysis.currentBuildSummary || {}
  const providerLabel =
    analysis.pricingProvider === 'bestbuy'
      ? 'Live pricing source: Best Buy'
      : analysis.pricingProvider === 'ebay'
        ? 'Live pricing source: eBay'
        : analysis.pricingProvider === 'curated'
          ? 'Typical prices + live store links'
          : 'Demo estimate'

  return (
    <aside className="space-y-5 rounded-3xl border border-cyan-900 bg-slate-900 p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
          Recommendation
        </p>
        <h2 className="mt-2 text-3xl font-bold text-white">Your Upgrade Plan</h2>
      </div>

      {analysis.warnings?.length > 0 && (
        <div className="space-y-2">
          {analysis.warnings.map((warning) => (
            <p
              key={warning}
              className="rounded-xl border border-yellow-800 bg-yellow-950/60 p-3 text-sm text-yellow-100"
            >
              {warning}
            </p>
          ))}
        </div>
      )}

      <ResultCard title="Current Build Summary">
        <dl className="grid gap-2 text-sm">
          <SummaryItem label="CPU" value={build.cpu} />
          <SummaryItem label="GPU" value={build.gpu} />
          <SummaryItem label="RAM" value={build.ram} />
          <SummaryItem label="Storage" value={build.storage} />
          <SummaryItem label="Motherboard" value={build.motherboard} />
          <SummaryItem label="Power Supply" value={build.powerSupply} />
          <SummaryItem label="Budget" value={build.budget ? `$${build.budget}` : ''} />
          <SummaryItem label="Use Case" value={build.useCase} />
        </dl>
      </ResultCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard title="Estimated Used Value" badge="Demo estimate">
          <p className="text-2xl font-bold text-cyan-300">
            {analysis.estimatedUsedValue?.range}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {analysis.estimatedUsedValue?.disclaimer}
          </p>
        </ResultCard>

        <ResultCard title="Likely Bottleneck">
          <p className="text-2xl font-bold text-cyan-300">
            {analysis.likelyBottleneck}
          </p>
        </ResultCard>
      </div>

      <ResultCard title="Recommended First Upgrade">
        <RecommendationCard
          part={analysis.recommendedFirstUpgrade}
          path={analysis.upgradePath}
        />
      </ResultCard>

      <ResultCard title="Pricing" badge={providerLabel}>
        <p className="mb-4 text-sm text-slate-400">
          {analysis.pricingProvider === 'curated'
            ? 'These are typical prices we update by hand. Click a store to see today’s live price.'
            : 'Prices may change.'}
        </p>
        {analysis.recommendedParts?.length > 0 ? (
          <div className="space-y-3">
            {analysis.recommendedParts.map((part) => (
              <div
                key={`${part.source}-${part.title}-${part.price}`}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <p className="font-semibold text-white">
                  {part.url ? (
                    <a
                      href={part.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-cyan-700 underline-offset-4 hover:text-cyan-300"
                    >
                      {part.title}
                    </a>
                  ) : (
                    part.title
                  )}
                </p>
                <p className="text-cyan-300">${part.price.toFixed(2)} {part.currency}</p>
                <p className="text-sm text-slate-400">
                  {part.source} - {part.condition} - {part.availability}
                </p>
                {part.links && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      ['Amazon', part.links.amazon],
                      ['Newegg', part.links.newegg],
                      ['eBay', part.links.ebay],
                    ].map(([store, href]) => (
                      <a
                        key={store}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-cyan-900 bg-slate-950 px-3 py-1.5 text-sm font-medium text-cyan-300 transition hover:border-cyan-500 hover:text-cyan-200"
                      >
                        Check {store} price
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
            No priced parts matched this recommendation yet.
          </p>
        )}
      </ResultCard>

      <ResultCard
        title="Explanation"
        badge={analysis.explanationSource === 'openai' ? 'AI-generated explanation' : 'Rule-based explanation'}
      >
        <p className="leading-7 text-slate-300">{analysis.explanation}</p>
      </ResultCard>
    </aside>
  )
}

export default Results
