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

export function parseSystemInfo(systemInfoText) {
  const warnings = []
  const text = String(systemInfoText || '')

  if (!text.trim()) {
    warnings.push('No system information text was provided.')
  }

  const cpu = getValue(text, 'Processor')
  const ram = getFirstValue(text, [
    'Installed Physical Memory (RAM)',
    'Installed RAM',
    'Total Physical Memory',
  ])
  const storage = getValue(text, 'Storage')
  const systemModel = getFirstValue(text, ['System Model', 'Device Name'])
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
    case: systemModel,
    systemModel,
    os,
    warnings,
  }
}
