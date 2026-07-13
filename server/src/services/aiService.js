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
  return `So here's the plan: with $${budget} to work with, ${upgrade} is the one thing worth spending on right now. Everything else can wait.`
}

function priceNote(pricingProvider) {
  if (pricingProvider === 'mock') {
    return `One more thing: the prices you're seeing right now are demo numbers, not live prices, so check a real store before you buy.`
  }
  if (pricingProvider === 'curated') {
    return `One more thing: the prices shown are typical store prices we keep updated by hand, so use the store links to check today's exact price before you buy.`
  }
  return `One more thing: prices change fast at real stores, so it's worth a quick double-check before you actually buy.`
}

function partClause(info) {
  if (!info) return ''
  const qualifier = info.estimated ? ' (estimated)' : ''
  return `your ${info.name} at ${info.score}/100${qualifier}`
}

function scoreStackSentence(bottleneck) {
  const cpu = partClause(bottleneck.cpuInfo)
  const gpu = partClause(bottleneck.gpuInfo)

  if (cpu && gpu) {
    return `Here's how your parts stack up: ${cpu}, and ${gpu}.`
  }
  if (cpu) return `We scored ${cpu}.`
  if (gpu) return `We scored ${gpu}.`
  return ''
}

function verdictSentence(bottleneck, goal) {
  if (bottleneck.wellBalanced) {
    return `The good news: your parts are already well matched for ${goal}, so nothing is badly holding you back. Your ${bottleneck.shortLabel} has the most room to grow, so that's where any spare money goes furthest.`
  }
  const map = {
    gpu: `For ${goal}, the graphics card does most of the heavy lifting, and right now it's the weakest link in your build, so that's where an upgrade will feel the most noticeable.`,
    cpu: `For ${goal}, the processor sets the pace, and yours is the part falling furthest behind, so it's the smartest place to spend.`,
    ram: `${bottleneck.ramGb ? `${bottleneck.ramGb}GB of` : 'Your'} memory is what's pinching you here. RAM is cheap compared to most upgrades and smooths out ${goal} more than people expect.`,
    storage: `Your ${bottleneck.storageKind || 'storage'} is the drag here. Moving to a fast NVMe SSD is the difference between waiting for things to load and just... not.`,
  }
  return map[bottleneck.component] || ''
}

function confidenceSentence(confidence) {
  if (confidence === 'high') return `We're confident in this call.`
  if (confidence === 'medium') {
    return `We're fairly confident, though we couldn't identify every part, so double-check the details before spending.`
  }
  return `Honestly, we couldn't identify enough of your parts to be sure, so treat this as a starting point, not a verdict.`
}

function planSentence({ analysis, budget }) {
  const budgetPlan = analysis?.budgetPlan
  const upgrade = upgradeText(analysis?.recommendedFirstUpgrade)

  if (!budgetPlan) return recommendationSentence(budget, upgrade)

  const topPick = budgetPlan.picks?.[0]

  if (budgetPlan.status === 'top_tier') {
    return topPick
      ? `So here's the plan: you're already near the top, so nothing is urgent. The closest thing to an upgrade in our catalog is the ${topPick.title}, and even that is a small step.`
      : `So here's the plan: you're already near the top. Everything you have matches or beats the best parts we track, so put spare money toward a future full rebuild instead.`
  }
  if (budgetPlan.status === 'no_budget') {
    return `So here's the plan: ${upgrade} would make the biggest difference here, and since you didn't give a budget, we ranked the picks below purely by value for money.`
  }
  if (budgetPlan.status === 'too_small' && topPick) {
    return `So here's the honest answer: $${budget} won't buy an upgrade you'd actually feel. The cheapest one worth doing is the ${topPick.title} at about $${topPick.price}. Saving up for it beats spending today.`
  }
  if (budgetPlan.status === 'ok' && !budgetPlan.fixesBottleneck && topPick && analysis?.bottleneck) {
    return `So here's the plan: the real fix is your ${analysis.bottleneck.shortLabel}, but that doesn't fit $${budget} yet. In the meantime, the ${topPick.title} (about $${topPick.price}) is the best value move you can make.`
  }
  return recommendationSentence(budget, upgrade)
}

function composeExplanation({ analysis, budget, userGoal }) {
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

  sentences.push(plan, price)

  return sentences.filter(Boolean).join(' ')
}

// BuildBetter writes its own beginner-friendly explanation from the analysis.
// No external AI service is used, so there is nothing to fail or warn about.
export async function createExplanation({ analysis = {}, userGoal = '', budget = 0 }) {
  return {
    source: 'builtin',
    explanation: composeExplanation({ analysis, budget, userGoal }),
    warnings: [],
  }
}
