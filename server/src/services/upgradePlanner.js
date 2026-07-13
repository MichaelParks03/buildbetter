import { curatedParts } from '../data/curatedParts.js'
import { cpuTiers, gpuTiers } from '../data/performanceTiers.js'
import { toCuratedResult } from './pricing/curatedPricingProvider.js'

// A pick only counts as "meaningful" if it moves the weighted build score by
// at least this much. Keeps us from recommending sidegrades.
const MIN_WEIGHTED_GAIN = 3

function tierScoreFor(matchName, tiers) {
  let best = null
  const name = String(matchName || '').toLowerCase()
  for (const entry of tiers) {
    if (name.includes(entry.key)) {
      if (!best || entry.key.length > best.key.length) best = entry
    }
  }
  return best ? best.score : null
}

// What a part would score once installed. GPUs/CPUs come from the tier
// rankings; RAM and SSD kits get the same scores the analysis assigns.
function targetScore(part) {
  if (part.category === 'gpu') return tierScoreFor(part.matchName, gpuTiers)
  if (part.category === 'cpu') return tierScoreFor(part.matchName, cpuTiers)
  if (part.category === 'ram') {
    if (part.matchName.includes('32gb')) return 85
    if (part.matchName.includes('16gb')) return 65
    return null
  }
  if (part.category === 'ssd') {
    return part.matchName.includes('nvme') ? 90 : 72
  }
  return null // PSUs keep the lights on but don't add performance
}

const CATEGORY_TO_COMPONENT = { gpu: 'gpu', cpu: 'cpu', ram: 'ram', ssd: 'storage' }

function ddrTypeForPlatform(platform) {
  if (platform === 'am5' || platform === 'lga1851') return 'ddr5'
  if (platform === 'am4' || platform === 'lga1200' || platform === 'lga1151' || platform === 'intel-legacy') {
    return 'ddr4'
  }
  return '' // unknown or lga1700 (boards exist for both) — allow either
}

export function planUpgrades({ bottleneck, budget, useCase }) {
  if (!bottleneck) return null

  const { scores, weights } = bottleneck
  const cpuPlatform = bottleneck.cpuMatch?.platform || ''
  const ddrType = ddrTypeForPlatform(cpuPlatform)

  // Everything that is a genuine improvement over what the user has, however
  // small. A part is never a candidate unless it beats the current score.
  const improvements = []

  for (const part of curatedParts) {
    const component = CATEGORY_TO_COMPONENT[part.category]
    if (!component) continue

    const target = targetScore(part)
    if (target === null) continue

    // Unknown current score (user left the field blank/unreadable): assume a
    // middling 40 so the planner can still rank, erring toward suggesting.
    const current = scores[component] === null ? 40 : scores[component]
    const rawGain = target - current
    if (rawGain <= 0) continue

    // CPU upgrades must fit the motherboard we can infer. If we know the
    // platform and it doesn't match, the "upgrade" really means a new
    // motherboard too — leave it out rather than surprise a beginner.
    if (part.category === 'cpu' && cpuPlatform && part.platform !== cpuPlatform) continue

    // RAM type must match what the platform supports.
    if (part.category === 'ram' && ddrType && !part.matchName.includes(ddrType)) continue

    improvements.push({
      part,
      component,
      weightedGain: rawGain * weights[component],
      valuePerDollar: (rawGain * weights[component]) / part.price,
    })
  }

  // Only meaningful improvements become normal recommendations.
  const candidates = improvements.filter((entry) => entry.weightedGain >= MIN_WEIGHTED_GAIN)

  const byValue = [...candidates].sort((a, b) => b.valuePerDollar - a.valuePerDollar)
  const cheapest = [...candidates].sort((a, b) => a.part.price - b.part.price)[0] || null

  function toPick(candidate, note) {
    return {
      ...toCuratedResult(candidate.part),
      component: candidate.component,
      weightedGain: Math.round(candidate.weightedGain * 10) / 10,
      note,
    }
  }

  if (candidates.length === 0) {
    // No meaningful upgrade exists. If any part is even a small genuine step
    // up, offer the biggest one; never suggest something worse than what the
    // user already owns.
    const bestSmallStep = [...improvements].sort((a, b) => b.weightedGain - a.weightedGain)[0] || null
    return {
      status: 'top_tier',
      budget,
      topPickComponent: bestSmallStep ? bestSmallStep.component : bottleneck.component,
      fixesBottleneck: true,
      picks: bestSmallStep
        ? [
            {
              ...toCuratedResult(bestSmallStep.part),
              component: bestSmallStep.component,
              weightedGain: Math.round(bestSmallStep.weightedGain * 10) / 10,
              note: 'Only a small step up, not urgent',
            },
          ]
        : [],
      message: bestSmallStep
        ? `Your build is already strong. The closest thing to an upgrade in our catalog is the ${bestSmallStep.part.title}, and even that is a small step, not a must-have.`
        : `Your build is already strong. Everything you have matches or beats the best parts we track, so save your money for a future full upgrade.`,
    }
  }

  if (!budget || budget <= 0) {
    return {
      status: 'no_budget',
      budget: 0,
      picks: byValue.slice(0, 4).map((candidate, index) =>
        toPick(candidate, index === 0 ? 'Best value for the money' : ''),
      ),
      message:
        'You didn’t enter a budget, so these are ranked purely by performance gained per dollar. Add a budget and we’ll narrow it down.',
    }
  }

  const affordable = byValue.filter((candidate) => candidate.part.price <= budget)

  if (affordable.length === 0) {
    return {
      status: 'too_small',
      budget,
      picks: cheapest ? [toPick(cheapest, 'Cheapest upgrade that’s actually worth it')] : [],
      message: cheapest
        ? `Honestly, $${budget} isn’t enough for an upgrade you’d actually notice. The cheapest one worth doing is the ${cheapest.part.title} at about $${cheapest.part.price}. Saving up for it beats spending today.`
        : `Honestly, $${budget} isn’t enough for an upgrade you’d notice on this build.`,
    }
  }

  // If any affordable pick actually fixes the bottleneck, lead with those —
  // fixing the real problem beats a slightly better value-per-dollar ratio.
  const fixes = affordable.filter((candidate) => candidate.component === bottleneck.component)
  const others = affordable.filter((candidate) => candidate.component !== bottleneck.component)
  const fixesBottleneck = fixes.length > 0
  const ordered = fixesBottleneck ? [...fixes, ...others] : affordable

  const picks = ordered.slice(0, 4).map((candidate, index) =>
    toPick(candidate, index === 0 ? 'Best value within your budget' : ''),
  )
  const topPick = ordered[0]

  return {
    status: 'ok',
    budget,
    picks,
    topPickComponent: topPick.component,
    fixesBottleneck,
    message: fixesBottleneck
      ? `Every pick below fits your $${budget} budget. The ${bottleneck.shortLabel} picks fix your bottleneck; the rest are strong value too.`
      : `A ${bottleneck.shortLabel} upgrade doesn’t fit $${budget} yet, so these picks are the best value moves you can make right now.`,
  }
}
