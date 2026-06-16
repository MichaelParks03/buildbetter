import { createAiRecommendation } from './aiRecommendationService.js'
import { createExplanation } from './aiService.js'
import { searchPricing } from './pricing/pricingService.js'

const useCases = ['Gaming', 'School', 'CAD', 'Streaming', 'General Use']

function parseBudget(budget) {
  const value = Number(String(budget || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(value) ? value : 0
}

function parseRamGb(ram) {
  const match = String(ram || '').match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

function storageLooksSlow(storage) {
  const value = String(storage || '').toLowerCase()
  return !value || value.includes('hdd') || value.includes('hard drive')
}

function looksLikeLaptop(build) {
  const value = `${build.gpu || ''} ${build.case || ''} ${build.motherboard || ''}`.toLowerCase()
  return value.includes('laptop') || value.includes('notebook') || value.includes('mobile')
}

function chooseFocus(build, budget) {
  const ramGb = parseRamGb(build.ram)
  const useCase = build.useCase
  const laptop = looksLikeLaptop(build)

  if (ramGb > 0 && ramGb < 16) {
    return {
      bottleneck: 'Low RAM',
      upgrade: 'RAM',
      query: '16GB DDR4 RAM',
    }
  }

  if (storageLooksSlow(build.storage)) {
    return {
      bottleneck: 'Storage',
      upgrade: 'SSD',
      query: '1TB NVMe SSD',
    }
  }

  if (!build.gpu) {
    return {
      bottleneck: 'Missing GPU details',
      upgrade: 'GPU',
      query: budget >= 700 ? 'RTX 4060 GPU' : 'used RTX 3060 GPU',
    }
  }

  if (laptop && useCase === 'Gaming') {
    return {
      bottleneck: 'Laptop GPU headroom',
      upgrade: budget >= 700 ? 'stronger gaming laptop or desktop fund' : 'external monitor, cooling pad, or SSD',
      query: budget >= 700 ? 'gaming laptop RTX 4060' : '144Hz gaming monitor',
    }
  }

  if (useCase === 'Gaming') {
    return { bottleneck: 'GPU', upgrade: 'Graphics card', query: 'RTX 4060 GPU' }
  }

  if (useCase === 'School' || useCase === 'General Use') {
    return { bottleneck: 'Storage or RAM', upgrade: 'SSD or memory', query: '1TB NVMe SSD' }
  }

  if (useCase === 'CAD') {
    return { bottleneck: 'CPU, GPU, or RAM', upgrade: 'CPU or workstation-friendly GPU', query: 'workstation GPU' }
  }

  if (useCase === 'Streaming') {
    return { bottleneck: 'CPU or GPU encoder', upgrade: 'CPU or modern GPU', query: 'RTX 4060 GPU' }
  }

  return { bottleneck: 'Balanced upgrade needed', upgrade: 'Best value part', query: 'PC upgrade part' }
}

function getUpgradePath(budget, focus) {
  if (budget >= 1000) {
    return [
      `Start with the ${focus.upgrade}.`,
      'Check whether the power supply, motherboard, and case support the upgrade.',
      'Use remaining budget for RAM, SSD storage, cooling, or monitor improvements.',
    ]
  }

  if (budget >= 400) {
    return [
      `Prioritize one strong ${focus.upgrade} upgrade.`,
      'Compare new and used prices before buying.',
      'Save a small buffer for support parts such as cables, adapters, or power supply needs.',
    ]
  }

  return [
    'Focus on the single cheapest upgrade that solves the biggest daily frustration.',
    'Use mock and used-price estimates as a starting point, not a guaranteed market price.',
    'Wait and save if the current platform would require several parts to upgrade safely.',
  ]
}

function estimateUsedValue(build) {
  const knownParts = [build.cpu, build.gpu, build.ram, build.storage, build.motherboard].filter(Boolean).length

  if (knownParts >= 5) return '$550 - $900'
  if (knownParts >= 3) return '$350 - $650'
  if (knownParts >= 1) return '$150 - $400'
  return 'Add more parts for an estimate'
}

function fallbackRecommendation(build, budget) {
  const focus = chooseFocus(build, budget)

  return {
    source: 'fallback',
    recommendation: {
      estimatedUsedValue: {
        range: estimateUsedValue(build),
        confidence: 'demo estimate',
        disclaimer: 'This is a rough demo estimate, not guaranteed live market pricing.',
      },
      likelyBottleneck: focus.bottleneck,
      recommendedFirstUpgrade: focus.upgrade,
      upgradePath: getUpgradePath(budget, focus),
      pricingSearches: [
        {
          query: focus.query,
          category: focus.upgrade.toLowerCase(),
          condition: budget >= 700 ? 'new' : 'any',
        },
      ],
      explanation: '',
    },
    warnings: [],
  }
}

function dedupeWarnings(warnings) {
  return [...new Set(warnings.filter(Boolean))]
}

function dedupeParts(parts) {
  const seen = new Set()
  return parts.filter((part) => {
    const key = `${part.source}-${part.title}-${part.price}-${part.condition}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function searchRecommendedPricing(searches) {
  const pricingResults = await Promise.all(
    searches.map((search) =>
      searchPricing({
        query: search.query,
        category: search.category,
        condition: search.condition,
        limit: 3,
      }),
    ),
  )

  return {
    provider: pricingResults.some((result) => result.provider === 'combined')
      ? 'combined'
      : pricingResults.find((result) => result.provider !== 'mock')?.provider || 'mock',
    results: dedupeParts(pricingResults.flatMap((result) => result.results)).slice(0, 6),
    warnings: dedupeWarnings(pricingResults.flatMap((result) => result.warnings)),
  }
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
    case: rawBuild.case || rawBuild.caseName || '',
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
    warnings.push('Budget should be a positive number. BuildBetter continued with a demo budget fallback.')
  }

  if (!useCases.includes(rawBuild.useCase)) {
    warnings.push('Unknown use case. BuildBetter used General Use for this analysis.')
  }

  const aiRecommendation = await createAiRecommendation({ build, budget, useCase })
  const recommendation =
    aiRecommendation.recommendation || fallbackRecommendation(build, budget).recommendation
  const recommendationSource = aiRecommendation.recommendation ? aiRecommendation.source : 'fallback'
  const pricing = await searchRecommendedPricing(recommendation.pricingSearches)

  const analysis = {
    currentBuildSummary: build,
    estimatedUsedValue: recommendation.estimatedUsedValue,
    likelyBottleneck: recommendation.likelyBottleneck,
    recommendedFirstUpgrade: recommendation.recommendedFirstUpgrade,
    upgradePath: recommendation.upgradePath,
    recommendedParts: pricing.results,
    pricingProvider: pricing.provider,
    recommendationSource,
    explanation: recommendation.explanation,
    explanationSource: recommendationSource,
    warnings: dedupeWarnings([...warnings, ...aiRecommendation.warnings, ...pricing.warnings]),
  }

  if (recommendationSource === 'fallback') {
    const explanation = await createExplanation({
      build,
      analysis,
      pricing: pricing.results,
      userGoal: useCase,
      budget,
    })

    analysis.explanation = explanation.explanation
    analysis.explanationSource = explanation.source
    analysis.warnings = dedupeWarnings([...analysis.warnings, ...explanation.warnings])
  }

  return analysis
}
