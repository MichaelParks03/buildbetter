import { normalizePricingResult } from './normalizePricingResult.js'

export async function searchEbayPricing() {
  if (!process.env.EBAY_CLIENT_ID || !process.env.EBAY_CLIENT_SECRET) {
    return {
      provider: 'ebay',
      results: [],
      warnings: ['eBay used pricing is unavailable because eBay API credentials are not configured.'],
    }
  }

  return {
    provider: 'ebay',
    results: [],
    warnings: ['eBay Browse API scaffolding is ready, but token exchange/search is not enabled in this MVP.'],
  }
}

export function normalizeEbayItem(item) {
  return normalizePricingResult({
    title: item.title,
    price: item.price?.value,
    currency: item.price?.currency,
    condition: item.condition || 'used',
    source: 'eBay',
    url: item.itemWebUrl,
    image: item.image?.imageUrl,
    availability: 'marketplace',
    confidence: 'medium',
  })
}
