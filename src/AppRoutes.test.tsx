// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useNavigate } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './AppRoutes'

/** Stands in for the browser's address bar. */
function GoTo({ path }: { path: string }) {
  const navigate = useNavigate()
  return <button onClick={() => navigate(path)}>Go to {path}</button>
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <GoTo path="/teamcheck" />
      <GoTo path="/" />
    </MemoryRouter>,
  )

describe('AppRoutes', () => {
  it('shows the teamsheet generator at /', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'VGC Teamsheet Generator' })).toBeInTheDocument()
  })

  it('shows the team check at /teamcheck', () => {
    renderAt('/teamcheck')
    expect(screen.getByRole('heading', { name: 'In-Game Team Check' })).toBeInTheDocument()
  })

  it('sends unknown paths to the generator', () => {
    renderAt('/nope')
    expect(screen.getByRole('heading', { name: 'VGC Teamsheet Generator' })).toBeInTheDocument()
  })
  it('keeps the paste when moving between pages', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.type(screen.getByRole('textbox', { name: 'Showdown team paste' }), 'Incineroar')

    await user.click(screen.getByRole('button', { name: 'Go to /teamcheck' }))
    expect(screen.getByRole('heading', { name: 'In-Game Team Check' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Showdown team paste' })).toHaveValue('Incineroar')

    await user.clear(screen.getByRole('textbox', { name: 'Showdown team paste' }))
    await user.type(screen.getByRole('textbox', { name: 'Showdown team paste' }), 'Garchomp')
    await user.click(screen.getByRole('button', { name: 'Go to /' }))
    expect(screen.getByRole('textbox', { name: 'Showdown team paste' })).toHaveValue('Garchomp')
  })
})
