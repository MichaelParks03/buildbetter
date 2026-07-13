function getValue(systemInfoText, label) {
  const lines = String(systemInfoText).split(/\r?\n/)
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const line = lines.find((currentLine) =>
    currentLine.trim().toLowerCase().startsWith(label.toLowerCase()),
  )

  if (!line) return ''

  return line
    .trim()
    .replace(new RegExp(`^${escapedLabel}\\s*:?\\s*`, 'i'), '')
    .trim()
}

function getFirstValue(systemInfoText, labels) {
  for (const label of labels) {
    const value = getValue(systemInfoText, label)

    if (value) return value
  }

  return ''
}

// Windows System Information has no line starting with "Storage"; drives live
// under Components > Storage > Disks as "Model" lines. Look for anything that
// reads like a drive model or type anywhere in the paste.
function findStorageLine(systemInfoText) {
  const lines = String(systemInfoText).split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // Skip lines that mention other components.
    if (/baseboard|processor|display|adapter|graphics|bios|memory \(ram\)/i.test(trimmed)) continue

    const value = trimmed.includes('\t')
      ? trimmed.split('\t').slice(1).join(' ').trim()
      : trimmed

    if (/nvme|\bssd\b|solid state/i.test(value)) return value
    if (/\b(wdc wd|st\d{6,}|hgst|seagate|western digital|hitachi hd|toshiba (dt|mq|hd))/i.test(value)) {
      return value
    }
  }

  return ''
}

export function parseSystemInfo(systemInfoText) {
  const warnings = []
  let text = String(systemInfoText || '')

  // Guard against enormous pastes; real system info exports are far smaller.
  const PASTE_CAP = 20000
  if (text.length > PASTE_CAP) {
    text = text.slice(0, PASTE_CAP)
    warnings.push('The pasted text was very long, so only the first part was read.')
  }

  if (!text.trim()) {
    warnings.push('No system information text was provided.')
  }

  const cpu = getValue(text, 'Processor')
  const ram = getFirstValue(text, [
    'Installed Physical Memory (RAM)',
    'Installed RAM',
    'Total Physical Memory',
  ])
  const storage = getValue(text, 'Storage') || findStorageLine(text)
  const os = getFirstValue(text, ['OS Name', 'Edition'])
  const boardManufacturer = getValue(text, 'BaseBoard Manufacturer')
  const boardProduct = getValue(text, 'BaseBoard Product')
  const gpuName = getFirstValue(text, ['Graphics Card', 'GPU', 'Name'])
  const adapterDescription = getValue(text, 'Adapter Description')
  const gpu = [gpuName, adapterDescription].find(
    (value) => value && !value.toLowerCase().includes('microsoft'),
  )

  if (!cpu && !gpu && text.trim()) {
    warnings.push('BuildBetter could not find CPU or GPU details in the pasted text.')
  }

  return {
    cpu,
    gpu: gpu || '',
    ram,
    storage,
    motherboard: [boardManufacturer, boardProduct].filter(Boolean).join(' '),
    os,
    warnings,
  }
}
