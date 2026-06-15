import express from 'express'
import { analyzeBuild } from '../services/analysisService.js'

const router = express.Router()

router.post('/', async (request, response) => {
  const result = await analyzeBuild(request.body || {})
  const status = result.error ? 400 : 200

  response.status(status).json(result)
})

export default router
