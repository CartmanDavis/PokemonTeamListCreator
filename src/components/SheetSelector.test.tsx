// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SheetSelector } from './SheetSelector'

describe('SheetSelector', () => {
  it('shows the selected sheets as checked', () => {
    render(<SheetSelector value={['close']} onChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'Open Team List' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Staff Team List' })).toBeChecked()
  })

  it('adds and removes sheets', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(<SheetSelector value={['open', 'close']} onChange={onChange} />)

    await user.click(screen.getByRole('checkbox', { name: 'Open Team List' }))
    expect(onChange).toHaveBeenLastCalledWith(['close'])

    rerender(<SheetSelector value={['close']} onChange={onChange} />)
    await user.click(screen.getByRole('checkbox', { name: 'Open Team List' }))
    expect(onChange).toHaveBeenLastCalledWith(['close', 'open'])
  })
})
