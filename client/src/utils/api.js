async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'BuildBetter API request failed.')
  }

  return data
}

export function parseSystemInfo(systemInfoText) {
  return request('/api/parse-system-info', {
    method: 'POST',
    body: JSON.stringify({ systemInfoText }),
  })
}

export function analyzeBuild(build) {
  return request('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(build),
  })
}

export function searchPricing(search) {
  return request('/api/pricing/search', {
    method: 'POST',
    body: JSON.stringify(search),
  })
}
