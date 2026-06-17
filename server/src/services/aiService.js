import { createOpenRouterChatCompletion } from './openRouterClient.js'

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
    // Backend calls OpenRouter. The API key stays private in server/.env.
    const data = await createOpenRouterChatCompletion({
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
      maxTokens: 220,
    })
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
