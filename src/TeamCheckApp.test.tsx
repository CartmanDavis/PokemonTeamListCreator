// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './AppRoutes'

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/teamcheck']}>
      <AppRoutes />
    </MemoryRouter>,
  )

describe('TeamCheckApp', () => {
  it('shows the beta notice, the paste and the team check', () => {
    renderPage()
    expect(screen.getByText(/This feature is in beta/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'X (@CartmanCodes)' })).toHaveAttribute('href', 'https://x.com/CartmanCodes')
    expect(screen.getByRole('textbox', { name: 'Showdown team paste' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Verify In-Game Team' })).toBeInTheDocument()
  })

  it('leaves out the team name and print options', () => {
    renderPage()
    expect(screen.queryByRole('textbox', { name: 'Battle Team Number / Name' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'PRINT SELECTED' })).not.toBeInTheDocument()
  })
})
