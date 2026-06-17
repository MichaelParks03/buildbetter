import { createOpenRouterChatCompletion } from './openRouterClient.js'

function extractJson(text) {
  if (!text) return null

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1])
    } catch {
      // Continue to other extraction strategies.
    }
  }

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

function getRecommendationShape() {
  return {
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

  try {
    // Backend calls OpenRouter. The API key stays private in server/.env.
    const data = await createOpenRouterChatCompletion({
      messages: [
        {
          role: 'system',
          content:
            'You are a careful PC upgrade advisor. Return a single valid JSON object only. Your first character must be { and your last character must be }. Do not use markdown, code fences, bullets, labels, or prose outside JSON. Give practical, hardware-aware recommendations. Do not invent exact benchmarks. For laptops, assume CPU and GPU are not upgradeable unless the user explicitly says the laptop supports eGPU, MXM, or swappable GPU modules. For ordinary laptops, recommend RAM, SSD, cooling, external monitor, peripherals, settings, or saving toward a better laptop/desktop instead of internal CPU/GPU swaps. Treat prices as estimates unless live pricing data is provided later.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            task:
              'Analyze this PC and recommend realistic upgrades. Include a used-value estimate, likely bottleneck, first upgrade, upgrade path, pricing search queries, and concise explanation.',
            requiredShape: getRecommendationShape(),
            build,
            budget,
            useCase,
          }),
        },
      ],
      maxTokens: 650,
    })

    const firstContent = data.choices?.[0]?.message?.content || ''
    let parsed = extractJson(firstContent)

    if (!parsed && firstContent) {
      const repair = await createOpenRouterChatCompletion({
        messages: [
          {
            role: 'system',
            content:
              'Convert the provided PC upgrade advice into one strict JSON object. Return JSON only. Do not include markdown, code fences, comments, or prose outside JSON.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              requiredShape: getRecommendationShape(),
              previousAdvice: firstContent,
              build,
              budget,
              useCase,
            }),
          },
        ],
        maxTokens: 550,
        temperature: 0,
      })

      parsed = extractJson(repair.choices?.[0]?.message?.content)
    }

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
  } catch (error) {
    return {
      source: 'fallback',
      recommendation: null,
      warnings: [
        error.message ||
          'OpenRouter recommendation failed, so BuildBetter used rule-based recommendations.',
      ],
    }
  }
}
