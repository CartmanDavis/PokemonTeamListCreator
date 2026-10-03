// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearSavedPlayer, loadSavedPlayer, savePlayer } from './savedPlayer'
import { DEFAULT_PLAYER } from './types'

const KEY = 'vgc-teamsheet:player'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('savedPlayer', () => {
  it('returns null when nothing is saved', () => {
    expect(loadSavedPlayer()).toBeNull()
  })

  it('round-trips player info', () => {
    const player = { ...DEFAULT_PLAYER, playerName: 'Ash', playerId: '1234', ageDivision: 'Senior' as const }
    savePlayer(player)
    expect(loadSavedPlayer()).toEqual(player)
  })

  it('clears saved info', () => {
    savePlayer(DEFAULT_PLAYER)
    clearSavedPlayer()
    expect(loadSavedPlayer()).toBeNull()
  })

  it('ignores unknown keys and invalid values', () => {
    localStorage.setItem(KEY, JSON.stringify({ playerName: 5, playerId: '9', ageDivision: 'Elder', teamName: 'old' }))
    expect(loadSavedPlayer()).toEqual({ playerId: '9' })
  })

  it('treats corrupt data as nothing saved', () => {
    localStorage.setItem(KEY, 'not json')
    expect(loadSavedPlayer()).toBeNull()
  })

  it('does not throw when storage is blocked', () => {
    const blocked = () => {
      throw new Error('blocked')
    }
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked)
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(blocked)

    expect(loadSavedPlayer()).toBeNull()
    expect(() => savePlayer(DEFAULT_PLAYER)).not.toThrow()
    expect(() => clearSavedPlayer()).not.toThrow()
  })
})
