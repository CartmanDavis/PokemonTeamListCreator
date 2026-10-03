import { describe, expect, it } from 'vitest'
import { movesScreen, paste, statsScreen } from '../../test/fixtures/champions/team'
import { Koffing } from '../koffing'
import { inferSpecies, verifyTeam, type PokemonReport } from './verify'

const team = (text: string) => Koffing.parse(text).teams[0].pokemon
const failures = (reports: PokemonReport[]) =>
  reports.flatMap((r) => r.checks.filter((c) => !c.ok).map((c) => ({ name: r.name, ...c })))
/** The paste split into its Pokémon, so tests can reorder them. */
const sets = paste.trim().split('\n\n')

describe('verifyTeam', () => {
  it('passes a team that matches both screens', () => {
    const reports = verifyTeam(team(paste), { moves: movesScreen, stats: statsScreen })
    expect(failures(reports)).toEqual([])
    expect(reports.map((r) => r.checks.length)).toEqual([14, 14, 14, 14, 14, 14])
  })

  it('accepts a nickname missing from the paste when the stats fit the species', () => {
    const reports = verifyTeam(team(paste.replace('Chompy (Garchomp)', 'Garchomp')), { moves: movesScreen, stats: statsScreen })
    expect(reports[0].checks[0]).toEqual({ label: 'Pokémon', expected: 'Garchomp', found: 'Chompy (stats fit Garchomp)', ok: true })
  })

  it('needs the stats screen to accept an unknown nickname', () => {
    const reports = verifyTeam(team(paste.replace('Chompy (Garchomp)', 'Garchomp')), { moves: movesScreen })
    expect(reports[0].checks[0].ok).toBe(false)
  })

  it('reports a different species', () => {
    const reports = verifyTeam(team(paste.replace('Chompy (Garchomp)', 'Salamence')), { stats: statsScreen })
    expect(reports[0].checks[0]).toMatchObject({ found: 'Chompy (stats fit Garchomp)', ok: false })
  })

  it('reports wrong items, abilities, moves, natures and stat points', () => {
    const changed = paste
      .replace('Life Orb', 'Choice Scarf')
      .replace('Ability: Blaze', 'Ability: Solar Power')
      .replace('- Throat Chop', '- Knock Off')
      .replace('Relaxed Nature', 'Sassy Nature')
      .replace('2 HP / 32 SpA', '2 HP / 30 SpA')
    expect(failures(verifyTeam(team(changed), { moves: movesScreen, stats: statsScreen }))).toEqual([
      { name: 'Garchomp', label: 'Item', expected: 'Choice Scarf', found: 'Life Orb', ok: false },
      { name: 'Charizard', label: 'Ability', expected: 'Solar Power', found: 'Blaze', ok: false },
      { name: 'Incineroar', label: 'Move', expected: 'Knock Off', found: 'Throat Chop', ok: false },
      { name: 'Sinistcha', label: 'Nature', expected: 'Sassy (+SpD −Spe)', found: 'Relaxed (+Def −Spe)', ok: false },
      { name: 'Sinistcha', label: 'Def', expected: '133 (7 pts)', found: '146 (7 pts)', ok: false },
      { name: 'Sinistcha', label: 'SpD', expected: '139 (27 pts)', found: '127 (27 pts)', ok: false },
      { name: 'Venusaur', label: 'SpA', expected: '150 (30 pts)', found: '152 (32 pts)', ok: false },
    ])
  })

  it('ignores move order', () => {
    const reordered = paste.replace('- Heat Wave\n- Weather Ball', '- Weather Ball\n- Heat Wave')
    expect(failures(verifyTeam(team(reordered), { moves: movesScreen }))).toEqual([])
  })

  it('pairs each Pokémon with its match when the paste is in a different order', () => {
    const [chomp, zard, incin, sinistcha, floette, venusaur] = sets
    const reordered = [zard, floette, sinistcha, chomp.replace('Life Orb', 'Choice Scarf'), incin, venusaur].join('\n\n')
    const reports = verifyTeam(team(reordered), { moves: movesScreen, stats: statsScreen })
    expect(reports.map((r) => [r.name, r.gameSlot])).toEqual([
      ['Charizard', 1],
      ['Floette-Eternal', 4],
      ['Sinistcha', 3],
      ['Garchomp', 0],
      ['Incineroar', 2],
      ['Venusaur', 5],
    ])
    expect(failures(reports)).toEqual([{ name: 'Garchomp', label: 'Item', expected: 'Choice Scarf', found: 'Life Orb', ok: false }])
  })

  it('reports Pokémon in the game that the paste is missing', () => {
    const reports = verifyTeam(team(sets.slice(1).join('\n\n')), { moves: movesScreen })
    expect(reports).toHaveLength(6)
    expect(reports[5]).toEqual({
      name: 'Chompy',
      gameSlot: 0,
      checks: [{ label: 'Pokémon', expected: 'None', found: 'Chompy', ok: false }],
    })
  })

  it('reports Pokémon in the paste that the game is missing', () => {
    const reports = verifyTeam(team(paste), { moves: movesScreen.slice(0, 5) })
    expect(reports[5]).toEqual({
      name: 'Venusaur',
      checks: [{ label: 'Pokémon', expected: 'Venusaur', found: 'Not in the game', ok: false }],
    })
  })
})

describe('inferSpecies', () => {
  it('identifies a species from its stats, stat points and nature', () => {
    expect(inferSpecies(statsScreen[0])).toEqual(['Garchomp'])
    expect(inferSpecies(statsScreen[4])).toContain('Floette-Eternal')
  })
})
