export type Game = 'sv' | 'champions'

export type AgeDivision = 'Junior' | 'Senior' | 'Master'

export const AGE_DIVISIONS: readonly AgeDivision[] = ['Junior', 'Senior', 'Master']

/** `open` is the sheet shown to opponents, `close` is the one handed to tournament staff. */
export type SheetKind = 'open' | 'close'

export type Lang = 'Cht' | 'Chs' | 'En' | 'Es' | 'Fre' | 'Ger' | 'Ita' | 'Jpn' | 'Kor'

export interface PlayerInfo {
  playerName: string
  trainerName: string
  teamName: string
  switchName: string
  playerId: string
  birth: string
  supportId: string
}

export interface TeamsheetOptions {
  player: PlayerInfo
  paste: string
  game: Game
  ageDivision: AgeDivision
  sheets: SheetKind[]
  lang: Lang
}
