import { parseSystemInfo } from '../../server/src/services/systemInfoParser.js'

export default async (request) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    return Response.json(parseSystemInfo(body?.systemInfoText || ''))
  } catch (error) {
    console.error(error)
    return Response.json(
      { error: 'Something went wrong while BuildBetter was processing your request.' },
      { status: 500 },
    )
  }
}

export const config = { path: '/api/parse-system-info' }
