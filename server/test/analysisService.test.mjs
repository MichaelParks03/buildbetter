import assert from 'node:assert/strict'
import { test } from 'node:test'
import { analyzeBuild, assessBuild } from '../src/services/analysisService.js'

const gamingBuild = {
  cpu: 'AMD Ryzen 7 5800X3D',
  gpu: 'GTX 1060',
  ram: '16GB',
  storage: '1TB NVMe',
  budget: 500,
  useCase: 'Gaming',
}

test('a weak GPU on a strong gaming build is the bottleneck', () => {
  const result = assessBuild(gamingBuild, 'Gaming')
  assert.equal(result.component, 'gpu')
  assert.equal(result.confidence, 'high')
})

test('a far weaker CPU outranks the raw GPU deficit', () => {
  const result = assessBuild(
    { cpu: 'Ryzen 5 1600', gpu: 'RTX 3060 Ti', ram: '16GB', storage: '1TB NVMe' },
    'Gaming',
  )
  assert.equal(result.component, 'cpu')
})

test('every entered part gets a score, even unknown ones', () => {
  const result = assessBuild(
    { cpu: 'SuperChip 9000', gpu: 'MysteryCard X', ram: 'fast', storage: '512GB' },
    'Gaming',
  )
  assert.notEqual(result.scores.cpu, null)
  assert.notEqual(result.scores.gpu, null)
  assert.notEqual(result.scores.ram, null)
  assert.notEqual(result.scores.storage, null)
  assert.equal(result.confidence, 'low')
})

test('negative budgets are rejected with a warning, not made positive', async () => {
  const result = await analyzeBuild({ ...gamingBuild, budget: '-100' })
  assert.equal(result.currentBuildSummary.budget, 0)
  assert.ok(result.warnings.some((warning) => warning.includes('positive number')))
  assert.equal(result.budgetPlan.status, 'no_budget')
})

test('oversized field input is capped with a warning', async () => {
  const result = await analyzeBuild({ ...gamingBuild, cpu: 'A'.repeat(50000) })
  assert.equal(result.currentBuildSummary.cpu.length, 120)
  assert.ok(result.warnings.some((warning) => warning.includes('shortened')))
})

test('used value scales with part quality', async () => {
  const flagship = await analyzeBuild({
    cpu: 'Ryzen 9 9950X3D',
    gpu: 'RTX 5090',
    ram: '64GB',
    storage: '2TB NVMe',
    budget: 2000,
    useCase: 'Gaming',
  })
  const budget = await analyzeBuild({
    cpu: 'Ryzen 3 3100',
    gpu: 'GTX 1050',
    ram: '8GB',
    storage: '1TB HDD',
    budget: 200,
    useCase: 'Gaming',
  })

  const lowEnd = Number(flagship.estimatedUsedValue.range.match(/\d+/)[0])
  const highEnd = Number(budget.estimatedUsedValue.range.match(/\d+/)[0])
  assert.ok(lowEnd > highEnd * 3, `${flagship.estimatedUsedValue.range} vs ${budget.estimatedUsedValue.range}`)
})

test('requires at least a CPU or GPU', async () => {
  const result = await analyzeBuild({ ram: '16GB' })
  assert.ok(result.error)
})

test('storage input variations all parse to sensible scores', () => {
  const base = { cpu: 'Ryzen 5 5600X', gpu: 'RTX 3060', ram: '16GB' }
  const score = (storage) => assessBuild({ ...base, storage }, 'General Use').scores.storage

  assert.equal(score('2 tb nvme'), 94)
  assert.equal(score('m.2 1 TB'), 90)
  assert.equal(score('500 GB SSD'), 72)
  assert.equal(score('4tb HDD'), 19)
  assert.ok(score('250GB hdd') < score('4tb HDD'), 'smaller HDD scores lower')
  assert.equal(score('4TB'), 64) // size only: assumed SSD
  assert.ok(score('1gb') < score('512gb'), 'tiny sizes score lower')

  const tiny = assessBuild({ ...base, storage: '1gb' }, 'General Use')
  assert.ok(tiny.reasons.some((reason) => reason.includes('unusually small')))
})
