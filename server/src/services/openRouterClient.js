const DEFAULT_MODEL = 'qwen/qwen3-next-80b-a3b-instruct:free'
const DEFAULT_FALLBACK_MODELS = ['openrouter/free']

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

export function getOpenRouterModels() {
  const primaryModel = process.env.OPENROUTER_MODEL || DEFAULT_MODEL
  const fallbackModels = process.env.OPENROUTER_FALLBACK_MODELS
    ? process.env.OPENROUTER_FALLBACK_MODELS.split(',').map((model) => model.trim())
    : DEFAULT_FALLBACK_MODELS

  // Qwen is first. OpenRouter can try later models when the first provider fails.
  return unique([primaryModel, ...fallbackModels])
}

export async function createOpenRouterChatCompletion({
  messages,
  maxTokens,
  temperature = 0.3,
}) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:5173',
      'X-Title': 'BuildBetter',
    },
    body: JSON.stringify({
      models: getOpenRouterModels(),
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        `OpenRouter request failed with status ${response.status}.`,
    )
  }

  return data
}
