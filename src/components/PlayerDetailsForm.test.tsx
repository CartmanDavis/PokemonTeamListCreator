// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DEFAULT_PLAYER } from '../lib/types'
import { PlayerDetailsForm } from './PlayerDetailsForm'

const player = { ...DEFAULT_PLAYER, playerName: 'Ash Ketchum', playerId: '1234', ageDivision: 'Senior' as const }

function setup(remember: boolean) {
  const user = userEvent.setup()
  render(<PlayerDetailsForm value={player} onChange={() => {}} remember={remember} onRememberChange={() => {}} />)
  return user
}

describe('PlayerDetailsForm', () => {
  it('starts expanded when info is not saved', () => {
    setup(false)
    expect(screen.getByLabelText('Player Name')).toHaveValue('Ash Ketchum')
    expect(screen.getByRole('checkbox', { name: 'Save my info for next time' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Senior' })).toBeChecked()
  })

  it('starts as a summary when info is saved, and expands on Edit', async () => {
    const user = setup(true)
    expect(screen.getByText('Ash Ketchum · Senior Division · ID 1234')).toBeInTheDocument()
    expect(screen.queryByLabelText('Player Name')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByLabelText('Player Name')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.getByText('Ash Ketchum · Senior Division · ID 1234')).toBeInTheDocument()
  })

  it('has info bubbles for Player ID and Support ID', () => {
    setup(false)
    expect(screen.getByRole('button', { name: 'About Player ID' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'About Support ID' })).toBeInTheDocument()
  })
})
