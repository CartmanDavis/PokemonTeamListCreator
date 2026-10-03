export type AgeDivision = 'Junior' | 'Senior' | 'Master'

export const AGE_DIVISIONS: readonly AgeDivision[] = ['Junior', 'Senior', 'Master']

/** `open` is the sheet shown to opponents, `close` is the one handed to tournament staff. */
export type SheetKind = 'open' | 'close'

export type Lang = 'Cht' | 'Chs' | 'En' | 'Es' | 'Fre' | 'Ger' | 'Ita' | 'Jpn' | 'Kor'

export interface PlayerInfo {
  playerName: string
  trainerName: string
  switchName: string
  playerId: string
  birth: string
  supportId: string
  ageDivision: AgeDivision
}

export const DEFAULT_PLAYER: PlayerInfo = {
  playerName: '',
  trainerName: '',
  switchName: '',
  playerId: '',
  birth: '',
  supportId: '',
  ageDivision: 'Master',
}

export interface TeamsheetOptions {
  player: PlayerInfo
  /** Battle Team number or name, as shown in the game. */
  teamName: string
  paste: string
  sheets: SheetKind[]
  lang: Lang
}
