import { searchAmazonCreatorsPricing } from './amazonCreatorsProvider.js'
import { searchBestBuyPricing } from './bestBuyProvider.js'
import { searchCuratedPricing } from './curatedPricingProvider.js'
import { searchEbayPricing } from './ebayProvider.js'
import { searchMockPricing } from './mockPricingProvider.js'

export async function searchPricing(searchOptions = {}) {
  const provider = (process.env.PRICING_PROVIDER || 'curated').toLowerCase()
  const warnings = []

  async function withCuratedFallback(result) {
    if (result.results?.length) return result

    const curated = await searchCuratedPricing(searchOptions)
    return {
      provider: 'curated',
      results: curated.results,
      warnings: [...(result.warnings || []), ...curated.warnings],
    }
  }

  if (provider === 'bestbuy') {
    return withCuratedFallback(await searchBestBuyPricing(searchOptions))
  }

  if (provider === 'ebay') {
    return withCuratedFallback(await searchEbayPricing(searchOptions))
  }

  if (provider === 'combined') {
    const [bestBuy, ebay] = await Promise.all([
      searchBestBuyPricing(searchOptions),
      searchEbayPricing(searchOptions),
    ])
    const results = [...bestBuy.results, ...ebay.results]
    const combinedWarnings = [...bestBuy.warnings, ...ebay.warnings]

    if (results.length) {
      return {
        provider: 'combined',
        results,
        warnings: combinedWarnings,
      }
    }

    const curated = await searchCuratedPricing(searchOptions)
    return {
      provider: 'curated',
      results: curated.results,
      warnings: [...combinedWarnings, ...curated.warnings],
    }
  }

  if (provider === 'amazon') {
    warnings.push('Amazon is future optional scaffolding, not the primary pricing provider.')
    const amazon = await searchAmazonCreatorsPricing(searchOptions)
    return withCuratedFallback({
      ...amazon,
      warnings: [...warnings, ...amazon.warnings],
    })
  }

  if (provider === 'mock') {
    return searchMockPricing(searchOptions)
  }

  return searchCuratedPricing(searchOptions)
}
