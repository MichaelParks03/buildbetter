import { mockParts } from '../../data/mockParts.js'
import { normalizePricingResult } from './normalizePricingResult.js'

export async function searchMockPricing({ query = '', condition = 'any', limit = 5 }) {
  const queryWords = String(query)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  const matches = mockParts.filter((part) => {
    const title = part.title.toLowerCase()
    const conditionMatches = condition === 'any' || part.condition === condition
    const queryMatches = queryWords.length === 0 || queryWords.some((word) => title.includes(word))
    return conditionMatches && queryMatches
  })

  return {
    provider: 'mock',
    results: (matches.length > 0 ? matches : mockParts)
      .slice(0, Number(limit) || 5)
      .map(normalizePricingResult),
    warnings: ['Using mock pricing because no live pricing API key is configured.'],
  }
}
