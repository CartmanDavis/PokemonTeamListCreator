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

export function fillSpread(spread: StatSpread | undefined): Stats {
  const filled = {} as Stats
  for (const stat of STAT_IDS) {
    filled[stat] = spread?.[stat] ?? 0
  }
  return filled
}

/**
 * Champions stat formula. Pokémon are fixed at level 50 with max IVs, so each stat is
 * base + 75 (HP) or base + 20 (others), plus EVs, then the nature modifier (except HP).
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
