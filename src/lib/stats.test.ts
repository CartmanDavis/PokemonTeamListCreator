import { describe, expect, it } from 'vitest'
import { fillSpread, getBaseStats, getChampionsStats, getNatureModifiers } from './stats'

describe('getChampionsStats', () => {
  it('adds the Champions offsets and EVs, then applies the nature', () => {
    const stats = getChampionsStats(
      getBaseStats('Incineroar')!,
      fillSpread({ hp: 32, atk: 2, spd: 32 }),
      getNatureModifiers('Careful')!,
    )
    expect(stats).toEqual({ hp: 202, atk: 137, def: 110, spa: 90, spd: 156, spe: 80 })
  })

  it('rounds down after the nature modifier', () => {
    const stats = getChampionsStats(getBaseStats('Flutter Mane')!, fillSpread({ spe: 32 }), getNatureModifiers('Timid')!)
    // (135 + 20 + 32) * 1.1 = 205.7
    expect(stats.spe).toBe(205)
  })
})

describe('fillSpread', () => {
  it('fills missing stats with 0', () => {
    expect(fillSpread({ atk: 10 })).toEqual({ hp: 0, atk: 10, def: 0, spa: 0, spd: 0, spe: 0 })
    expect(fillSpread(undefined)).toEqual({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 })
  })
})

describe('lookups', () => {
  it('returns undefined for unknown species and natures', () => {
    expect(getBaseStats('Missingno')).toBeUndefined()
    expect(getNatureModifiers('Grumpy')).toBeUndefined()
  })
})
