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
            checks: [{ label: 'Spe', expected: '20', expectedDetail: '140', found: '20', foundDetail: '140', ok: true }],
          },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Garchomp' })).toBeInTheDocument()
    expect(screen.getByRole('row', { name: 'Item Life Orb' })).not.toHaveClass('mismatch')
    expect(screen.getByRole('row', { name: 'Spe 20 (140)' })).toBeInTheDocument()
  })

  it('strikes through a wrong value and shows the paste value after it', () => {
    const checks = [
      { label: 'Item', expected: 'Choice Scarf', found: 'Life Orb', ok: false },
      { label: 'SpA', expected: '30', expectedDetail: '150', found: '32', foundDetail: '152', ok: false },
    ]
    render(<TeamCheckResults reports={[{ gameSlot: 0, name: 'Garchomp', checks }]} />)
    expect(screen.getByRole('row', { name: 'Item Life Orb paste: Choice Scarf' })).toHaveClass('mismatch')
    expect(screen.getByText('Life Orb').closest('s')).toBeInTheDocument()
    expect(screen.getByText('Choice Scarf').closest('s')).toBeNull()
    expect(screen.getByRole('row', { name: 'SpA 32 (152) paste: 30 (150)' })).toHaveClass('mismatch')
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
