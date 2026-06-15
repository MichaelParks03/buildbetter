import express from 'express'
import { createExplanation } from '../services/aiService.js'

const router = express.Router()

router.post('/explain', async (request, response) => {
  const result = await createExplanation(request.body || {})
  response.json(result)
})

export default router
