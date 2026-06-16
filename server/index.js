import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import aiRouter from './src/routes/ai.js'
import analyzeRouter from './src/routes/analyze.js'
import healthRouter from './src/routes/health.js'
import pricingRouter from './src/routes/pricing.js'
import systemInfoRouter from './src/routes/systemInfo.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 3001
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(
  cors({
    origin: clientOrigin,
  }),
)
app.use(express.json({ limit: '1mb' }))

app.use('/api/health', healthRouter)
app.use('/api/analyze', analyzeRouter)
app.use('/api/parse-system-info', systemInfoRouter)
app.use('/api/pricing', pricingRouter)
app.use('/api/ai', aiRouter)

app.post('/api/chat', async (request, response) => {
  const { message } = request.body || {}

  if (typeof message !== 'string' || !message.trim()) {
    return response.status(400).json({
      error: 'Message is required and must be a non-empty string.',
    })
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return response.status(500).json({
      error: 'OpenRouter is not configured. Add OPENROUTER_API_KEY to server/.env.',
    })
  }

  try {
    // Backend calls OpenRouter. The API key stays private in server/.env.
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model:
          process.env.OPENROUTER_MODEL ||
          'qwen/qwen3-next-80b-a3b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Be direct, accurate, and concise.',
          },
          {
            role: 'user',
            content: message.trim(),
          },
        ],
      }),
    })

    const data = await openRouterResponse.json().catch(() => ({}))

    if (!openRouterResponse.ok) {
      return response.status(openRouterResponse.status).json({
        error:
          data?.error?.message ||
          `OpenRouter request failed with status ${openRouterResponse.status}.`,
      })
    }

    const answer = data.choices?.[0]?.message?.content?.trim()

    if (!answer) {
      return response.status(502).json({
        error: 'OpenRouter returned an empty response.',
      })
    }

    return response.json({ answer })
  } catch (error) {
    console.error(error)
    return response.status(500).json({
      error: 'The backend could not reach OpenRouter. Please try again.',
    })
  }
})

app.use((error, request, response, next) => {
  console.error(error)
  response.status(500).json({
    error: 'Something went wrong while BuildBetter was processing your request.',
  })
})

app.listen(port, () => {
  console.log(`BuildBetter API is running on port ${port}`)
})
