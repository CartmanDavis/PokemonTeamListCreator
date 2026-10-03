import { resolve } from 'node:path'
import { readPng } from '../../png'
import type { MovesScreenPokemon, StatsScreenPokemon } from '../../../lib/screenshot/read'

// The team in moves.png and stats.png, an iPhone screenshot (2622 × 1206).

export const movesScreenshot = () => readPng(resolve(import.meta.dirname, 'moves.png'))
export const statsScreenshot = () => readPng(resolve(import.meta.dirname, 'stats.png'))

export const paste = `
Chompy (Garchomp) (F) @ Life Orb
Ability: Rough Skin
EVs: 4 HP / 30 Atk / 32 Spe
Jolly Nature
- Dragon Claw
- Earthquake
- Rock Slide
- Protect

Blaze (Charizard) (M) @ Charizardite Y
Ability: Blaze
EVs: 26 HP / 10 Def / 11 SpA / 19 Spe
Modest Nature
- Heat Wave
- Weather Ball
- Solar Beam
- Protect

Incineroar (M) @ Sitrus Berry
Ability: Intimidate
EVs: 30 HP / 1 Atk / 8 Def / 16 SpD / 11 Spe
Careful Nature
- Fake Out
- Flare Blitz
- Throat Chop
- Parting Shot

Sinistcha @ Kasib Berry
Ability: Hospitality
EVs: 32 HP / 7 Def / 27 SpD
Relaxed Nature
- Matcha Gotcha
- Rage Powder
- Trick Room
- Protect

Floette-Eternal (F) @ Floettite
Ability: Flower Veil
EVs: 28 HP / 1 Def / 5 SpA / 32 Spe
Modest Nature
- Moonblast
- Dazzling Gleam
- Calm Mind
- Protect

Venusaur (M) @ Focus Sash
Ability: Chlorophyll
EVs: 2 HP / 32 SpA / 32 Spe
Timid Nature
- Sludge Bomb
- Leaf Storm
- Sleep Powder
- Protect
`

export const movesScreen: MovesScreenPokemon[] = [
  { name: 'Chompy', ability: 'Rough Skin', item: 'Life Orb', moves: ['Dragon Claw', 'Earthquake', 'Rock Slide', 'Protect'] },
  { name: 'Blaze', ability: 'Blaze', item: 'Charizardite Y', moves: ['Heat Wave', 'Weather Ball', 'Solar Beam', 'Protect'] },
  { name: 'Incineroar', ability: 'Intimidate', item: 'Sitrus Berry', moves: ['Fake Out', 'Flare Blitz', 'Throat Chop', 'Parting Shot'] },
  { name: 'Sinistcha', ability: 'Hospitality', item: 'Kasib Berry', moves: ['Matcha Gotcha', 'Rage Powder', 'Trick Room', 'Protect'] },
  { name: 'Floette', ability: 'Flower Veil', item: 'Floettite', moves: ['Moonblast', 'Dazzling Gleam', 'Calm Mind', 'Protect'] },
  { name: 'Venusaur', ability: 'Chlorophyll', item: 'Focus Sash', moves: ['Sludge Bomb', 'Leaf Storm', 'Sleep Powder', 'Protect'] },
]

export const statsScreen: StatsScreenPokemon[] = [
  {
    name: 'Chompy',
    stats: { hp: 187, atk: 180, def: 115, spa: 90, spd: 105, spe: 169 },
    points: { hp: 4, atk: 30, def: 0, spa: 0, spd: 0, spe: 32 },
    nature: { up: 'spe', down: 'spa' },
  },
  {
    name: 'Blaze',
    stats: { hp: 179, atk: 93, def: 108, spa: 154, spd: 105, spe: 139 },
    points: { hp: 26, atk: 0, def: 10, spa: 11, spd: 0, spe: 19 },
    nature: { up: 'spa', down: 'atk' },
  },
  {
    name: 'Incineroar',
    stats: { hp: 200, atk: 136, def: 118, spa: 90, spd: 138, spe: 91 },
    points: { hp: 30, atk: 1, def: 8, spa: 0, spd: 16, spe: 11 },
    nature: { up: 'spd', down: 'spa' },
  },
  {
    name: 'Sinistcha',
    stats: { hp: 178, atk: 80, def: 146, spa: 141, spd: 127, spe: 81 },
    points: { hp: 32, atk: 0, def: 7, spa: 0, spd: 27, spe: 0 },
    nature: { up: 'def', down: 'spe' },
  },
  {
    name: 'Floette',
    stats: { hp: 177, atk: 76, def: 88, spa: 165, spd: 148, spe: 144 },
    points: { hp: 28, atk: 0, def: 1, spa: 5, spd: 0, spe: 32 },
    nature: { up: 'spa', down: 'atk' },
  },
  {
    name: 'Venusaur',
    stats: { hp: 157, atk: 91, def: 103, spa: 152, spd: 120, spe: 145 },
    points: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 },
    nature: { up: 'spe', down: 'atk' },
  },
]
