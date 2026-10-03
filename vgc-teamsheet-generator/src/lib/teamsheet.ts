import { jsPDF } from 'jspdf'
import calibriBoldUrl from '../assets/fonts/Calibri-Bold.ttf'
import calibriRegularUrl from '../assets/fonts/Calibri-Regular.ttf'
import calibriBoldItalicUrl from '../assets/fonts/Calibri-BoldItalic.ttf'
import droidSansFallbackUrl from '../assets/fonts/DroidSansFallback.ttf'
import notoSansJpUrl from '../assets/fonts/NotoSansJP-Regular.ttf'
import pretendardUrl from '../assets/fonts/Pretendard-Regular.ttf'
import notoSansUrl from '../assets/fonts/NotoSans-Regular.ttf'
import { TeamsheetError } from './errors'
import { loadFont } from './fonts'
import { loadTranslations, translate, type Translations } from './i18n'
import { Koffing, type Pokemon } from './koffing'
import {
  STAT_IDS,
  fillSpread,
  getBaseStats,
  getChampionsStats,
  getNatureModifiers,
  type Stats,
} from './stats'
import { AGE_DIVISIONS, type Lang, type SheetKind, type TeamsheetOptions } from './types'

// Fonts registered in jsPDF's virtual file system, by the name used with setFont.
const LABEL_BOLD = 'Calibri-Bold'
const LABEL_REGULAR = 'Calibri-Regular'
const LABEL_BOLD_ITALIC = 'Calibri-BoldItalic'
/** Font for the translated team details; needs glyphs for the chosen language. */
const TEAM_FONT = 'TeamFont'

const LABEL_FONT_URLS = {
  [LABEL_BOLD]: calibriBoldUrl,
  [LABEL_REGULAR]: calibriRegularUrl,
  [LABEL_BOLD_ITALIC]: calibriBoldItalicUrl,
}

function teamFontUrl(lang: Lang): string {
  switch (lang) {
    // Both Chinese variants share the Traditional Chinese font, as in the legacy app.
    case 'Cht':
    case 'Chs':
      return droidSansFallbackUrl
    case 'Jpn':
      return notoSansJpUrl
    case 'Kor':
      return pretendardUrl
    default:
      return notoSansUrl
  }
}

/** Staff sheet is "1 of 2", so it comes first when both are printed. */
const SHEET_ORDER: readonly SheetKind[] = ['close', 'open']

interface TeamsheetEntry {
  name: string
  nature: string
  ability: string
  item: string
  moves: string[]
  /** Only computed when the staff sheet is requested. */
  stats?: Stats
}

export async function generateTeamsheet(options: TeamsheetOptions): Promise<void> {
  const pokemon = Koffing.parse(options.paste).teams[0]?.pokemon ?? []
  if (pokemon.length === 0) {
    throw new TeamsheetError('ERROR IN PASTE')
  }

  const [translations, teamFont, ...labelFonts] = await Promise.all([
    loadTranslations(options.lang),
    loadFont(teamFontUrl(options.lang)),
    ...Object.values(LABEL_FONT_URLS).map(loadFont),
  ])

  const sheets = SHEET_ORDER.filter((sheet) => options.sheets.includes(sheet))
  const entries = pokemon.map((poke) => resolveEntry(poke, translations, sheets.includes('close')))

  const doc = new jsPDF()
  registerFont(doc, TEAM_FONT, teamFont)
  Object.keys(LABEL_FONT_URLS).forEach((name, i) => registerFont(doc, name, labelFonts[i]))

  sheets.forEach((sheet, i) => {
    if (i > 0) doc.addPage()
    drawSheet(doc, sheet, entries, options)
  })

  doc.save(fileName(options.player.playerId, sheets))
}

function fileName(playerId: string, sheets: SheetKind[]): string {
  if (sheets.length > 1) return `${playerId}-teamsheet.pdf`
  return sheets[0] === 'open' ? `${playerId}-OTS.pdf` : `${playerId}-staff.pdf`
}

function registerFont(doc: jsPDF, name: string, base64: string) {
  doc.addFileToVFS(`${name}.ttf`, base64)
  doc.addFont(`${name}.ttf`, name, 'normal')
}

