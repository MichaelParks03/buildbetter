function fallbackExplanation({ analysis, budget, userGoal }) {
  const priceNote =
    analysis?.pricingProvider === 'mock'
      ? ' The prices shown are mock demo estimates, so check live stores before buying.'
      : ' Live provider prices can change, so confirm the final price before buying.'

  return (
    `For ${userGoal || 'your main use case'}, the likely bottleneck is ${analysis?.likelyBottleneck || 'the part limiting daily performance'}. ` +
    `The best first upgrade is ${analysis?.recommendedFirstUpgrade || 'one focused value upgrade'} because it should address the biggest limitation within ` +
    `${budget ? `$${budget}` : 'your budget'}.` +
    priceNote
  )
}

export async function createExplanation({ build = {}, analysis = {}, pricing = [], userGoal = '', budget = 0 }) {
  const warnings = []

  if (!process.env.OPENROUTER_API_KEY) {
    warnings.push('Using rule-based explanation because no OpenRouter API key is configured.')
    return {
      source: 'fallback',
      explanation: fallbackExplanation({ analysis, budget, userGoal }),
      warnings,
    }
  }

  try {
    const model =
      process.env.OPENROUTER_MODEL || 'qwen/qwen3-next-80b-a3b-instruct:free'
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
              'Explain PC upgrade recommendations for beginners. Be concise, avoid fake benchmark numbers, and mention that prices are estimates.',
          },
          {
            role: 'user',
            content: JSON.stringify({ build, analysis, pricing, userGoal, budget }),
          },
        ],
        max_tokens: 220,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter request failed with ${response.status}`)
    }

    const data = await response.json()
    const explanation = data.choices?.[0]?.message?.content?.trim()

    if (!explanation) {
      throw new Error('OpenRouter returned an empty explanation.')
    }

    return {
      source: 'openrouter',
      explanation,
      warnings,
    }
  } catch (error) {
    warnings.push('OpenRouter explanation failed, so BuildBetter used the rule-based fallback.')
    return {
      source: 'fallback',
      explanation: fallbackExplanation({ analysis, budget, userGoal }),
      warnings,
    }
  }
}
