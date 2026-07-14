import { createExplanation } from './aiService.js'
import { estimateCpuScore, estimateGpuScore, matchCpu, matchGpu } from './hardwareMatcher.js'
import { searchPricing } from './pricing/pricingService.js'
import { planUpgrades } from './upgradePlanner.js'

const useCases = ['Gaming', 'School', 'CAD', 'Streaming', 'General Use']

// How much each component matters for each use case. Rows sum to 1.
const USE_CASE_WEIGHTS = {
  Gaming: { gpu: 0.5, cpu: 0.25, ram: 0.15, storage: 0.1 },
  CAD: { cpu: 0.35, gpu: 0.3, ram: 0.25, storage: 0.1 },
  Streaming: { cpu: 0.4, gpu: 0.35, ram: 0.15, storage: 0.1 },
  School: { cpu: 0.25, gpu: 0.05, ram: 0.3, storage: 0.4 },
  'General Use': { cpu: 0.25, gpu: 0.1, ram: 0.3, storage: 0.35 },
}

const COMPONENT_LABELS = {
  gpu: 'Graphics card (GPU)',
  cpu: 'Processor (CPU)',
  ram: 'Memory (RAM)',
  storage: 'Storage',
}

// Friendlier versions for use mid-sentence.
const SHORT_LABELS = {
  gpu: 'graphics card',
  cpu: 'processor',
  ram: 'memory (RAM)',
  storage: 'storage',
}

