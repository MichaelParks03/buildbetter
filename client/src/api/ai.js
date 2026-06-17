export async function askAI(message) {
  // Frontend calls the local backend. It never talks to OpenRouter or sees the API key.
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'BuildBetter could not get an AI response.')
  }

  return data.answer
}
