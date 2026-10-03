import translators from '../../data/translators.json'
import { ScreenshotError } from '../errors'
import { STAT_IDS, type StatId, type Stats } from '../stats'
import digitTemplates from './digitTemplates.json'
import { readNumber } from './digits'
import { crop, isSaturatedPixel, isTextPixel, regionRect, type Rect, type Region, type RgbaImage } from './image'
import * as layout from './layout'
import { closestName } from './match'
import { findPanels } from './panels'

/** Recognises a single line of black text on white, e.g. with Tesseract. */
export type TextReader = (image: RgbaImage) => Promise<string>

export interface MovesScreenPokemon {
  /** Nickname, or species when there isn't one. */
  name: string
  ability: string
  item: string
  moves: string[]
}

export interface NatureArrows {
  up?: StatId
  down?: StatId
}

export interface StatsScreenPokemon {
  name: string
  stats: Partial<Stats>
  points: Partial<Stats>
  nature: NatureArrows
}

export type TeamScreenshot =
  | { kind: 'moves'; pokemon: MovesScreenPokemon[] }
  | { kind: 'stats'; pokemon: StatsScreenPokemon[] }

// Names are matched against everything the teamsheet knows, so OCR slips snap to a real name.
const knownNames = {
  abilities: Object.keys(translators.abilities),
  items: Object.keys(translators.items),
  moves: Object.keys(translators.moves),
}

/**
 * Reads a screenshot of a Battle Team's "Moves & More" or "Stats" screen. Text that doesn't
 * match a known name is kept as read, so it can still be shown to the user.
 */
export async function readTeamScreenshot(image: RgbaImage, readText: TextReader): Promise<TeamScreenshot> {
  const panels = findPanels(image)
  if (!panels) {
    throw new ScreenshotError(
      "This doesn't look like a Battle Team screen. Use a screenshot of the team's Moves & More or Stats page.",
    )
  }

  const read = async (panel: Rect, region: Region, names?: string[]) => {
    const text = (await readText(prepareText(crop(image, regionRect(panel, region))))).trim()
    return names ? (closestName(text, names) ?? text) : text
  }
  const readName = async (panel: Rect) =>
    (await readText(prepareText(trimIcons(crop(image, regionRect(panel, layout.NAME)))))).trim()

  if (isStatsScreen(image, panels)) {
    const pokemon: StatsScreenPokemon[] = []
    for (const panel of panels) {
      const stats: Partial<Stats> = {}
      const points: Partial<Stats> = {}
      STAT_IDS.forEach((stat, i) => {
        stats[stat] = readNumber(crop(image, regionRect(panel, layout.STAT_VALUES[i])), digitTemplates)
        points[stat] = readNumber(crop(image, regionRect(panel, layout.STAT_POINTS[i])), digitTemplates)
      })
      pokemon.push({ name: await readName(panel), stats, points, nature: readNatureArrows(image, panel) })
    }
    return { kind: 'stats', pokemon }
  }

  const pokemon: MovesScreenPokemon[] = []
  for (const panel of panels) {
    const moves: string[] = []
    for (const region of layout.MOVES) {
      const move = await read(panel, region, knownNames.moves)
      if (move) moves.push(move)
    }
    pokemon.push({
      name: await readName(panel),
      ability: await read(panel, layout.ABILITY, knownNames.abilities),
      item: await read(panel, layout.ITEM, knownNames.items),
      moves,
    })
  }
  return { kind: 'moves', pokemon }
}

function countPixels(image: RgbaImage, rect: Rect, test: (r: number, g: number, b: number) => boolean): number {
  let count = 0
  for (let y = rect.y; y < rect.y + rect.h; y++) {
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      const i = (y * image.width + x) * 4
      if (test(image.data[i], image.data[i + 1], image.data[i + 2])) count++
    }
  }
  return count
}

/** Only the stats screen has stat point bars: dark tracks with an orange fill. */
function isStatsScreen(image: RgbaImage, panels: Rect[]): boolean {
  const isBar = (r: number, g: number, b: number) => (r > 200 && g > 90 && g < 170 && b < 80) || (r < 90 && g < 90 && b < 130)
  let bar = 0
  let total = 0
  for (const panel of panels) {
    for (const region of layout.STAT_BARS) {
      const rect = regionRect(panel, region)
      bar += countPixels(image, rect, isBar)
      total += rect.w * rect.h
    }
  }
  return bar > total * 0.05
}

function readNatureArrows(image: RgbaImage, panel: Rect): NatureArrows {
  const arrows: NatureArrows = {}
  STAT_IDS.forEach((stat, i) => {
    const rect = regionRect(panel, layout.STAT_LABELS[i])
    // A few dozen pixels is plenty; an arrow is several hundred in a full-size screenshot.
    const minimum = rect.w * rect.h * 0.005
    if (countPixels(image, rect, (r, g, b) => r > 220 && r - g > 80 && r - b > 50) > minimum) arrows.up = stat
    else if (countPixels(image, rect, (r, g, b) => b > 200 && g - r > 50) > minimum) arrows.down = stat
  })
  return arrows
}

/** Cuts the name off before the gender and type icons that follow it. */
function trimIcons(image: RgbaImage): RgbaImage {
  for (let x = Math.round(image.width * 0.3); x < image.width; x++) {
    for (let y = 0; y < image.height; y++) {
      if (isSaturatedPixel(image.data, (y * image.width + x) * 4)) {
        return crop(image, { x: 0, y: 0, w: Math.max(1, x - 4), h: image.height })
      }
    }
  }
  return image
}

const TEXT_SCALE = 3
const TEXT_PADDING = 20

/** Turns the game's white text into black text on plain white, enlarged, which suits OCR best. */
function prepareText(image: RgbaImage): RgbaImage {
  const width = image.width * TEXT_SCALE + TEXT_PADDING * 2
  const height = image.height * TEXT_SCALE + TEXT_PADDING * 2
  const data = new Uint8ClampedArray(width * height * 4).fill(255)
  for (let y = 0; y < image.height * TEXT_SCALE; y++) {
    for (let x = 0; x < image.width * TEXT_SCALE; x++) {
      const source = (Math.floor(y / TEXT_SCALE) * image.width + Math.floor(x / TEXT_SCALE)) * 4
      if (isTextPixel(image.data, source)) {
        const i = ((y + TEXT_PADDING) * width + x + TEXT_PADDING) * 4
        data[i] = data[i + 1] = data[i + 2] = 0
      }
    }
  }
  return { data, width, height }
}
