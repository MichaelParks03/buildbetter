import { cpuTiers, gpuTiers } from '../data/performanceTiers.js'

// Turns raw part names like "AMD Ryzen(TM) 5 5600X 6-Core Processor @ 3.70GHz"
// into a clean lowercase string the tier keys can be found inside.
export function normalizeHardwareName(rawName) {
  return String(rawName || '')
    .toLowerCase()
    .replace(/\(tm\)|\(r\)|™|®/g, ' ')
    .replace(/@ ?\d+(\.\d+)? ?[gm]hz/g, ' ')
    .replace(/\d+(\.\d+)? ?[gm]hz/g, ' ')
    .replace(/\d+-cores?\b/g, ' ')
    .replace(/\b(with|w\/)\s+radeon\s+graphics\b/g, ' radeon-igpu ')
    .replace(/\bgeforce\b|\bnvidia\b|\bamd\b|\bintel\b|\bradeon\b(?!-igpu)/g, ' ')
    .replace(/\bcore\b|\bprocessor\b|\bcpu\b|\bgpu\b|\bgraphics card\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isLaptopVariant(normalized) {
  return /\b(laptop|mobile|max-q)\b/.test(normalized)
}

function findTierEntry(normalized, tiers) {
  // Longest key that appears in the name wins, so "rtx 4060 ti" is not
  // mistaken for "rtx 4060".
  let best = null
  for (const entry of tiers) {
    if (normalized.includes(entry.key)) {
      if (!best || entry.key.length > best.key.length) best = entry
    }
  }
  return best
}

// Intel tier keys look like "i5-12400", but users type "i5 12400", "12400f",
// or "Intel Core i5 12400F". Give the matcher a second chance on those.
function normalizeIntelSpacing(normalized) {
  return normalized.replace(/\bi([3579])[ -]?(\d{4,5})(k?f?s?)\b/g, 'i$1-$2$3')
}

function matchAgainst(rawName, tiers) {
  const raw = String(rawName || '')
  if (!raw.trim()) return { matched: false, missing: true }

  let normalized = normalizeHardwareName(raw)
  normalized = normalizeIntelSpacing(normalized)

  // "with Radeon Graphics" in a CPU string means integrated graphics, which
  // the GPU tier list handles via the "radeon graphics" key.
  if (normalized.includes('radeon-igpu')) {
    normalized = normalized.replace(/radeon-igpu/g, 'radeon graphics')
  }

  const entry = findTierEntry(normalized, tiers)
  if (!entry) return { matched: false, missing: false, raw }

  const laptop = isLaptopVariant(normalized)
  return {
    matched: true,
    missing: false,
    raw,
    name: laptop ? `${entry.name} (laptop version)` : entry.name,
    // Laptop versions of the same chip run well below their desktop siblings.
    score: laptop ? Math.round(entry.score * 0.75) : entry.score,
    platform: entry.platform || '',
    integrated: Boolean(entry.integrated),
    laptopVariant: laptop,
  }
}

export function matchCpu(rawName) {
  return matchAgainst(rawName, cpuTiers)
}

export function matchGpu(rawName) {
  const result = matchAgainst(rawName, gpuTiers)

  // A GPU string that mentions a dedicated-card brand but matched nothing is
  // still worth distinguishing from "no GPU at all".
  return result
}
