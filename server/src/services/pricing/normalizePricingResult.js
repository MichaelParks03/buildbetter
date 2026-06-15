export function normalizePricingResult(result) {
  return {
    title: result.title || result.name || 'Unknown part',
    price: Number(result.price || result.salePrice || result.regularPrice || 0),
    currency: result.currency || 'USD',
    condition: result.condition || 'any',
    source: result.source || 'Mock',
    url: result.url || '',
    image: result.image || '',
    availability: result.availability || 'demo',
    confidence: result.confidence || 'medium',
  }
}
