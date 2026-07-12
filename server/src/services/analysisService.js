import { createExplanation } from './aiService.js'
import { matchCpu, matchGpu } from './hardwareMatcher.js'
import { searchPricing } from './pricing/pricingService.js'

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

function parseBudget(budget) {
  const value = Number(String(budget || '').replace(/[^0-9.]/g, ''))
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

function storageScore(storageText) {
  const value = String(storageText || '').toLowerCase()
  if (!value.trim()) return { score: null, kind: '' }
  if (value.includes('nvme') || value.includes('m.2')) return { score: 90, kind: 'NVMe SSD' }
  if (value.includes('ssd') || value.includes('solid state')) return { score: 72, kind: 'SSD' }
  if (
    value.includes('hdd') ||
    value.includes('hard drive') ||
    value.includes('hard disk') ||
    value.includes('5400') ||
    value.includes('7200')
  ) {
    return { score: 15, kind: 'hard drive (HDD)' }
  }
  return { score: null, kind: 'unknown type' }
}

// Scores every component 0-100, then finds the one dragging the build down
// the most for this use case: deficit = (100 - score) x importance weight.
export function assessBuild(build, useCase) {
  const weights = USE_CASE_WEIGHTS[useCase] || USE_CASE_WEIGHTS['General Use']
  const reasons = []

  const cpu = matchCpu(build.cpu)
  const gpu = matchGpu(build.gpu)
  const ramGb = parseRamGb(build.ram)
  const ram = ramScore(ramGb)
  const storage = storageScore(build.storage)

  const scores = {
    cpu: cpu.matched ? cpu.score : null,
    gpu: gpu.matched ? gpu.score : null,
    ram,
    storage: storage.score,
  }

  let unknowns = 0

  if (cpu.matched) {
    reasons.push(`We recognized your processor as the ${cpu.name} — it scores ${cpu.score}/100 in our rankings.`)
  } else if (cpu.missing) {
    unknowns += 1
    reasons.push('No processor was listed, so it was left out of the comparison.')
  } else {
    unknowns += 1
    reasons.push(`We couldn't identify the processor "${build.cpu}", so it was left out of the comparison.`)
  }

  if (gpu.matched) {
    const suffix = gpu.integrated
      ? ' — that’s built-in graphics, not a separate card, so it scores very low for heavier work.'
      : ` — it scores ${gpu.score}/100 in our rankings.`
    reasons.push(`We recognized your graphics as the ${gpu.name}${suffix}`)
  } else if (gpu.missing) {
    // No GPU listed usually means integrated graphics. Assume a very low
    // score rather than skipping the most important gaming component.
    scores.gpu = 8
    reasons.push(
      'No graphics card was listed, so we assumed built-in graphics. If you have a separate card, add it for a better answer.',
    )
  } else {
    unknowns += 1
    reasons.push(`We couldn't identify the graphics card "${build.gpu}", so it was left out of the comparison.`)
  }

  if (ram !== null) {
    reasons.push(`${ramGb}GB of RAM scores ${ram}/100.`)
  } else {
    unknowns += 1
    reasons.push('No RAM amount was listed, so memory was left out of the comparison.')
  }

  if (storage.score !== null) {
    reasons.push(`Your storage looks like a ${storage.kind}, which scores ${storage.score}/100.`)
  } else {
    unknowns += 1
    reasons.push('We couldn’t tell what kind of storage you have (SSD vs hard drive), so it was left out.')
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

  const top = deficits[0]
  const runnerUp = deficits[1] || null
  const closeCall =
    runnerUp && top.deficit > 0 && (top.deficit - runnerUp.deficit) / top.deficit < 0.15
      ? runnerUp.component
      : null

  let confidence = 'high'
  if (unknowns === 1) confidence = 'medium'
  if (unknowns >= 2) confidence = 'low'
  if ((cpu.matched && cpu.laptopVariant) || (gpu.matched && gpu.laptopVariant)) {
    if (confidence === 'high') confidence = 'medium'
    reasons.push('Laptop parts run slower than desktop versions of the same chip, so scores were adjusted down.')
  }

  return {
    component: top.component,
    label: COMPONENT_LABELS[top.component],
    confidence,
    scores,
    weights,
    reasons,
    closeCall,
    closeCallLabel: closeCall ? COMPONENT_LABELS[closeCall] : '',
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
  const steps = [`Start with the ${focus.upgrade.toLowerCase()} — that’s the part holding you back.`]

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
    steps.push('Most PCs from the last 8 years have an NVMe slot on the motherboard — check yours before buying.')
  }

  if (bottleneck?.closeCall) {
    steps.push(`Your ${bottleneck.closeCallLabel.toLowerCase()} was a close second — plan for it next.`)
  } else if (budget >= 1000) {
    steps.push('With budget left over, look at RAM, storage, cooling, or a monitor upgrade next.')
  } else {
    steps.push('Compare new and used prices with the store links before you decide.')
  }

  return steps
}

function estimateUsedValue(build) {
  const knownParts = [build.cpu, build.gpu, build.ram, build.storage, build.motherboard].filter(Boolean).length

  if (knownParts >= 5) return '$550 - $900'
  if (knownParts >= 3) return '$350 - $650'
  if (knownParts >= 1) return '$150 - $400'
  return 'Add more parts for an estimate'
}

export async function analyzeBuild(rawBuild) {
  const warnings = []
  const budget = parseBudget(rawBuild.budget)
  const useCase = useCases.includes(rawBuild.useCase) ? rawBuild.useCase : 'General Use'
  const build = {
    cpu: rawBuild.cpu || '',
    gpu: rawBuild.gpu || '',
    ram: rawBuild.ram || '',
    storage: rawBuild.storage || '',
    motherboard: rawBuild.motherboard || '',
    powerSupply: rawBuild.powerSupply || rawBuild.psu || '',
    budget,
    useCase,
  }

  if (!build.cpu && !build.gpu) {
    return {
      error: 'Enter at least a CPU or GPU before analyzing your PC.',
      warnings: ['At least CPU or GPU is needed for a useful recommendation.'],
    }
  }

  if (rawBuild.budget && budget <= 0) {
    warnings.push('Budget should be a positive number, so it was ignored for this analysis.')
  }

  if (!useCases.includes(rawBuild.useCase)) {
    warnings.push('Unknown use case. BuildBetter used General Use for this analysis.')
  }

  const bottleneck = assessBuild(build, useCase)
  const focus = bottleneck ? UPGRADE_BY_COMPONENT[bottleneck.component] : legacyFocus(useCase)

  const pricing = await searchPricing({
    query: focus.query,
    category: focus.category,
    condition: 'any',
    limit: 4,
  })

  const analysis = {
    currentBuildSummary: build,
    estimatedUsedValue: {
      range: estimateUsedValue(build),
      confidence: 'demo estimate',
      disclaimer: 'This is a rough demo estimate, not guaranteed live market pricing.',
    },
    likelyBottleneck: bottleneck ? bottleneck.label : COMPONENT_LABELS[legacyFocus(useCase).category === 'ssd' ? 'storage' : legacyFocus(useCase).category],
    bottleneck,
    recommendedFirstUpgrade: focus.upgrade,
    upgradePath: getUpgradePath(budget, focus, bottleneck),
    recommendedParts: pricing.results,
    pricingProvider: pricing.provider,
    explanation: '',
    explanationSource: 'fallback',
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
