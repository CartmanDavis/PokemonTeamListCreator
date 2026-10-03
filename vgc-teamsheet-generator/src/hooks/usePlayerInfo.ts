import { useEffect, useState } from 'react'
import { clearSavedPlayer, loadSavedPlayer, savePlayer } from '../lib/savedPlayer'
import { EMPTY_PLAYER, type PlayerInfo } from '../lib/types'

/** Player details, optionally remembered in this browser for next time. */
export function usePlayerInfo() {
  const [initial] = useState(() => {
    const saved = loadSavedPlayer()
    return { player: { ...EMPTY_PLAYER, ...saved }, remember: saved !== null }
  })
  const [player, setPlayer] = useState<PlayerInfo>(initial.player)
  const [remember, setRemember] = useState(initial.remember)

  useEffect(() => {
    if (remember) savePlayer(player)
    else clearSavedPlayer()
  }, [player, remember])

  return { player, setPlayer, remember, setRemember }
}
