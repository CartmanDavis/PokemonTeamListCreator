// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './AppRoutes'

afterEach(() => {
  window.location.hash = ''
})

const renderPage = () => {
  window.location.hash = '#/teamcheck'
  return render(<AppRoutes />)
}

describe('TeamCheckApp', () => {
  it('shows the beta notice, the paste and the team check', () => {
    renderPage()
    expect(screen.getByText(/This feature is in beta/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'X (@CartmanCodes)' })).toHaveAttribute('href', 'https://x.com/CartmanCodes')
    expect(screen.getByRole('textbox', { name: 'Showdown team paste' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Verify In-Game Team' })).toBeInTheDocument()
  })

  it('shows the same Team Info box as the generator, without the print options', () => {
    renderPage()
    expect(screen.getByRole('textbox', { name: 'Battle Team Number / Name' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'PRINT SELECTED' })).not.toBeInTheDocument()
  })
})
