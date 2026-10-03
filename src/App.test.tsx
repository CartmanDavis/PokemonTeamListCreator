// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(() => localStorage.clear())

function setup() {
  const user = userEvent.setup()
  render(<App />)
  return {
    user,
    team: within(screen.getByRole('region', { name: 'Team Info' })),
    paste: screen.getByRole('textbox', { name: 'Showdown team paste' }),
    print: screen.getByRole('button', { name: 'PRINT SELECTED' }),
  }
}

describe('App', () => {
  it('shows team problems in the Team Info section', async () => {
    const { user, team, paste, print } = setup()
    await user.click(paste)
    await user.paste('Charizard-Mega-Y @ Charizardite Y\nAbility: Drought\n- Heat Wave')
    await user.click(print)

    const alert = await team.findByRole('alert')
    expect(alert).toHaveTextContent('Your team needs a fix before printing')
    expect(alert).toHaveTextContent('List it as Charizard holding its Mega Stone instead.')
    expect(alert).toHaveFocus()
    expect(paste).toHaveAttribute('aria-invalid', 'true')
  })

  it('asks for a paste before printing', async () => {
    const { user, team, print } = setup()
    await user.click(print)
    expect(team.getByRole('alert')).toHaveTextContent('Paste your team from Pokémon Showdown to print a team list.')
  })

  it('clears team problems once the paste is edited', async () => {
    const { user, team, paste, print } = setup()
    await user.click(print)
    expect(team.getByRole('alert')).toBeInTheDocument()

    await user.type(paste, 'I')
    expect(team.queryByRole('alert')).not.toBeInTheDocument()
    expect(paste).not.toHaveAttribute('aria-invalid')
  })

  it('shows non-team problems by the Print button', async () => {
    const { user, team, paste, print } = setup()
    await user.type(paste, 'Incineroar')
    await user.click(screen.getByRole('checkbox', { name: 'Open Team List' }))
    await user.click(screen.getByRole('checkbox', { name: 'Staff Team List' }))
    await user.click(print)

    expect(screen.getByRole('alert')).toHaveTextContent('Select at least one team list to print.')
    expect(team.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('defaults to English, Master division, and both sheets', () => {
    setup()
    expect(screen.getByRole('combobox', { name: 'Team list language' })).toHaveValue('En')
    expect(screen.getByRole('radio', { name: 'Master' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Open Team List' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Staff Team List' })).toBeChecked()
  })
})
