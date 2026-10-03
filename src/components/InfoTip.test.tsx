// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { InfoTip } from './InfoTip'

function setup() {
  const user = userEvent.setup()
  render(
    <>
      <InfoTip label="About Player ID">Found in Trainer Central.</InfoTip>
      <button type="button">Elsewhere</button>
    </>,
  )
  return { user, button: screen.getByRole('button', { name: 'About Player ID' }) }
}

describe('InfoTip', () => {
  it('starts closed', () => {
    const { button } = setup()
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Found in Trainer Central.')).not.toBeVisible()
  })

  it('toggles the bubble on click', async () => {
    const { user, button } = setup()
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Found in Trainer Central.')).toBeVisible()

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes on Escape and returns focus to the button', async () => {
    const { user, button } = setup()
    await user.click(button)
    await user.keyboard('{Escape}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  it('closes on an outside click', async () => {
    const { user, button } = setup()
    await user.click(button)
    await user.click(document.body)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes when focus moves away', async () => {
    const { user, button } = setup()
    await user.click(button)
    await user.tab()
    expect(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})
