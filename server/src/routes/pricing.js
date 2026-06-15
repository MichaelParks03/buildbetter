import express from 'express'
import { searchPricing } from '../services/pricing/pricingService.js'

const router = express.Router()

router.post('/search', async (request, response) => {
  const result = await searchPricing(request.body || {})
  response.json(result)
})

export default router
