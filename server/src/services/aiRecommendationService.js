const DEFAULT_MODEL = 'qwen/qwen3-next-80b-a3b-instruct:free'

function extractJson(text) {
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

function asString(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function asStringArray(value, fallback = []) {
  if (!Array.isArray(value)) return fallback
  return value.map((item) => asString(item)).filter(Boolean).slice(0, 6)
}

function normalizePricingSearches(searches, fallbackQuery) {
  if (!Array.isArray(searches)) {
    return [
      {
        query: fallbackQuery,
        category: 'upgrade',
        condition: 'any',
      },
    ]
  }

  return searches
    .map((search) => ({
      query: asString(search?.query),
      category: asString(search?.category, 'upgrade'),
      condition: ['new', 'used', 'any'].includes(search?.condition)
        ? search.condition
        : 'any',
    }))
    .filter((search) => search.query)
    .slice(0, 4)
}

export async function createAiRecommendation({ build, budget, useCase }) {
  if (!process.env.OPENROUTER_API_KEY) {
    return {
      source: 'fallback',
      recommendation: null,
      warnings: ['Using rule-based recommendations because no OpenRouter API key is configured.'],
    }
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL

  try {
    // Backend calls OpenRouter. The API key stays private in server/.env.
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:5173',
        'X-Title': 'BuildBetter',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a careful PC upgrade advisor. Return only valid JSON. Give practical, hardware-aware recommendations. Do not invent exact benchmarks. For laptops, do not recommend CPU/GPU swaps unless the user clearly has a desktop. Treat prices as estimates unless live pricing data is provided later.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              task:
                'Analyze this PC and recommend realistic upgrades. Include a used-value estimate, likely bottleneck, first upgrade, upgrade path, pricing search queries, and concise explanation.',
              requiredShape: {
                estimatedUsedValue: {
                  range: '$300 - $500',
                  confidence: 'AI estimate',
                  disclaimer:
                    'This is an AI estimate based on the provided specs, not guaranteed live market pricing.',
                },
                likelyBottleneck: 'short phrase',
                recommendedFirstUpgrade: 'specific upgrade recommendation',
                upgradePath: ['step 1', 'step 2', 'step 3'],
                pricingSearches: [
                  {
                    query: 'specific product search query',
                    category: 'ssd | ram | gpu | cpu | monitor | accessory',
                    condition: 'new | used | any',
                  },
                ],
                explanation: 'concise beginner-friendly explanation',
              },
              build,
              budget,
              useCase,
            }),
          },
        ],
        temperature: 0.3,
        max_tokens: 650,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        source: 'fallback',
        recommendation: null,
        warnings: [
          data?.error?.message ||
            `OpenRouter recommendation request failed with status ${response.status}.`,
        ],
      }
    }

    const parsed = extractJson(data.choices?.[0]?.message?.content)

    if (!parsed) {
      return {
        source: 'fallback',
        recommendation: null,
        warnings: ['OpenRouter returned a recommendation that could not be parsed.'],
      }
    }

    const estimatedUsedValue = parsed.estimatedUsedValue || {}
    const recommendedFirstUpgrade = asString(
      parsed.recommendedFirstUpgrade,
      'Best value upgrade for the current build',
    )

    return {
      source: 'openrouter',
      recommendation: {
        estimatedUsedValue: {
          range: asString(estimatedUsedValue.range, 'Needs more detail for an estimate'),
          confidence: asString(estimatedUsedValue.confidence, 'AI estimate'),
          disclaimer: asString(
            estimatedUsedValue.disclaimer,
            'This is an AI estimate based on the provided specs, not guaranteed live market pricing.',
          ),
        },
        likelyBottleneck: asString(parsed.likelyBottleneck, 'Needs more detail'),
        recommendedFirstUpgrade,
        upgradePath: asStringArray(parsed.upgradePath, [
          `Start with ${recommendedFirstUpgrade}.`,
          'Confirm compatibility before buying.',
          'Compare live prices before making a final purchase.',
        ]),
        pricingSearches: normalizePricingSearches(
          parsed.pricingSearches,
          recommendedFirstUpgrade,
        ),
        explanation: asString(
          parsed.explanation,
          'BuildBetter used AI to create a concise upgrade recommendation based on your current parts, budget, and use case.',
        ),
      },
      warnings: [],
    }
  } catch {
    return {
      source: 'fallback',
      recommendation: null,
      warnings: ['OpenRouter recommendation failed, so BuildBetter used rule-based recommendations.'],
    }
  }
}
