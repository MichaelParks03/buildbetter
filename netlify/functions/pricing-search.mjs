import { searchPricing } from '../../server/src/services/pricing/pricingService.js'

export default async (request) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const result = await searchPricing(body)
    return Response.json(result)
  } catch (error) {
    console.error(error)
    return Response.json(
      { error: 'Something went wrong while BuildBetter was processing your request.' },
      { status: 500 },
    )
  }
}

export const config = { path: '/api/pricing/search' }
