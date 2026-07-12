import { curatedParts, pricesAsOf } from '../../data/curatedParts.js'
import { normalizePricingResult } from './normalizePricingResult.js'

export function storeSearchLinks(searchQuery) {
  const encoded = encodeURIComponent(searchQuery)
  return {
    amazon: `https://www.amazon.com/s?k=${encoded}`,
    newegg: `https://www.newegg.com/p/pl?d=${encoded}`,
    ebay: `https://www.ebay.com/sch/i.html?_nkw=${encoded}`,
  }
}

export function toCuratedResult(part) {
  return {
    ...normalizePricingResult({
      ...part,
      source: 'Curated catalog',
      availability: `typical price as of ${pricesAsOf}`,
      confidence: 'curated',
    }),
    links: storeSearchLinks(part.searchQuery),
    priceAsOf: pricesAsOf,
  }
}

const CATEGORY_HINTS = [
  ['gpu', ['gpu', 'graphics']],
  ['ram', ['ram', 'memory']],
  ['ssd', ['ssd', 'storage', 'drive']],
  ['cpu', ['cpu', 'processor']],
  ['psu', ['psu', 'power supply']],
]

function categoryFromHint(hintText) {
  const text = String(hintText || '').toLowerCase()
  for (const [category, keywords] of CATEGORY_HINTS) {
    if (keywords.some((keyword) => text.includes(keyword))) return category
  }
  return ''
}

export async function searchCuratedPricing({
  query = '',
  category = '',
  condition = 'any',
  limit = 4,
}) {
  const queryWords = String(query).toLowerCase().split(/\s+/).filter(Boolean)
  const wantedCategory = categoryFromHint(category) || categoryFromHint(query)

  const scored = curatedParts
    .filter((part) => condition === 'any' || part.condition === condition)
    .map((part) => {
      const haystack = `${part.title} ${part.matchName}`.toLowerCase()
      const wordHits = queryWords.filter((word) => haystack.includes(word)).length
      const categoryHit = wantedCategory && part.category === wantedCategory ? 1 : 0
      return { part, score: wordHits * 2 + categoryHit * 3 }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.part.price - b.part.price)

  const matches = (scored.length > 0 ? scored.map((entry) => entry.part) : curatedParts).slice(
    0,
    Number(limit) || 4,
  )

  return {
    provider: 'curated',
    results: matches.map(toCuratedResult),
    warnings: [],
  }
}
