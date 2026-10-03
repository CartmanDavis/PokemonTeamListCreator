import pokedex from '../data/pokedex.json'
import natures from '../data/natures.json'
import type { StatSpread } from './koffing'

export const STAT_IDS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const

export type StatId = (typeof STAT_IDS)[number]

export type Stats = Record<StatId, number>

const baseStatTable: Record<string, Stats | undefined> = pokedex
const natureTable: Record<string, Stats | undefined> = natures

export function getBaseStats(species: string): Stats | undefined {
  return baseStatTable[species]
}

export function getNatureModifiers(nature: string): Stats | undefined {
  return natureTable[nature]
}

export function fillSpread(spread: StatSpread | undefined, fallback: number): Stats {
  const filled = {} as Stats
  for (const stat of STAT_IDS) {
    filled[stat] = spread?.[stat] ?? fallback
  }
  return filled
}

/** Standard mainline-games stat formula. */
export function getStats(base: Stats, ivs: Stats, evs: Stats, level: number, nature: Stats): Stats {
  const stats = {} as Stats
  for (const stat of STAT_IDS) {
    const scaled = ((2 * base[stat] + evs[stat] / 4 + ivs[stat]) * level) / 100
    stats[stat] = stat === 'hp'
      ? Math.floor(scaled + level + 10)
      : Math.floor(Math.floor(scaled + 5) * nature[stat])
  }
  return stats
}

/**
 * Stat calculation in Champions with the new EVs system.
 * Pokémon are locked at level 50 with max IVs, so the formula is way simpler:
 * HP gets +75 from base while other stats get +20, then we add the EVs,
 * then apply nature (except for HP).
 */
export function getChampionsStats(base: Stats, evs: Stats, nature: Stats): Stats {
  const stats = {} as Stats
  for (const stat of STAT_IDS) {
    stats[stat] = stat === 'hp'
      ? base.hp + 75 + evs.hp
      : Math.floor((base[stat] + 20 + evs[stat]) * nature[stat])
  }
  return stats
}
