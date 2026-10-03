import { AGE_DIVISIONS, LANGS, type AgeDivision, type Lang, type PlayerInfo } from './types'

// Thanks a lot to @joezhuu for the URL parameters

/** URL search param that pre-fills each player field. */
const PLAYER_PARAMS: Record<keyof PlayerInfo, string> = {
  playerName: 'player',
  trainerName: 'trainer',
  teamName: 'team',
  switchName: 'switch',
  playerId: 'id',
  birth: 'dob',
  supportId: 'spid',
}

export interface UrlDefaults {
  player: PlayerInfo
  ageDivision: AgeDivision
  lang: Lang
}

export function readUrlDefaults(search = window.location.search): UrlDefaults {
  const params = new URLSearchParams(search)

  const player = {} as PlayerInfo
  for (const [key, param] of Object.entries(PLAYER_PARAMS) as [keyof PlayerInfo, string][]) {
    player[key] = params.get(param) ?? ''
  }

  const age = params.get('age')
  // Params use the legacy lowercase ids, e.g. `lang=jpn`.
  const lang = params.get('lang')?.toLowerCase()

  return {
    player,
    ageDivision: AGE_DIVISIONS.find((d) => d === age) ?? 'Master',
    lang: LANGS.find((l) => l.toLowerCase() === lang) ?? 'En',
  }
}
