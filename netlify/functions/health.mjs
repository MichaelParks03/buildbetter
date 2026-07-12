export default async () => {
  return Response.json({
    status: 'ok',
    message: 'BuildBetter API is running',
  })
}

export const config = { path: '/api/health' }
