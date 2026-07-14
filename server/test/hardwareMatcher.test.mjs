import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  estimateCpuScore,
  estimateGpuScore,
  matchCpu,
  matchGpu,
  normalizeHardwareName,
} from '../src/services/hardwareMatcher.js'

test('matches an exact CPU name to its tier score', () => {
  const result = matchCpu('AMD Ryzen 5 5600X')
  assert.equal(result.matched, true)
  assert.equal(result.name, 'AMD Ryzen 5 5600X')
  assert.equal(result.score, 52)
  assert.equal(result.platform, 'am4')
})

test('normalizes messy Windows paste format CPU strings', () => {
  const result = matchCpu('AMD Ryzen(TM) 5 3600 6-Core Processor @ 3.60GHz')
  assert.equal(result.matched, true)
  assert.equal(result.name, 'AMD Ryzen 5 3600')
})

test('longest key wins so a Ti card is not mistaken for the base card', () => {
  const base = matchGpu('RTX 4060')
  const ti = matchGpu('RTX 4060 Ti')
  assert.equal(base.score, 50)
  assert.equal(ti.score, 55)
})

test('Intel spacing variants match the dashed tier key', () => {
  const spaced = matchCpu('Intel Core i5 12400F')
  assert.equal(spaced.matched, true)
  assert.equal(spaced.name, 'Intel Core i5-12400F')
})

test('laptop GPUs are detected, discounted, and labeled', () => {
  const laptop = matchGpu('RTX 3070 Laptop GPU')
  const desktop = matchGpu('RTX 3070')
  assert.equal(laptop.laptopVariant, true)
  assert.ok(laptop.name.includes('laptop'))
  assert.ok(laptop.score < desktop.score)
})

test('normalizeHardwareName strips marks, clocks, and vendor words', () => {
  assert.equal(normalizeHardwareName('NVIDIA GeForce RTX 3060'), 'rtx 3060')
})

test('bare series names rank by class: i9 > i7 > i5 > i3', () => {
  const i3 = estimateCpuScore('i3')
  const i5 = estimateCpuScore('i5')
  const i7 = estimateCpuScore('Intel Core i7')
  const i9 = estimateCpuScore('i9')
  assert.ok(i9 > i7 && i7 > i5 && i5 > i3, `got i3=${i3} i5=${i5} i7=${i7} i9=${i9}`)

  const r5 = estimateCpuScore('Ryzen 5')
  const r7 = estimateCpuScore('ryzen 7')
  const r9 = estimateCpuScore('AMD Ryzen 9')
  assert.ok(r9 > r7 && r7 > r5, `got r5=${r5} r7=${r7} r9=${r9}`)
})

test('estimators return plausible scores for parts not in the dataset', () => {
  const gpu = estimateGpuScore('RTX 4055')
  assert.ok(gpu >= 30 && gpu <= 60, `RTX 4055 estimated ${gpu}`)

  const cpu = estimateCpuScore('i5-13500')
  assert.ok(cpu >= 45 && cpu <= 70, `i5-13500 estimated ${cpu}`)

  // Complete unknowns still get a mid-range number, never a blank.
  assert.ok(estimateGpuScore('Mystery Card 9000') > 0)
  assert.ok(estimateCpuScore('SuperChip X') > 0)
})
