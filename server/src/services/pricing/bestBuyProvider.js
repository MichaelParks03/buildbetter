import { normalizePricingResult } from './normalizePricingResult.js'

export async function searchBestBuyPricing({ query = '', limit = 5 }) {
  if (!process.env.BESTBUY_API_KEY) {
    return {
      provider: 'bestbuy',
      results: [],
      warnings: ['Best Buy pricing is unavailable because BESTBUY_API_KEY is not configured.'],
    }
  }

  const encodedQuery = encodeURIComponent(`search=${query}`)
  const show = 'sku,name,salePrice,regularPrice,onlineAvailability,inStoreAvailability,url,image,manufacturer,modelNumber,condition'
  const url = `https://api.bestbuy.com/v1/products((${encodedQuery}))?apiKey=${process.env.BESTBUY_API_KEY}&format=json&show=${show}&pageSize=${Number(limit) || 5}`

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Best Buy request failed with ${response.status}`)
    const data = await response.json()

    return {
      provider: 'bestbuy',
      results: (data.products || []).map((product) =>
        normalizePricingResult({
          title: product.name,
          price: product.salePrice || product.regularPrice,
          condition: product.condition || 'new',
          source: 'Best Buy',
          url: product.url,
          image: product.image,
          availability: product.onlineAvailability || product.inStoreAvailability ? 'available' : 'limited',
          confidence: 'medium',
        }),
      ),
      warnings: [],
    }
  } catch (error) {
    return {
      provider: 'bestbuy',
      results: [],
      warnings: ['Best Buy pricing request failed, so BuildBetter used fallback pricing.'],
    }
  }
}
