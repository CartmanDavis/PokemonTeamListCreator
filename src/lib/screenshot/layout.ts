import type { Region } from './image'

// Where each field sits inside a team panel. Panels look the same on every device, so these are
// fractions of the panel rather than pixels. Measured from an iPhone screenshot.

/** The Pokémon's nickname, or its species when it has none. Shared by both screens. */
export const NAME: Region = [0.1, 0.02, 0.58, 0.27]

export const ABILITY: Region = [0.1, 0.29, 0.58, 0.49]
export const ITEM: Region = [0.12, 0.52, 0.58, 0.72]
export const MOVES: Region[] = [0.15, 0.39, 0.62, 0.86].map((y) => [0.66, y - 0.11, 0.97, y + 0.11])

const STAT_ROWS = [0.37, 0.61, 0.84]
const statColumns = (left: [number, number], right: [number, number]): Region[] => [
  ...STAT_ROWS.map((y): Region => [left[0], y - 0.1, left[1], y + 0.1]),
  ...STAT_ROWS.map((y): Region => [right[0], y - 0.1, right[1], y + 0.1]),
]

// Stats are laid out HP, Attack, Defense down the left and Sp. Atk, Sp. Def, Speed down the
// right, which is the same order as STAT_IDS.

/** Stat names, followed by a red or blue arrow when the nature raises or lowers them. */
export const STAT_LABELS = statColumns([0.1, 0.28], [0.58, 0.72])
/** Stat values, right-aligned against the start of the stat point bar. */
export const STAT_VALUES = statColumns([0.28, 0.355], [0.72, 0.827])
/** Stat points, just after the end of the bar. */
export const STAT_POINTS = statColumns([0.426, 0.5], [0.897, 0.97])
/** The stat point bars themselves, which only the stats screen has. */
export const STAT_BARS = statColumns([0.36, 0.42], [0.83, 0.89])
