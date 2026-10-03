import { EMPTY_PLAYER, type PlayerInfo } from './types'

const STORAGE_KEY = 'vgc-teamsheet:player'

// Storage can be unavailable (private browsing, blocked site data), so every
// access is guarded and failures just mean nothing is remembered.

/** Returns the player info saved in this browser, or null if none is saved. */
export function loadSavedPlayer(): Partial<PlayerInfo> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null

    const player: Partial<PlayerInfo> = {}
    for (const key of Object.keys(EMPTY_PLAYER) as (keyof PlayerInfo)[]) {
      const value = (parsed as Record<string, unknown>)[key]
      if (typeof value === 'string') player[key] = value
    }
    return player
  } catch {
    return null
  }
}

export function savePlayer(player: PlayerInfo) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player))
  } catch {
    // Ignore; see above.
  }
}

export function clearSavedPlayer() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore; see above.
  }
}
