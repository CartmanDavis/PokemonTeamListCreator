import natures from '../../data/natures.json'
import pokedex from '../../data/pokedex.json'
import type { Pokemon } from '../koffing'
import { STAT_IDS, fillSpread, getBaseStats, getChampionsStats, getNatureModifiers, type StatId, type Stats } from '../stats'
import { looksLike, normalizeName } from './match'
import type { MovesScreenPokemon, NatureArrows, StatsScreenPokemon } from './read'

export interface Check {
  label: string
  /** What the teamsheet says; empty when there's nothing, like no nickname. */
  expected: string
  /** What the screenshot shows. */
  found: string
  ok: boolean
  /** Something to flag about the row that isn't an error, e.g. "Inferred from the stats". */
  note?: string
}

export interface PokemonReport {
  /** The species from the paste, or what the game shows for a Pokémon the paste doesn't have. */
  name: string
  /** Where the Pokémon is in the game's team, from 0; undefined when it isn't in the screenshots. */
  gameSlot?: number
  checks: Check[]
}

export interface TeamScreens {
  moves?: MovesScreenPokemon[]
  stats?: StatsScreenPokemon[]
}

const STAT_NAMES: Record<StatId, string> = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' }

/**
 * Compares the Pokémon in a Showdown paste with the game's screenshots. Each Pokémon is paired
 * with the game Pokémon most like it, so the paste can list them in any order. Reports follow the
 * paste's order, then any game Pokémon the paste doesn't have.
 */
export function verifyTeam(team: Pokemon[], screens: TeamScreens): PokemonReport[] {
  const gameSize = Math.max(screens.moves?.length ?? 0, screens.stats?.length ?? 0)
  const species = Array.from({ length: gameSize }, (_, slot) => {
    const stats = screens.stats?.[slot]
    return stats ? inferSpecies(stats) : []
  })
  const shownAs = (slot: number) => screens.moves?.[slot]?.name ?? screens.stats?.[slot]?.name ?? ''
  const pairs = pairUp(team.length, gameSize, (i, slot) =>
    likeness(team[i], shownAs(slot), species[slot], screens.moves?.[slot]),
  )

  const reports: PokemonReport[] = team.map((poke, i) => {
    const slot = pairs[i]
    if (slot === undefined) {
      return { name: poke.name, checks: [{ label: 'Pokémon', expected: poke.name, found: 'Not in the game', ok: false }] }
    }
    const moves = screens.moves?.[slot]
    const stats = screens.stats?.[slot]
    const checks = nameChecks(poke, shownAs(slot), stats && species[slot])
    if (moves) checks.push(...movesScreenChecks(poke, moves))
    if (stats) checks.push(...statsScreenChecks(poke, stats))
    return { name: poke.name, gameSlot: slot, checks }
  })
  for (let slot = 0; slot < gameSize; slot++) {
    if (pairs.includes(slot)) continue
    const name = shownAs(slot)
    reports.push({ name, gameSlot: slot, checks: [{ label: 'Pokémon', expected: 'None', found: name, ok: false }] })
  }
  return reports
}

function namesFor(poke: Pokemon): string[] {
  // The game leaves off forms: Floette-Eternal is just "Floette".
  return [poke.name, poke.name.split('-')[0], ...(poke.nickname ? [poke.nickname] : [])]
}

/** How strongly the evidence says a paste Pokémon and a game Pokémon are the same one. */
function likeness(poke: Pokemon, shownAs: string, species: string[], moves: MovesScreenPokemon | undefined): number {
  let score = 0
  if (namesFor(poke).some((name) => looksLike(shownAs, name))) score += 10
  if (species.includes(poke.name)) score += 10
  if (moves) {
    const same = (a = '', b = '') => normalizeName(a) === normalizeName(b)
    if (same(poke.ability, moves.ability)) score += 2
    if (same(poke.item, moves.item)) score += 3
    score += poke.moves.filter((move) => moves.moves.some((m) => same(m, move))).length
  }
  return score
}

/**
 * Pairs each of `count` paste Pokémon with a different game slot, maximising the total score.
 * A team is at most six Pokémon, so trying every pairing is quick. Ties keep the paste order.
 */
function pairUp(count: number, slots: number, score: (i: number, slot: number) => number): (number | undefined)[] {
  let best: (number | undefined)[] = []
  let bestScore = -1
  const current: (number | undefined)[] = []
  const used = new Set<number>()
  const search = (i: number, total: number) => {
    if (i === count) {
      if (total > bestScore) {
        best = [...current]
        bestScore = total
      }
      return
    }
    for (let slot = 0; slot < slots; slot++) {
      if (used.has(slot)) continue
      used.add(slot)
      current.push(slot)
      search(i + 1, total + score(i, slot))
      current.pop()
      used.delete(slot)
    }
    // Leave this Pokémon unpaired only when there are more paste Pokémon than slots left.
    if (count - i > slots - used.size) {
      current.push(undefined)
      search(i + 1, total)
      current.pop()
    }
  }
  search(0, 0)
  return best
}

/**
 * The game shows a nickname instead of the species when there is one, and leaves off forms, so
 * the species of a nicknamed Pokémon is inferred from its stats, or failing that its nickname.
 * The stats check catches the wrong form.
 */
