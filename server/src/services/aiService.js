const GOAL_PHRASES = {
  Gaming: 'gaming',
  School: 'schoolwork',
  CAD: 'CAD work',
  Streaming: 'streaming',
  'General Use': 'everyday use',
}

function goalPhrase(userGoal) {
  return GOAL_PHRASES[userGoal] || 'what you use it for'
}

function bottleneckIntro(bottleneck, goal) {
  const map = {
    'Low RAM': `The first thing that jumps out is your memory (RAM) — you don't have much to work with, and that's usually what makes everything feel sluggish, from opening apps to switching between tabs.`,
    Storage: `You're running on an older hard drive instead of a solid-state drive (SSD), and that's a bigger deal than most people realize — it's the difference between things loading instantly and just... waiting.`,
    'Missing GPU details': `I don't have clear details on your graphics card, and for ${goal} that's usually the part that matters most — so that's the first thing worth double-checking.`,
    GPU: `Your graphics card is what's holding things back here. It's the part doing the heavy lifting for ${goal}, so it's also where an upgrade will feel the most noticeable.`,
    'Storage or RAM': `Nothing looks dramatically wrong, but storage speed and memory are the two usual culprits behind everyday slowness — either one would be a safe, worthwhile upgrade.`,
    'CPU, GPU, or RAM': `CAD software leans on your processor, graphics card, and memory all at the same time, so it's worth checking all three before spending anything.`,
    'CPU or GPU encoder': `Streaming puts a lot of load on your processor (and a newer graphics card can help take some of that off its plate), so that combo is probably what's slowing you down.`,
    'Balanced upgrade needed': `Nothing stands out as badly broken here, so instead of guessing, the smart move is just picking the single upgrade that gives you the most value for your money.`,
  }
  return map[bottleneck] || `The part most likely holding you back is ${(bottleneck || 'one part of your setup').toLowerCase()}.`
}

function upgradeText(upgrade) {
  const map = {
    RAM: 'adding more memory (RAM)',
    SSD: 'switching to a faster SSD drive',
    GPU: 'getting a new graphics card',
    'Graphics card': 'getting a new graphics card',
    'SSD or memory': 'adding more storage speed or memory',
    'CPU or workstation-friendly GPU': 'upgrading your processor or getting a workstation-friendly graphics card',
    'CPU or modern GPU': 'upgrading your processor or getting a newer graphics card',
    'Best value part': 'whichever single part gives you the most bang for your buck',
  }
  return map[upgrade] || `upgrading the ${(upgrade || 'part that matters most').toLowerCase()}`
}

function recommendationSentence(budget, upgrade) {
  if (!budget || budget <= 0) {
    return `So here's the plan: ${upgrade} would make the biggest difference here, whatever your budget ends up being.`
  }
  if (budget >= 1000) {
    return `So here's the plan: start by ${upgrade}, then put whatever's left toward RAM, storage, cooling, or a monitor bump if those could still use help.`
  }
  if (budget >= 400) {
    return `So here's the plan: put most of your $${budget} toward ${upgrade} instead of spreading it thin across a bunch of smaller parts.`
  }
  return `So here's the plan: with $${budget} to work with, ${upgrade} is the one thing worth spending on right now — everything else can wait.`
}

function priceNote(pricingProvider) {
  if (pricingProvider === 'mock') {
    return `One more thing — the prices you're seeing right now are demo numbers, not live prices, so check a real store before you buy.`
  }
  return `One more thing — prices change fast at real stores, so it's worth a quick double-check before you actually buy.`
}

function fallbackExplanation({ analysis, budget, userGoal }) {
  const goal = goalPhrase(userGoal)
  const intro = bottleneckIntro(analysis?.likelyBottleneck, goal)
  const plan = recommendationSentence(budget, upgradeText(analysis?.recommendedFirstUpgrade))
  const price = priceNote(analysis?.pricingProvider)

  return `${intro} ${plan} ${price}`
}

export async function createExplanation({ build = {}, analysis = {}, pricing = [], userGoal = '', budget = 0 }) {
  const warnings = []

  if (!process.env.OPENAI_API_KEY) {
    warnings.push('Using rule-based explanation because no OpenAI API key is configured.')
    return {
      source: 'fallback',
      explanation: fallbackExplanation({ analysis, budget, userGoal }),
      warnings,
    }
  }

  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'Explain PC upgrade recommendations for beginners. Be concise, avoid fake benchmark numbers, and mention that prices are estimates.',
          },
          {
            role: 'user',
            content: JSON.stringify({ build, analysis, pricing, userGoal, budget }),
          },
        ],
        max_tokens: 220,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI request failed with ${response.status}`)
    }

    const data = await response.json()
    const explanation = data.choices?.[0]?.message?.content?.trim()

    if (!explanation) {
      throw new Error('OpenAI returned an empty explanation.')
    }

    return {
      source: 'openai',
      explanation,
      warnings,
    }
  } catch (error) {
    warnings.push('OpenAI explanation failed, so BuildBetter used the rule-based fallback.')
    return {
      source: 'fallback',
      explanation: fallbackExplanation({ analysis, budget, userGoal }),
      warnings,
    }
  }
}
