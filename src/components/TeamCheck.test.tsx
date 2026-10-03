// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TeamCheckResults } from './TeamCheck'

describe('TeamCheckResults', () => {
  it('shows what the game has for each Pokémon', () => {
    render(
      <TeamCheckResults
        reports={[
          { gameSlot: 0, name: 'Garchomp', checks: [{ label: 'Item', expected: 'Choice Scarf', found: 'Life Orb', ok: false }] },
          {
            gameSlot: 1,
            name: 'Charizard',
            checks: [{ label: 'Spe', expected: '19', expectedDetail: '139', found: '20', foundDetail: '140', ok: false }],
          },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Garchomp' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Garchomp' })).toHaveTextContent('ItemLife Orb')
    expect(screen.getByRole('row', { name: 'Spe 20 (140)' })).toBeInTheDocument()
    expect(screen.queryByText('Choice Scarf')).not.toBeInTheDocument()
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