// Helper function to allow for case insensitive inputs
function capitalizeInput(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function resolveEntry(
  poke: Pokemon,
  translations: Translations,
  needsStats: boolean,
): TeamsheetEntry {
  const base = getBaseStats(poke.name)
  if (!base) {
    throw new TeamsheetError('ERROR IN PASTE')
  }
  if (/.{1,}-Mega(-[XYZ]){0,1}/.test(poke.name)) {
    throw new TeamsheetError(
      `ERROR IN PASTE:\n${poke.name} is a mega evolution!\nChange it to the base form, with a valid ability, holding a mega evolution stone.`,
    )
  }

  const required = (category: Parameters<typeof translate>[1], englishName: string, label: string) => {
    const translated = translate(translations, category, englishName)
    if (translated === undefined) {
      throw new TeamsheetError(`ERROR IN PASTE:\nUnknown ${label} "${englishName}" on ${poke.name}.`)
    }
    return translated
  }

  if (!poke.ability) {
    throw new TeamsheetError(`ERROR IN PASTE:\n${poke.name} has no ability.`)
  }

  const nature = poke.nature ? capitalizeInput(poke.nature) : 'Serious'

  let stats: Stats | undefined
  if (needsStats) {
    const modifiers = getNatureModifiers(nature)
    if (!modifiers) {
      throw new TeamsheetError(`ERROR IN PASTE:\nUnknown nature "${nature}" on ${poke.name}.`)
    }
    stats = getChampionsStats(base, fillSpread(poke.evs), modifiers)
  }

  return {
    name: required('pokes', poke.name, 'Pokémon'),
    nature: translate(translations, 'natures', nature) ?? nature,
    ability: required('abilities', poke.ability, 'ability'),
    item: poke.item ? required('items', poke.item, 'item') : 'NO ITEM',
    moves: poke.moves.map((move) => required('moves', move, 'move')),
    stats,
  }
}

function drawSheet(doc: jsPDF, sheet: SheetKind, entries: TeamsheetEntry[], options: TeamsheetOptions) {
  const { player } = options

  doc.setFontSize(7)
  doc.setFont(LABEL_REGULAR, 'normal')
  doc.text('All Pokémon must be listed exactly as they appear in the Battle Team,', 50, 272)
  doc.setFont(LABEL_BOLD, 'normal')
  doc.text('at the level they are in the game.', 120.5, 272)

  doc.setFontSize(13)
  doc.text('Pokémon Video Game Team List', 73, 12.5)

  // Player details
  doc.setLineWidth(0.3)
  for (let i = 0; i < 4; i++) {
    doc.line(45, 34.5 + 7 * i, 110, 34.5 + 7 * i)
  }

  doc.setFontSize(12)
  doc.text('Player Name: ', 45, 33, { align: 'right' })
  doc.setFontSize(9)
  doc.text('Trainer Name in Game: ', 45, 40, { align: 'right' })
  doc.text('Battle Team Number / Name: ', 45, 47, { align: 'right' })
  doc.text('Switch Profile Name: ', 45, 54, { align: 'right' })

  // Age division checkboxes
  for (let i = 0; i < 3; i++) {
    doc.rect(155 + 21 * i, 30, 4, 4)
  }
  doc.text('Age Division: ', 140, 33, { align: 'right' })
  doc.text('Juniors ', 154, 33, { align: 'right' })
  doc.text('Seniors ', 175, 33, { align: 'right' })
  doc.text('Masters ', 196, 33, { align: 'right' })

  doc.setFont(LABEL_REGULAR, 'normal')
  doc.setFontSize(13)
  doc.text(player.playerName, 47, 33)
  doc.text(player.trainerName, 47, 40)
  doc.text(player.teamName, 47, 47)
  doc.text(player.switchName, 47, 54)

  // Pokémon boxes, two columns by three rows
  for (let i = 0; i < 6; i++) {
    const x = 6.5 + 99 * (i % 2)
    const y = 59.5 + 70 * Math.floor(i / 2)
    doc.setLineWidth(0.6)
    doc.rect(x, y, 95, 68)
    doc.setLineWidth(0.4)
    for (let b = 0; b < 7; b++) {
      doc.line(x, y + 12 + 8 * b, x + 95, y + 12 + 8 * b)
    }
  }

  const divisionX = 154 + 21 * AGE_DIVISIONS.indexOf(options.ageDivision)
  doc.setLineWidth(1)
  doc.line(divisionX, 29, divisionX + 6, 35)
  doc.line(divisionX + 6, 29, divisionX, 35)

  entries.forEach((entry, i) => {
    const column = i % 2
    const top = 67 + 70 * Math.floor(i / 2)
    const labelX = 27.5 + 100 * column
    const valueX = 35 + 100 * column

    const row = (label: string, value: string, y: number, valueSize = 11) => {
      doc.setFontSize(13)
      doc.setFont(LABEL_BOLD, 'normal')
      doc.text(label, labelX, y, { align: 'right' })
      doc.setFontSize(valueSize)
      doc.setFont(TEAM_FONT, 'normal')
      doc.text(value, valueX, y)
    }

    row('Pokémon', entry.name, top, 12)
    row('Nature', entry.nature, top + 9.5)
    row('Ability', entry.ability, top + 18)
    row('Held Item', entry.item, top + 26)
    entry.moves.forEach((move, j) => row(`Move ${j + 1}`, move, top + 34 + 8 * j))

    if (sheet === 'close' && entry.stats) {
      const statX = 100 + 99 * column
      doc.setFontSize(11)
      doc.setFont(TEAM_FONT, 'normal')
      STAT_IDS.forEach((stat, j) => {
        doc.text(entry.stats![stat].toString(), statX, top + 19 + 8 * j, { align: 'right' })
      })
    }
  })

  if (sheet === 'open') {
    drawOpenHeader(doc)
  } else {
    drawStaffHeader(doc, options)
  }
}

function drawOpenHeader(doc: jsPDF) {
  doc.setFontSize(13)
  doc.setFont(LABEL_BOLD, 'normal')
  doc.text('2 of 2: ', 83, 18)
  doc.setFont(LABEL_BOLD_ITALIC, 'normal')
  doc.text('For Opponents', 96, 18)

  doc.setFontSize(10)
  doc.text(
    'Do not lose this page! Keep it throughout the tournament, sharing it with your opponent each round.',
    31,
    24,
  )
}

function drawStaffHeader(doc: jsPDF, { player }: TeamsheetOptions) {
  doc.setFontSize(13)
  doc.setFont(LABEL_BOLD, 'normal')
  doc.text('1 of 2: ', 77, 18)
  doc.setFont(LABEL_BOLD_ITALIC, 'normal')
  doc.text('For Tournament Staff', 90, 18)

  doc.setFontSize(10)
  doc.text(
    'Complete both pages of this document. Submit this page to event staff before the tournament, at the time set by the Organizer.',
    12,
    24,
  )

  // Private details only shown to staff
  const details: [string, string, number][] = [
    ['Player ID: ', player.playerId, 40],
    ['Date of Birth: ', player.birth, 47],
    ['Support ID: ', player.supportId, 54],
  ]
  doc.setLineWidth(0.3)
  for (const [label, value, y] of details) {
    doc.setFontSize(9)
    doc.setFont(LABEL_BOLD, 'normal')
    doc.text(label, 140, y, { align: 'right' })
    doc.line(140, y + 1.5, 190, y + 1.5)
    doc.setFontSize(13)
    doc.setFont(LABEL_REGULAR, 'normal')
    doc.text(value, 142, y)
  }

  // Stat column in each Pokémon box
  const statLabels = ['HP', 'Atk', 'Def', 'Sp. Atk', 'Sp. Def', 'Speed']
  doc.setLineWidth(0.4)
  doc.setFontSize(6)
  doc.setFont(LABEL_BOLD, 'normal')
  for (let i = 0; i < 6; i++) {
    const x = 6.5 + 99 * (i % 2)
    const y = 59.5 + 70 * Math.floor(i / 2)
    doc.line(x + 80, y + 12, x + 80, y + 68)
    statLabels.forEach((label, j) => doc.text(label, x + 81, y + 22 + 8 * j))
  }
}
