import express from 'express'

const router = express.Router()

router.get('/', (request, response) => {
  response.json({
    status: 'ok',
    message: 'BuildBetter API is running',
  })
})

export default router
