import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import aiRouter from './routes/ai.js'
import analyzeRouter from './routes/analyze.js'
import healthRouter from './routes/health.js'
import pricingRouter from './routes/pricing.js'
import systemInfoRouter from './routes/systemInfo.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 5000
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

app.use((error, request, response, next) => {
  console.error(error)
  response.status(500).json({
    error: 'Something went wrong while BuildBetter was processing your request.',
  })
})

app.listen(port, () => {
  console.log(`BuildBetter API is running on port ${port}`)
})
