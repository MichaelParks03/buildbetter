import express from 'express'
import { parseSystemInfo } from '../services/systemInfoParser.js'

const router = express.Router()

router.post('/', (request, response) => {
  response.json(parseSystemInfo(request.body?.systemInfoText || ''))
})

export default router
