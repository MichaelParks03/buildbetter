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

function upgradeText(upgrade) {
  const map = {
    RAM: 'adding more memory (RAM)',
    'More RAM': 'adding more memory (RAM)',
    SSD: 'switching to a faster SSD drive',
    'NVMe SSD': 'switching to a fast NVMe SSD',
    GPU: 'getting a new graphics card',
    'Graphics card': 'getting a new graphics card',
    Processor: 'upgrading your processor',
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
  if (pricingProvider === 'curated') {
    return `One more thing — the prices shown are typical store prices we keep updated by hand, so use the store links to check today's exact price before you buy.`
  }
  return `One more thing — prices change fast at real stores, so it's worth a quick double-check before you actually buy.`
}

function scoreStackSentence(bottleneck) {
  const cpu = bottleneck.cpuMatch
  const gpu = bottleneck.gpuMatch

  if (cpu && gpu) {
    return `Here's how your parts stack up: your ${cpu.name} scores about ${cpu.score}/100 in our rankings, while your ${gpu.name} comes in at ${gpu.score}/100.`
  }
  if (cpu) {
    return `We recognized your ${cpu.name} — it scores about ${cpu.score}/100 in our rankings.`
  }
  if (gpu) {
    return `We recognized your ${gpu.name} — it scores about ${gpu.score}/100 in our rankings.`
  }
  return ''
}

function verdictSentence(bottleneck, goal) {
  const map = {
    gpu: `For ${goal}, the graphics card does most of the heavy lifting — and right now it's the weakest link in your build, so that's where an upgrade will feel the most noticeable.`,
    cpu: `For ${goal}, the processor sets the pace — and yours is the part falling furthest behind, so it's the smartest place to spend.`,
    ram: `${bottleneck.ramGb ? `${bottleneck.ramGb}GB of` : 'Your'} memory is what's pinching you here — RAM is cheap compared to most upgrades and smooths out ${goal} more than people expect.`,
    storage: `Your ${bottleneck.storageKind || 'storage'} is the drag here — moving to a fast NVMe SSD is the difference between waiting for things to load and just... not.`,
    none: `And here's the good news: nothing is really holding you back. Your parts are well matched for ${goal}.`,
  }
  return map[bottleneck.component] || ''
}

function confidenceSentence(confidence) {
  if (confidence === 'high') return `We're confident in this call.`
  if (confidence === 'medium') {
    return `We're fairly confident, though we couldn't identify every part — double-check the details before spending.`
  }
  return `Honestly, we couldn't identify enough of your parts to be sure — treat this as a starting point, not a verdict.`
}

function planSentence({ analysis, budget }) {
  const budgetPlan = analysis?.budgetPlan
  const upgrade = upgradeText(analysis?.recommendedFirstUpgrade)

  if (!budgetPlan) return recommendationSentence(budget, upgrade)

  const topPick = budgetPlan.picks?.[0]

  if (budgetPlan.status === 'maxed_out') {
    return `And honestly? Your build is already strong across the board — nothing in our catalog would be a meaningful step up, so save your money for a bigger jump later.`
  }
  if (budgetPlan.status === 'no_budget') {
    return `So here's the plan: ${upgrade} would make the biggest difference here — and since you didn't give a budget, we ranked the picks below purely by value for money.`
  }
  if (budgetPlan.status === 'too_small' && topPick) {
    return `So here's the honest answer: $${budget} won't buy an upgrade you'd actually feel. The cheapest one worth doing is the ${topPick.title} at about $${topPick.price} — saving up for it beats spending today.`
  }
  if (budgetPlan.status === 'ok' && !budgetPlan.fixesBottleneck && topPick && analysis?.bottleneck) {
    return `So here's the plan: the real fix is your ${analysis.bottleneck.shortLabel}, but that doesn't fit $${budget} yet — in the meantime, the ${topPick.title} (about $${topPick.price}) is the best value move you can make.`
  }
  return recommendationSentence(budget, upgrade)
}

function fallbackExplanation({ analysis, budget, userGoal }) {
  const goal = goalPhrase(userGoal)
  const bottleneck = analysis?.bottleneck
  const plan = planSentence({ analysis, budget })
  const price = priceNote(analysis?.pricingProvider)

  if (!bottleneck) {
    const intro = `We couldn't identify your parts well enough to measure them against our rankings, so take this as a sensible starting point for ${goal} rather than a verdict.`
    return `${intro} ${plan} ${price}`
  }

  const sentences = [
    scoreStackSentence(bottleneck),
    verdictSentence(bottleneck, goal),
    confidenceSentence(bottleneck.confidence),
  ]

  if (bottleneck.closeCall) {
    sentences.push(
      `It was nearly a tie with your ${bottleneck.closeCallLabel}, so keep that one on your radar too.`,
    )
  }

  sentences.push(plan)

  // No parts are being suggested for a maxed-out build, so skip the price talk.
  if (analysis?.budgetPlan?.status !== 'maxed_out') {
    sentences.push(price)
  }

  return sentences.filter(Boolean).join(' ')
}

export async function createExplanation({ build = {}, analysis = {}, pricing = [], userGoal = '', budget = 0 }) {
  const warnings = []

  if (!process.env.OPENAI_API_KEY) {
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
