// Types for the vendored Showdown paste parser (https://github.com/itsjavi/koffing).
// Only the parts the teamsheet generator relies on are declared.

export interface StatSpread {
  hp?: number
  atk?: number
  def?: number
  spa?: number
  spd?: number
  spe?: number
}

export class Pokemon {
  name: string
  nickname?: string
  item?: string
  ability?: string
  level?: number
  nature?: string
  teraType?: string
  evs?: StatSpread
  ivs?: StatSpread
  moves: string[]
}

export class PokemonTeam {
  name: string
  format: string
  pokemon: Pokemon[]
}

export class PokemonTeamSet {
  teams: PokemonTeam[]
}

export class Koffing {
  static parse(data: string): PokemonTeamSet
}
