// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TeamCheckResults } from './TeamCheck'

describe('TeamCheckResults', () => {
  it('opens the Pokémon with problems and counts them', () => {
    render(
      <TeamCheckResults
        reports={[
          { gameSlot: 0, name: 'Garchomp', checks: [{ label: 'Item', expected: 'Life Orb', found: 'Life Orb', ok: true }] },
          {
            gameSlot: 1,
            name: 'Charizard',
            checks: [
              { label: 'Ability', expected: 'Solar Power', found: 'Blaze', ok: false },
              { label: 'Spe', expected: '139 (19 pts)', found: '140 (20 pts)', ok: false },
            ],
          },
        ]}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(/^2 errors$/)
    expect(screen.getByText(/Garchomp/).closest('details')).not.toHaveAttribute('open')
    expect(screen.getByText(/Charizard/).closest('details')).toHaveAttribute('open')
    expect(screen.getByText(/Charizard/)).toHaveTextContent('Charizard (2 errors)')
    expect(screen.getByRole('row', { name: 'Ability Solar Power Blaze' })).toHaveClass('mismatch')
  })

  it('uses the singular for one error', () => {
    const checks = [{ label: 'Item', expected: 'Choice Scarf', found: 'Life Orb', ok: false }]
    render(<TeamCheckResults reports={[{ gameSlot: 0, name: 'Garchomp', checks }]} />)
    expect(screen.getByRole('status')).toHaveTextContent(/^1 error$/)
    expect(screen.getByText(/Garchomp/)).toHaveTextContent('Garchomp (1 error)')
  })

  it('says when everything matches', () => {
    render(<TeamCheckResults reports={[{ gameSlot: 0, name: 'Garchomp', checks: [] }]} />)
    expect(screen.getByRole('status')).toHaveTextContent('Your team is valid. This tool can make mistakes. Be sure to double check!')
  })
})