function nameChecks(poke: Pokemon, shownAs: string, species: string[] | undefined): Check[] {
  const showsSpecies = [poke.name, poke.name.split('-')[0]].some((name) => looksLike(shownAs, name))
  const showsNickname = !!poke.nickname && looksLike(shownAs, poke.nickname)
  const nicknameShown = showsNickname || !showsSpecies ? shownAs : ''
  // Nicknames don't affect the team, so a different one is only worth a warning.
  const nickname: Check = { label: 'Nickname', expected: poke.nickname ?? '', found: nicknameShown, ok: true }
  if (poke.nickname && nicknameShown && !showsNickname) nickname.note = 'Nickname does not match paste'

  let pokemon: Check
  if (showsSpecies && !showsNickname) {
    pokemon = { label: 'Pokémon', expected: poke.name, found: shownAs, ok: true }
  } else if (species) {
    const found = species.includes(poke.name)
      ? poke.name
      : species.length > 0
        ? species.join(' or ')
        : "Unknown (stats don't fit any Pokémon)"
    pokemon = { label: 'Pokémon', expected: poke.name, found, ok: species.includes(poke.name), note: 'Inferred from the stats' }
  } else if (showsNickname) {
    pokemon = { label: 'Pokémon', expected: poke.name, found: poke.name, ok: true, note: 'Inferred from the nickname' }
  } else {
    pokemon = { label: 'Pokémon', expected: poke.name, found: 'Unknown (add the Stats screenshot to confirm the species)', ok: false }
  }
  return [pokemon, nickname]
}

function movesScreenChecks(poke: Pokemon, shown: MovesScreenPokemon): Check[] {
  const same = (a: string, b: string) => normalizeName(a) === normalizeName(b)
  const checks: Check[] = [
    { label: 'Ability', expected: poke.ability ?? 'None', found: shown.ability, ok: same(poke.ability ?? '', shown.ability) },
    { label: 'Item', expected: poke.item ?? 'None', found: shown.item || 'None', ok: same(poke.item ?? '', shown.item) },
  ]

  // Move order doesn't matter, so pair up the matching moves first, then the leftovers in order.
  const unmatched = [...shown.moves]
  const missing: string[] = []
  for (const move of poke.moves) {
    const i = unmatched.findIndex((m) => same(m, move))
    if (i >= 0) {
      unmatched.splice(i, 1)
      checks.push({ label: 'Move', expected: move, found: move, ok: true })
    } else {
      missing.push(move)
    }
  }
  for (let i = 0; i < Math.max(missing.length, unmatched.length); i++) {
    checks.push({ label: 'Move', expected: missing[i] ?? 'None', found: unmatched[i] ?? 'None', ok: false })
  }
  return checks
}

function statsScreenChecks(poke: Pokemon, shown: StatsScreenPokemon): Check[] {
  const nature = poke.nature ? poke.nature.charAt(0).toUpperCase() + poke.nature.slice(1).toLowerCase() : 'Serious'
  const modifiers = getNatureModifiers(nature)
  const expectedArrows = modifiers ? arrowsFromModifiers(modifiers) : undefined
  const checks: Check[] = [
    {
      label: 'Nature',
      expected: expectedArrows ? `${nature} (${describeArrows(expectedArrows)})` : `${nature} (not a nature)`,
      found: describeShownNature(shown.nature),
      ok: !!expectedArrows && expectedArrows.up === shown.nature.up && expectedArrows.down === shown.nature.down,
    },
  ]

  const base = getBaseStats(poke.name)
  const points = fillSpread(poke.evs)
  const expected = base && modifiers ? getChampionsStats(base, points, modifiers) : undefined
  const describe = (stat?: number, pts?: number) => `${stat ?? '?'} (${pts ?? '?'} pts)`
  for (const stat of STAT_IDS) {
    checks.push({
      label: STAT_NAMES[stat],
      expected: describe(expected?.[stat], points[stat]),
      found: describe(shown.stats[stat], shown.points[stat]),
      ok: expected?.[stat] === shown.stats[stat] && points[stat] === shown.points[stat],
    })
  }
  return checks
}

function arrowsFromModifiers(modifiers: Stats): NatureArrows {
  const arrows: NatureArrows = {}
  for (const stat of STAT_IDS) {
    if (modifiers[stat] > 1) arrows.up = stat
    if (modifiers[stat] < 1) arrows.down = stat
  }
  return arrows
}

function modifiersFromArrows({ up, down }: NatureArrows): Stats {
  const modifiers = fillSpread({})
  for (const stat of STAT_IDS) modifiers[stat] = stat === up ? 1.1 : stat === down ? 0.9 : 1
  return modifiers
}

function describeArrows({ up, down }: NatureArrows): string {
  if (!up && !down) return 'neutral'
  return [up && `+${STAT_NAMES[up]}`, down && `−${STAT_NAMES[down]}`].filter(Boolean).join(' ')
}

const natureTable: Record<string, Stats> = natures

/**
 * Names the nature the game's arrows show. The five neutral natures look alike in game, so a
 * nature without arrows can only be called neutral.
 */
function describeShownNature(arrows: NatureArrows): string {
  if (!arrows.up && !arrows.down) return 'Neutral'
  const name = Object.keys(natureTable).find((nature) => {
    const { up, down } = arrowsFromModifiers(natureTable[nature])
    return up === arrows.up && down === arrows.down
  })
  return `${name ?? 'Unknown'} (${describeArrows(arrows)})`
}

const baseStatTable: Record<string, Stats> = pokedex

/**
 * Every species whose stats, with the stat points and nature shown, come out to the stats shown.
 * Mega and Gigantamax forms are left out since teams list the base form.
 */
export function inferSpecies({ stats, points, nature }: StatsScreenPokemon): string[] {
  const modifiers = modifiersFromArrows(nature)
  const spread = fillSpread(points)
  return Object.entries(baseStatTable)
    .filter(([species]) => !/-(Mega|Gmax)/.test(species))
    .filter(([, base]) => {
      const computed = getChampionsStats(base, spread, modifiers)
      return STAT_IDS.every((stat) => computed[stat] === stats[stat])
    })
    .map(([species]) => species)
}
