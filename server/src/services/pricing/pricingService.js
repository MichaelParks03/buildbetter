import { searchAmazonCreatorsPricing } from './amazonCreatorsProvider.js'
import { searchBestBuyPricing } from './bestBuyProvider.js'
import { searchEbayPricing } from './ebayProvider.js'
import { searchMockPricing } from './mockPricingProvider.js'

export async function searchPricing(searchOptions = {}) {
  const provider = (process.env.PRICING_PROVIDER || 'mock').toLowerCase()
  const warnings = []

  async function withMockFallback(result) {
    if (result.results?.length) return result

    const mock = await searchMockPricing(searchOptions)
    return {
      provider: 'mock',
      results: mock.results,
      warnings: [...(result.warnings || []), ...mock.warnings],
    }
  }

  if (provider === 'bestbuy') {
    return withMockFallback(await searchBestBuyPricing(searchOptions))
  }

  if (provider === 'ebay') {
    return withMockFallback(await searchEbayPricing(searchOptions))
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

    const mock = await searchMockPricing(searchOptions)
    return {
      provider: 'mock',
      results: mock.results,
      warnings: [...combinedWarnings, ...mock.warnings],
    }
  }

  if (provider === 'amazon') {
    warnings.push('Amazon is future optional scaffolding, not the primary pricing provider.')
    const amazon = await searchAmazonCreatorsPricing(searchOptions)
    return withMockFallback({
      ...amazon,
      warnings: [...warnings, ...amazon.warnings],
    })
  }

  return searchMockPricing(searchOptions)
}
