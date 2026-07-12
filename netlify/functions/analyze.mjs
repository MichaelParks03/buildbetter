import { analyzeBuild } from '../../server/src/services/analysisService.js'

export default async (request) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const result = await analyzeBuild(body)
    return Response.json(result, { status: result.error ? 400 : 200 })
  } catch (error) {
    console.error(error)
    return Response.json(
      { error: 'Something went wrong while BuildBetter was processing your request.' },
      { status: 500 },
    )
  }
}

export const config = { path: '/api/analyze' }