// Keeps the minus sign so "-100" reads as a negative number to be rejected,
// not silently turned into a positive budget.
function parseBudget(budget) {
  const value = Number(String(budget || '').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(value) ? value : 0
}

function parseRamGb(ram) {
  const match = String(ram || '').match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

function ramScore(gb) {
  if (!gb || gb <= 0) return null
  if (gb < 8) return 10
  if (gb < 12) return 35
  if (gb < 16) return 45
  if (gb < 24) return 65
  if (gb < 32) return 72
  if (gb < 48) return 85
  return 95
}

// Reads any of the ways people write storage: "4TB", "1tb HDD", "500 GB SSD",
// "2 tb nvme", "512gb", and so on. Type drives the score (speed is what the
// user feels); size nudges it.
function storageScore(storageText) {
  const value = String(storageText || '').toLowerCase()
  if (!value.trim()) return { score: null, kind: '', estimated: false, tip: '' }

  // Size in GB, from "4tb", "500 gb", "1.5 TB", "512gb"...
  const sizeMatch = value.match(/(\d+(?:\.\d+)?)\s*(tb|gb|mb)\b/)
  let sizeGb = null
  let sizeLabel = ''
  if (sizeMatch) {
    const amount = Number(sizeMatch[1])
    sizeGb = sizeMatch[2] === 'tb' ? amount * 1000 : sizeMatch[2] === 'gb' ? amount : amount / 1000
    sizeLabel = `${sizeMatch[1]}${sizeMatch[2].toUpperCase()}`
  }

  let base
  let typeLabel
  let estimated = false
  if (value.includes('nvme') || value.includes('m.2')) {
    base = 90
    typeLabel = 'NVMe SSD'
  } else if (value.includes('ssd') || value.includes('solid state')) {
    base = 72
    typeLabel = 'SSD'
  } else if (
    value.includes('hdd') ||
    value.includes('hard drive') ||
    value.includes('hard disk') ||
    value.includes('5400') ||
    value.includes('7200')
  ) {
    base = 15
    typeLabel = 'hard drive (HDD)'
  } else {
    // Only a size (or something unreadable). Most PCs from the last several
    // years use an SSD, so assume that rather than leaving the field blank.
    base = 60
    typeLabel = 'drive (assumed SSD)'
    estimated = true
  }

  // Capacity nudges the score; it never rescues a slow drive type.
  let sizeAdjust = 0
  if (sizeGb !== null) {
    if (sizeGb < 120) sizeAdjust = -25
    else if (sizeGb < 250) sizeAdjust = -12
    else if (sizeGb < 500) sizeAdjust = -6
    else if (sizeGb >= 2000) sizeAdjust = 4
  }

  let tip = ''
  if (sizeGb !== null && sizeGb < 32) {
    tip = 'That looks unusually small for storage. If you meant memory, put it in the RAM field; storage is usually 256GB or more.'
  }

  const score = Math.max(5, Math.min(95, base + sizeAdjust))
  const kind = sizeLabel ? `${sizeLabel} ${typeLabel}` : typeLabel
  return { score, kind, estimated, tip }
}

// Scores every component 0-100, then finds the one dragging the build down
// the most for this use case: deficit = (100 - score) x importance weight.
// Every part the user actually entered gets a score: an exact match from the
// tier dataset when possible, otherwise a heuristic estimate.
export function assessBuild(build, useCase) {
  const weights = USE_CASE_WEIGHTS[useCase] || USE_CASE_WEIGHTS['General Use']
  const reasons = []
  let softCount = 0 // estimated or assumed values that lower our confidence

  // --- CPU ---
  const cpu = matchCpu(build.cpu)
  let cpuInfo = null
  if (cpu.matched) {
    cpuInfo = { name: cpu.name, score: cpu.score, estimated: false }
    reasons.push(`We recognized your processor as the ${cpu.name}. It scores ${cpu.score}/100 in our rankings.`)
  } else if (build.cpu.trim()) {
    const score = estimateCpuScore(build.cpu)
    cpuInfo = { name: build.cpu.trim(), score, estimated: true }
    softCount += 1
    reasons.push(`We didn't have "${build.cpu.trim()}" in our rankings, so we estimated it at about ${score}/100.`)
    if (/^(intel\s+)?(core\s+)?i[3579]$/i.test(build.cpu.trim()) || /^(amd\s+)?ryzen\s+[3579]$/i.test(build.cpu.trim())) {
      reasons.push(
        'Tip: a series name alone covers many generations. Add the full model, like i7-12700K or Ryzen 7 5800X, for a more accurate score.',
      )
    }
  } else {
    reasons.push('No processor was listed, so it was left out of the comparison.')
  }

  // --- GPU ---
  const gpu = matchGpu(build.gpu)
  let gpuInfo = null
  if (gpu.matched) {
    gpuInfo = { name: gpu.name, score: gpu.score, estimated: false, integrated: gpu.integrated }
    const suffix = gpu.integrated
      ? '. That is built-in graphics, not a separate card, so it scores low for heavier work.'
      : `. It scores ${gpu.score}/100 in our rankings.`
    reasons.push(`We recognized your graphics as the ${gpu.name}${suffix}`)
  } else if (build.gpu.trim()) {
    const score = estimateGpuScore(build.gpu)
    gpuInfo = { name: build.gpu.trim(), score, estimated: true }
    softCount += 1
    reasons.push(`We didn't have "${build.gpu.trim()}" in our rankings, so we estimated it at about ${score}/100.`)
  } else {
    // No GPU listed usually means integrated graphics. Assume a low score
    // rather than skipping the most important gaming component.
    gpuInfo = { name: 'built-in graphics (assumed)', score: 8, estimated: true, integrated: true }
    softCount += 1
    reasons.push(
      'No graphics card was listed, so we assumed built-in graphics. If you have a separate card, add it for a better answer.',
    )
  }

  // --- RAM ---
  const ramGb = parseRamGb(build.ram)
  let ram = ramScore(ramGb)
  if (ram !== null) {
    reasons.push(`${ramGb}GB of RAM scores ${ram}/100.`)
  } else if (build.ram.trim()) {
    // Text entered but no size we could read — assume a typical 16GB.
    ram = 45
    softCount += 1
    reasons.push(`We couldn't read a size from "${build.ram.trim()}", so we assumed about 16GB (${ram}/100).`)
  } else {
    reasons.push('No RAM amount was listed, so memory was left out of the comparison.')
  }

  // --- Storage ---
  const storage = storageScore(build.storage)
  if (storage.score !== null && !storage.estimated) {
    reasons.push(`Your storage looks like a ${storage.kind}, which scores ${storage.score}/100.`)
  } else if (storage.estimated) {
    softCount += 1
    reasons.push(
      `We read your storage as a ${storage.kind} since you didn't say SSD or hard drive, scoring it ${storage.score}/100.`,
    )
  } else {
    reasons.push('No storage was listed, so it was left out of the comparison.')
  }
  if (storage.tip) {
    reasons.push(storage.tip)
  }

  const scores = {
    cpu: cpuInfo ? cpuInfo.score : null,
    gpu: gpuInfo ? gpuInfo.score : null,
    ram,
    storage: storage.score,
  }

  const deficits = Object.entries(scores)
    .filter(([, score]) => score !== null)
    .map(([component, score]) => ({
      component,
      score,
      deficit: (100 - score) * weights[component],
    }))
    .sort((a, b) => b.deficit - a.deficit)

  if (deficits.length === 0) {
    return null
  }

  let top = deficits[0]

  // Balance check: a much weaker CPU holds back any new graphics card, even
  // when the raw GPU deficit looks bigger. Put the processor first so the
  // user doesn't buy a card their CPU can't feed.
  if (
    top.component === 'gpu' &&
    scores.cpu !== null &&
    scores.gpu !== null &&
    scores.cpu < scores.gpu - 15
  ) {
    const cpuEntry = deficits.find((entry) => entry.component === 'cpu')
    if (cpuEntry) {
      top = cpuEntry
      reasons.push(
        'Your processor is so far behind your graphics card that it would hold a new card back, so the processor comes first.',
      )
    }
  }

  const wellBalanced = top.score >= 85

  const runnerUp = deficits.find((entry) => entry.component !== top.component) || null
  const closeCall =
    runnerUp &&
    top.deficit > 0 &&
    (top.deficit - runnerUp.deficit) / top.deficit < 0.15
      ? runnerUp.component
      : null

  let confidence = 'high'
  if (softCount === 1) confidence = 'medium'
  if (softCount >= 2) confidence = 'low'
  if ((cpu.matched && cpu.laptopVariant) || (gpu.matched && gpu.laptopVariant)) {
    if (confidence === 'high') confidence = 'medium'
    reasons.push('Laptop parts run slower than desktop versions of the same chip, so scores were adjusted down.')
  }

  return {
    component: top.component,
    label: COMPONENT_LABELS[top.component],
    shortLabel: SHORT_LABELS[top.component],
    confidence,
    scores,
    weights,
    reasons,
    closeCall,
    closeCallLabel: closeCall ? SHORT_LABELS[closeCall] : '',
    wellBalanced,
    cpuInfo,
    gpuInfo,
    // Precise matches only — the planner needs the socket/DDR platform.
    cpuMatch: cpu.matched ? { name: cpu.name, score: cpu.score, platform: cpu.platform } : null,
    gpuMatch: gpu.matched
      ? { name: gpu.name, score: gpu.score, integrated: gpu.integrated }
      : null,
    ramGb,
    storageKind: storage.kind,
  }
}

const UPGRADE_BY_COMPONENT = {
  gpu: { upgrade: 'Graphics card', query: 'GPU graphics card', category: 'gpu' },
  cpu: { upgrade: 'Processor', query: 'CPU processor', category: 'cpu' },
  ram: { upgrade: 'More RAM', query: 'RAM memory kit', category: 'ram' },
  storage: { upgrade: 'NVMe SSD', query: 'NVMe SSD', category: 'ssd' },
}

// Last-resort focus when nothing could be scored (all fields empty/unreadable).
function legacyFocus(useCase) {
  if (useCase === 'Gaming' || useCase === 'Streaming') return UPGRADE_BY_COMPONENT.gpu
  if (useCase === 'CAD') return UPGRADE_BY_COMPONENT.cpu
  return UPGRADE_BY_COMPONENT.storage
}

function getUpgradePath(budget, focus, bottleneck) {
  const steps = [`Start with the ${focus.upgrade.toLowerCase()}, the part holding you back.`]

  if (focus.category === 'cpu') {
    steps.push('A new processor may need a matching motherboard. Check that the socket matches before buying.')
  }
  if (focus.category === 'gpu') {
    steps.push('Make sure your power supply has enough wattage and your case has room for the new card.')
  }
  if (focus.category === 'ram') {
    steps.push('Match the RAM type (DDR4 or DDR5) to what your motherboard supports.')
  }
  if (focus.category === 'ssd') {
    steps.push('Most PCs from the last 8 years have an NVMe slot on the motherboard, so check yours before buying.')
  }

  if (bottleneck?.closeCall) {
    steps.push(`Your ${bottleneck.closeCallLabel.toLowerCase()} was a close second, so plan for it next.`)
  } else if (budget >= 1000) {
    steps.push('With budget left over, look at RAM, storage, cooling, or a monitor upgrade next.')
  } else {
    steps.push('Compare new and used prices with the store links before you decide.')
  }

  return steps
}

// Rough used-market dollar value per component, keyed off the same 0-100
// performance scores the analysis computes. Brackets are [scoreBelow, value].
const GPU_VALUE_BRACKETS = [
  [15, 30], [25, 60], [35, 100], [45, 150], [55, 220],
  [65, 320], [75, 450], [85, 650], [95, 900], [Infinity, 1400],
]
const CPU_VALUE_BRACKETS = [
  [25, 30], [35, 60], [45, 90], [55, 130], [65, 180],
  [75, 260], [85, 350], [95, 450], [Infinity, 550],
]

function bracketValue(score, brackets) {
  for (const [below, value] of brackets) {
    if (score < below) return value
  }
  return brackets[brackets.length - 1][1]
}

function ramUsedValue(gb) {
  if (!gb || gb <= 0) return 0
  if (gb < 8) return 10
  if (gb < 16) return 20
  if (gb < 24) return 35
  if (gb < 32) return 45
  if (gb < 48) return 60
  return 90
}

function storageUsedValue(kind) {
  if (kind.includes('NVMe')) return 60
  if (kind.includes('SSD')) return 40
  if (kind.includes('hard drive')) return 15
  return 0
}

function roundTo25(value) {
  return Math.round(value / 25) * 25
}

// Sums per-component used values from the computed scores, then shows a
// range. Still a rough estimate, but a flagship build and a budget build now
// get very different numbers.
function estimateUsedValue(build, bottleneck) {
  if (!bottleneck) {
    return 'Add more parts for an estimate'
  }

  const scores = bottleneck.scores
  let total = 0

  if (build.cpu && scores.cpu !== null) {
    total += bracketValue(scores.cpu, CPU_VALUE_BRACKETS)
  }
  // Integrated graphics have no resale value separate from the CPU.
  if (build.gpu && scores.gpu !== null && !bottleneck.gpuInfo?.integrated) {
    total += bracketValue(scores.gpu, GPU_VALUE_BRACKETS)
  }
  total += ramUsedValue(bottleneck.ramGb)
  total += storageUsedValue(bottleneck.storageKind || '')
  if (build.motherboard) total += 60
  if (build.powerSupply && build.powerSupply.toLowerCase() !== 'not sure') total += 40

  if (total <= 0) {
    return 'Add more parts for an estimate'
  }

  const low = Math.max(25, roundTo25(total * 0.8))
  const high = roundTo25(total * 1.2)
  return `$${low} - $${high}`
}

// No real part name needs more than this; longer input is a paste mistake or
// someone probing the API.
const FIELD_CAP = 120

export async function analyzeBuild(rawBuild) {
  const warnings = []
  let truncated = false

  function capField(value) {
    const text = String(value || '')
    if (text.length > FIELD_CAP) {
      truncated = true
      return text.slice(0, FIELD_CAP)
    }
    return text
  }

  const parsedBudget = parseBudget(rawBuild.budget)
  const budget = Math.max(0, parsedBudget)
  const useCase = useCases.includes(rawBuild.useCase) ? rawBuild.useCase : 'General Use'
  const build = {
    cpu: capField(rawBuild.cpu),
    gpu: capField(rawBuild.gpu),
    ram: capField(rawBuild.ram),
    storage: capField(rawBuild.storage),
    motherboard: capField(rawBuild.motherboard),
    powerSupply: capField(rawBuild.powerSupply || rawBuild.psu),
    budget,
    useCase,
  }

  if (truncated) {
    warnings.push('Some entries were unusually long, so they were shortened before the analysis.')
  }

  if (!build.cpu && !build.gpu) {
    return {
      error: 'Enter at least a CPU or GPU before analyzing your PC.',
      warnings: ['At least CPU or GPU is needed for a useful recommendation.'],
    }
  }

  if (rawBuild.budget && parsedBudget <= 0) {
    warnings.push('Budget should be a positive number, so it was ignored for this analysis.')
  }

  if (!useCases.includes(rawBuild.useCase)) {
    warnings.push('Unknown use case. BuildBetter used General Use for this analysis.')
  }

  const bottleneck = assessBuild(build, useCase)
  const budgetPlan = planUpgrades({ bottleneck, budget, useCase })

  // When the budget can't reach the bottleneck, recommend the best move that
  // actually fits instead of a part the user can't buy.
  const bottleneckFocus = bottleneck ? UPGRADE_BY_COMPONENT[bottleneck.component] : legacyFocus(useCase)
  const focus =
    budgetPlan?.status === 'ok' && !budgetPlan.fixesBottleneck
      ? UPGRADE_BY_COMPONENT[budgetPlan.topPickComponent]
      : bottleneckFocus

  // When the planner ran, its picks are final, even an empty list (a build
  // that beats everything in the catalog gets no parts pushed at it). Only
  // fall back to a raw catalog search when nothing could be scored at all.
  const pricing = budgetPlan
    ? { provider: 'curated', results: budgetPlan.picks, warnings: [] }
    : await searchPricing({
        query: focus.query,
        category: focus.category,
        condition: 'any',
        limit: 4,
      })

  const analysis = {
    currentBuildSummary: build,
    estimatedUsedValue: {
      range: estimateUsedValue(build, bottleneck),
      confidence: 'demo estimate',
      disclaimer: 'This is a rough estimate based on your parts, not guaranteed live market pricing.',
    },
    likelyBottleneck: bottleneck ? bottleneck.label : COMPONENT_LABELS[legacyFocus(useCase).category === 'ssd' ? 'storage' : legacyFocus(useCase).category],
    bottleneck,
    budgetPlan,
    recommendedFirstUpgrade: focus.upgrade,
    upgradePath: getUpgradePath(budget, focus, bottleneck),
    recommendedParts: pricing.results,
    pricingProvider: pricing.provider,
    explanation: '',
    explanationSource: 'builtin',
    warnings: [...warnings, ...pricing.warnings],
  }

  if (!bottleneck) {
    analysis.warnings.push(
      'BuildBetter could not score any of the listed parts, so this is a general suggestion rather than a measured result.',
    )
  }

  const explanation = await createExplanation({
    build,
    analysis,
    pricing: pricing.results,
    userGoal: useCase,
    budget,
  })

  analysis.explanation = explanation.explanation
  analysis.explanationSource = explanation.source
  analysis.warnings = [...analysis.warnings, ...explanation.warnings]

  return analysis
}
