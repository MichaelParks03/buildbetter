import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assessBuild } from '../src/services/analysisService.js'
import { planUpgrades } from '../src/services/upgradePlanner.js'

function planFor(build, useCase, budget) {
  const bottleneck = assessBuild(build, useCase)
  return planUpgrades({ bottleneck, budget, useCase })
}

test('CPU picks stay on the same motherboard socket', () => {
  const plan = planFor(
    { cpu: 'Ryzen 5 1600', gpu: 'RTX 3060 Ti', ram: '16GB', storage: '1TB NVMe' },
    'Gaming',
    250,
  )
  const cpuPicks = plan.picks.filter((pick) => pick.component === 'cpu')
  assert.ok(cpuPicks.length > 0)
  for (const pick of cpuPicks) {
    assert.ok(pick.title.includes('AM4'), `${pick.title} should be AM4`)
  }
})

test('RAM picks match the platform DDR type', () => {
  const plan = planFor(
    { cpu: 'Ryzen 5 7600', gpu: 'GTX 1650', ram: '8GB', storage: '1TB NVMe' },
    'General Use',
    120,
  )
  const ramPicks = plan.picks.filter((pick) => pick.component === 'ram')
  for (const pick of ramPicks) {
    assert.ok(pick.title.includes('DDR5'), `${pick.title} should be DDR5 on AM5`)
  }
})

test('a too-small budget says so and names the cheapest worthwhile part', () => {
  const plan = planFor(
    { cpu: 'i5-6600K', gpu: 'GTX 960', ram: '8GB', storage: 'HDD' },
    'Gaming',
    25,
  )
  assert.equal(plan.status, 'too_small')
  assert.equal(plan.picks.length, 1)
  assert.ok(plan.message.includes('$25'))
})

test('a maxed-out build is never offered a downgrade', () => {
  const plan = planFor(
    { cpu: 'Ryzen 9 9950X3D', gpu: 'RTX 5090', ram: '64GB', storage: '2TB NVMe' },
    'Gaming',
    2000,
  )
  assert.equal(plan.status, 'top_tier')
  assert.equal(plan.picks.length, 0)
})

test('affordable picks that fix the bottleneck lead the list', () => {
  const plan = planFor(
    { cpu: 'Ryzen 7 5800X3D', gpu: 'GTX 1060', ram: '16GB', storage: '1TB NVMe' },
    'Gaming',
    500,
  )
  assert.equal(plan.status, 'ok')
  assert.equal(plan.fixesBottleneck, true)
  assert.equal(plan.picks[0].component, 'gpu')
  for (const pick of plan.picks) {
    assert.ok(pick.price <= 500)
  }
})

test('never recommends a CPU when the exact model is unknown', () => {
  const plan = planFor(
    { cpu: 'i9', gpu: 'RTX 3060', ram: '16GB', storage: '4tb HDD' },
    'General Use',
    400,
  )
  assert.ok(plan.picks.length > 0)
  assert.ok(plan.picks.every((pick) => pick.component !== 'cpu'))
})

test('vague CPU bottleneck asks for the exact model instead of guessing', () => {
  const plan = planFor(
    { cpu: 'i9', gpu: 'RTX 4080', ram: '32GB DDR5', storage: '2TB NVMe' },
    'CAD',
    500,
  )
  assert.equal(plan.cpuModelNeeded, true)
  assert.ok(plan.message.includes('exact model'))
})

test('dead-socket CPU bottleneck explains the motherboard reality', () => {
  const plan = planFor(
    { cpu: 'i9-9900K', gpu: 'RTX 4070', ram: '32GB', storage: '1TB NVMe' },
    'CAD',
    300,
  )
  assert.equal(plan.cpuNeedsNewBoard, true)
  assert.ok(plan.message.includes('motherboard'))
})

test('healthy categories are not padded into the pick list', () => {
  const plan = planFor(
    { cpu: 'Ryzen 7 5800X3D', gpu: 'GTX 1060', ram: '32GB', storage: '1TB NVMe' },
    'Gaming',
    500,
  )
  assert.ok(plan.picks.length > 0)
  assert.ok(plan.picks.every((pick) => pick.component === 'gpu'))
})

test('no budget returns value-ranked picks and says so', () => {
  const plan = planFor(
    { cpu: 'Ryzen 5 3600', gpu: 'RX 580', ram: '16GB', storage: '1TB SSD' },
    'Gaming',
    0,
  )
  assert.equal(plan.status, 'no_budget')
  assert.ok(plan.picks.length > 0)
})
