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

export function parseSystemInfo(systemInfoText) {
  const warnings = []
  const text = String(systemInfoText || '')

  if (!text.trim()) {
    warnings.push('No system information text was provided.')
  }

  const cpu = getValue(text, 'Processor')
  const ram = getValue(text, 'Installed Physical Memory (RAM)')
  const systemModel = getValue(text, 'System Model')
  const os = getValue(text, 'OS Name')
  const boardManufacturer = getValue(text, 'BaseBoard Manufacturer')
  const boardProduct = getValue(text, 'BaseBoard Product')
  const gpuName = getValue(text, 'Name')
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
    motherboard: [boardManufacturer, boardProduct].filter(Boolean).join(' '),
    case: systemModel,
    systemModel,
    os,
    warnings,
  }
}
