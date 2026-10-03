// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { loadSavedPlayer, savePlayer } from '../lib/savedPlayer'
import { DEFAULT_PLAYER } from '../lib/types'
import { usePlayerInfo } from './usePlayerInfo'

afterEach(() => localStorage.clear())

describe('usePlayerInfo', () => {
  it('starts with defaults and saving off when nothing is saved', () => {
    const { result } = renderHook(() => usePlayerInfo())
    expect(result.current.player).toEqual(DEFAULT_PLAYER)
    expect(result.current.remember).toBe(false)
  })

  it('restores saved info with saving on', () => {
    savePlayer({ ...DEFAULT_PLAYER, playerName: 'Ash' })
    const { result } = renderHook(() => usePlayerInfo())
    expect(result.current.player.playerName).toBe('Ash')
    expect(result.current.remember).toBe(true)
  })

  it('saves changes while saving is on, and clears them when turned off', () => {
    const { result } = renderHook(() => usePlayerInfo())

    act(() => result.current.setRemember(true))
    act(() => result.current.setPlayer({ ...DEFAULT_PLAYER, playerName: 'Ash' }))
    expect(loadSavedPlayer()?.playerName).toBe('Ash')

    act(() => result.current.setRemember(false))
    expect(loadSavedPlayer()).toBeNull()
  })

  it('does not save while saving is off', () => {
    const { result } = renderHook(() => usePlayerInfo())
    act(() => result.current.setPlayer({ ...DEFAULT_PLAYER, playerName: 'Ash' }))
    expect(loadSavedPlayer()).toBeNull()
  })
})
