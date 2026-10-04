// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './AppRoutes'

const renderAt = (hash: string) => {
  window.location.hash = hash
  return render(<AppRoutes />)
}

afterEach(() => {
  window.location.hash = ''
})

describe('AppRoutes', () => {
  it('shows the teamsheet generator at #/', () => {
    renderAt('#/')
    expect(screen.getByRole('heading', { name: 'VGC Teamsheet Generator' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Generate Teamsheet' })).toHaveAttribute('aria-current', 'page')
  })

  it('shows the team check at #/teamcheck', () => {
    renderAt('#/teamcheck')
    expect(screen.getByRole('heading', { name: 'In-Game Team Check' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Verify Team beta' })).toHaveAttribute('aria-current', 'page')
  })

  it('sends unknown paths to the generator', () => {
    renderAt('#/nope')
    expect(screen.getByRole('heading', { name: 'VGC Teamsheet Generator' })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/')
  })

  it('keeps the team when moving between pages with the tabs', async () => {
    const user = userEvent.setup()
    renderAt('#/')
    await user.type(screen.getByRole('textbox', { name: 'Battle Team Number / Name' }), 'BT 1')
    await user.type(screen.getByRole('textbox', { name: 'Showdown team paste' }), 'Incineroar')

    await user.click(screen.getByRole('link', { name: 'Verify Team beta' }))
    expect(await screen.findByRole('heading', { name: 'In-Game Team Check' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Showdown team paste' })).toHaveValue('Incineroar')
    expect(screen.getByRole('textbox', { name: 'Battle Team Number / Name' })).toHaveValue('BT 1')

    await user.clear(screen.getByRole('textbox', { name: 'Showdown team paste' }))
    await user.type(screen.getByRole('textbox', { name: 'Showdown team paste' }), 'Garchomp')
    await user.click(screen.getByRole('link', { name: 'Generate Teamsheet' }))
    expect(await screen.findByRole('heading', { name: 'VGC Teamsheet Generator' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Showdown team paste' })).toHaveValue('Garchomp')
  })
})
