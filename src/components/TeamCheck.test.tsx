// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TeamCheckResults } from './TeamCheck'

describe('TeamCheckResults', () => {
  it('shows what the game has for each Pokémon', () => {
    render(
      <TeamCheckResults
        reports={[
          { gameSlot: 0, name: 'Garchomp', checks: [{ label: 'Item', expected: 'Life Orb', found: 'Life Orb', ok: true }] },
          {
            gameSlot: 1,
            name: 'Charizard',
            checks: [
              {
                label: 'Spe',
                expected: '20',
                expectedDetail: '140',
                expectedNature: '+' as const,
                found: '20',
                foundDetail: '140',
                foundNature: '+' as const,
                ok: true,
              },
            ],
          },
        ]}
      />,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Garchomp' })).toBeInTheDocument()
    expect(screen.getByRole('row', { name: 'Item Life Orb' })).not.toHaveClass('mismatch')
    const spe = screen.getByRole('row', { name: /^Spe/ })
    expect(spe).toHaveTextContent('20+140')
    expect(spe.querySelector('s')).toBeNull()
  })

  it('says how many Pokémon have errors', () => {
    const wrong = [{ label: 'Item', expected: 'Choice Scarf', found: 'Life Orb', ok: false }]
    render(
      <TeamCheckResults
        reports={[
          { gameSlot: 0, name: 'Garchomp', checks: wrong },
          { gameSlot: 1, name: 'Charizard', checks: wrong },
          { gameSlot: 2, name: 'Incineroar', checks: [] },
        ]}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('There were issues found with your in-game team')
    expect(screen.getByRole('alert')).toHaveTextContent('2 Pokémon don’t match your paste.')
  })

  it('strikes through a wrong value and shows the paste value after it', () => {
    const checks = [{ label: 'Item', expected: 'Choice Scarf', found: 'Life Orb', ok: false }]
    render(<TeamCheckResults reports={[{ gameSlot: 0, name: 'Garchomp', checks }]} />)
    expect(screen.getByRole('row', { name: /^Item/ })).toHaveClass('mismatch')
    expect(screen.getByText('Life Orb').closest('s')).not.toBeNull()
    expect(screen.getByText('Choice Scarf').closest('s')).toBeNull()
  })

  it('strikes through only the part of a stat that is wrong', () => {
    const stat = (label: string, found: string, foundDetail: string) => ({
      label,
      expected: '30',
      expectedDetail: '150',
      found,
      foundDetail,
      ok: false,
    })
    const checks = [stat('SpA', '32', '150'), stat('SpD', '30', '152')]
    render(<TeamCheckResults reports={[{ gameSlot: 0, name: 'Garchomp', checks }]} />)
    const struck = (label: string) =>
      [...screen.getByRole('row', { name: new RegExp(`^${label}`) }).querySelectorAll('s')].map((s) => s.textContent)
    expect(struck('SpA')).toEqual(['32'])
    expect(struck('SpD')).toEqual(['152'])
    expect(screen.getByRole('row', { name: /^SpA/ })).toHaveTextContent('3230150')
  })

  it('shows notes beside their field', () => {
    const checks = [{ label: 'Pokémon', expected: 'Garchomp', found: 'Garchomp', ok: true, note: 'Inferred from species stats' }]
    render(<TeamCheckResults reports={[{ gameSlot: 0, name: 'Garchomp', checks }]} />)
    const note = within(screen.getByRole('row', { name: /^Pokémon Garchomp/ })).getByRole('img', { name: 'Inferred from species stats' })
    expect(note).toHaveAttribute('title', 'Inferred from species stats')
  })

  it('shows a dash for an empty value', () => {
    const checks = [{ label: 'Nickname', expected: 'Chompy', found: '', ok: true }]
    render(<TeamCheckResults reports={[{ gameSlot: 0, name: 'Garchomp', checks }]} />)
    expect(screen.getByRole('row', { name: 'Nickname -' })).toBeInTheDocument()
  })
})
