import { normalizePricingResult } from './normalizePricingResult.js'

async function getEbayAccessToken() {
  const credentials = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`,
  ).toString('base64')

  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'https://api.ebay.com/oauth/api_scope',
    }),
  })

  if (!response.ok) {
    throw new Error(`eBay token request failed with ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function searchEbayPricing({ query = '', condition = 'any', limit = 5 } = {}) {
  if (!process.env.EBAY_CLIENT_ID || !process.env.EBAY_CLIENT_SECRET) {
    return {
      provider: 'ebay',
      results: [],
      warnings: ['eBay used pricing is unavailable because eBay API credentials are not configured.'],
    }
  }

  try {
    const accessToken = await getEbayAccessToken()
    const params = new URLSearchParams({
      q: query,
      limit: String(Number(limit) || 5),
    })

    if (condition === 'used') {
      params.set('filter', 'conditions:{USED}')
    } else if (condition === 'new') {
      params.set('filter', 'conditions:{NEW}')
    }

    const marketplace = process.env.EBAY_MARKETPLACE_ID || 'EBAY_US'
    const response = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-EBAY-C-MARKETPLACE-ID': marketplace,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`eBay search request failed with ${response.status}`)
    }

    const data = await response.json()

    return {
      provider: 'ebay',
      results: (data.itemSummaries || []).map(normalizeEbayItem),
      warnings: [],
    }
  } catch {
    return {
      provider: 'ebay',
      results: [],
      warnings: ['eBay used pricing request failed, so BuildBetter used fallback pricing.'],
    }
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
