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

function clampScore(value) {
  return Math.max(5, Math.min(100, Math.round(value)))
}

// --- Heuristic fallback scoring ---
// When a part isn't in the tier dataset, estimate a rough 0-100 score from
// common naming patterns (brand, series, model number) so every entered part
// still gets a reasonable number instead of a blank. These are ballpark only
// and lower the analysis confidence.

export function estimateGpuScore(rawName) {
  const n = normalizeHardwareName(rawName)
  const laptop = isLaptopVariant(n)
  const laptopFactor = laptop ? 0.75 : 1

  // NVIDIA GeForce RTX / GTX, e.g. "rtx 4070 ti", "gtx 1660 super"
  let match = n.match(/\b(rtx|gtx)\s*(\d{3,4})\s*(ti|super)?/)
  if (match) {
    const num = Number(match[2])
    const gen = Math.floor(num / 100) // 4070->40, 1660->16, 980->9
    const tier = num % 100 // 70, 60, 80
    const genBase = { 50: 55, 40: 50, 30: 42, 20: 37, 16: 26, 10: 22, 9: 12, 7: 8 }[gen]
    if (genBase != null) {
      const tierAdj =
        tier >= 90 ? 32 : tier >= 80 ? 22 : tier >= 70 ? 12 : tier >= 60 ? 0 : tier >= 50 ? -8 : -14
      const suffixAdj = match[3] ? 4 : 0
      return clampScore((genBase + tierAdj + suffixAdj) * laptopFactor)
    }
  }

  // AMD Radeon RX, e.g. "rx 7800 xt", "rx 580"
  match = n.match(/\brx\s*(\d{3,4})\s*(xt|xtx|gre)?/)
  if (match) {
    const num = Number(match[1])
    const suffixAdj = match[2] === 'xtx' ? 6 : match[2] ? 4 : 0
    if (num >= 1000) {
      const gen = Math.floor(num / 1000) // 7800->7, 9070->9
      const tierClass = Math.floor((num % 1000) / 100) // 800->8, 070->0
      const genBase = { 9: 60, 7: 45, 6: 40, 5: 37 }[gen] ?? 30
      const tierAdj =
        { 9: 28, 8: 18, 7: 8, 6: 0, 5: -8, 4: -12, 3: -14, 2: -16, 1: -18, 0: -20 }[tierClass] ?? 0
      return clampScore((genBase + tierAdj + suffixAdj) * laptopFactor)
    }
    // 3-digit Polaris-era cards (RX 580, RX 470) are all low-end today.
    const hundreds = Math.floor(num / 100)
    const base = hundreds >= 5 ? 20 : hundreds >= 4 ? 17 : 15
    return clampScore((base + suffixAdj) * laptopFactor)
  }

  // Intel Arc, e.g. "arc b580", "arc a750"
  match = n.match(/\barc\s*([ab])(\d{3})/)
  if (match) {
    const num = Number(match[2])
    const base = match[1] === 'b' ? 45 : 35
    const adj = num >= 700 ? 6 : num >= 500 ? 0 : -18
    return clampScore((base + adj) * laptopFactor)
  }

  // Unrecognized but clearly a real entry: neutral mid-low dedicated-card guess.
  return clampScore(35 * laptopFactor)
}

export function estimateCpuScore(rawName) {
  const n = normalizeIntelSpacing(normalizeHardwareName(rawName))
  const laptop = isLaptopVariant(n)
  const laptopFactor = laptop ? 0.75 : 1

  // Intel Core i-series, e.g. "i5-13500", "i7-9700k"
  let match = n.match(/\bi([3579])-?(\d{4,5})/)
  if (match) {
    const cls = Number(match[1]) // 3,5,7,9
    const model = match[2]
    const gen = Number(model.slice(0, model.length - 3)) // 13500->13, 9400->9
    const genBase =
      { 14: 60, 13: 60, 12: 52, 11: 45, 10: 42, 9: 40, 8: 36, 7: 30, 6: 27, 5: 24, 4: 22 }[gen] ?? 30
    const clsAdj = { 3: -12, 5: 0, 7: 14, 9: 24 }[cls] ?? 0
    return clampScore((genBase + clsAdj) * laptopFactor)
  }

  // Intel Core Ultra, e.g. "core ultra 7 265k"
  match = n.match(/\bultra\s*([3579])\s*(\d{3})/)
  if (match) {
    const cls = Number(match[1])
    const clsAdj = { 3: -12, 5: 0, 7: 14, 9: 24 }[cls] ?? 0
    return clampScore(72 + clsAdj)
  }

  // Bare "Core Ultra 7" with no model number: assume a current midrange chip.
  match = n.match(/\bultra\s*([3579])\b/)
  if (match) {
    const clsAdj = { 3: -12, 5: 0, 7: 14, 9: 24 }[Number(match[1])] ?? 0
    return clampScore((70 + clsAdj) * laptopFactor)
  }

  // AMD Ryzen, e.g. "ryzen 5 5600x", "ryzen 7 7800x3d", "ryzen 5 8600g"
  match = n.match(/\bryzen\s*([3579])\s*(\d{3,4})\s*(x3d|xt|x|ge|g)?/)
  if (match) {
    const cls = Number(match[1])
    const num = Number(match[2])
    const gen = Math.floor(num / 1000) // 5600->5, 7600->7, 9600->9
    const genBase = { 9: 68, 8: 56, 7: 64, 5: 52, 3: 43, 2: 33, 1: 28 }[gen] ?? 40
    const clsAdj = { 3: -12, 5: 0, 7: 12, 9: 22 }[cls] ?? 0
    const suffix = match[3] || ''
    const sufAdj = suffix === 'x3d' ? 6 : suffix === 'g' || suffix === 'ge' ? -6 : suffix === 'x' ? 2 : 0
    return clampScore((genBase + clsAdj + sufAdj) * laptopFactor)
  }

  // Bare series names with no model number, like "i7", "i9", "Ryzen 5".
  // These cover many generations, so assume a mid-generation desktop chip
  // of that class; the class alone still ranks them sensibly (i9 > i7 > i5).
  match = n.match(/\bi([3579])\b/)
  if (match) {
    const base = { 3: 28, 5: 38, 7: 50, 9: 60 }[Number(match[1])]
    return clampScore(base * laptopFactor)
  }

  match = n.match(/\bryzen\s*([3579])\b/)
  if (match) {
    const base = { 3: 30, 5: 42, 7: 52, 9: 62 }[Number(match[1])]
    return clampScore(base * laptopFactor)
  }

  // Unrecognized but clearly a real entry: neutral mid guess.
  return clampScore(42 * laptopFactor)
}
