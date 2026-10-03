import { jsPDF } from 'jspdf'
import calibriBoldUrl from '../assets/fonts/Calibri-Bold.ttf'
import calibriRegularUrl from '../assets/fonts/Calibri-Regular.ttf'
import calibriBoldItalicUrl from '../assets/fonts/Calibri-BoldItalic.ttf'
import droidSansFallbackUrl from '../assets/fonts/DroidSansFallback.ttf'
import notoSansJpUrl from '../assets/fonts/NotoSansJP-Regular.ttf'
import pretendardUrl from '../assets/fonts/Pretendard-Regular.ttf'
import notoSansUrl from '../assets/fonts/NotoSans-Regular.ttf'
import { TeamsheetError } from './errors'
import { teamsheetFileName } from './fileName'
import { loadFont } from './fonts'
import { loadTranslations, translate, type Category, type Translations } from './i18n'
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

const MAX_TEAM_SIZE = 6

export async function generateTeamsheet(options: TeamsheetOptions): Promise<void> {
  const pokemon = Koffing.parse(options.paste).teams[0]?.pokemon ?? []
  if (pokemon.length === 0) {
    throw new TeamsheetError(["We couldn't find any Pokémon in your paste. Paste a team exported from Pokémon Showdown."])
  }

  // Start the (large) font downloads right away, but validate the team before waiting on them.
  const fonts = Promise.all([loadFont(teamFontUrl(options.lang)), ...Object.values(LABEL_FONT_URLS).map(loadFont)])
  fonts.catch(() => {}) // Awaited below; avoids an unhandled rejection if validation fails first.
  const translations = await loadTranslations(options.lang)

  const sheets = SHEET_ORDER.filter((sheet) => options.sheets.includes(sheet))
  const issues: string[] = []
  if (pokemon.length > MAX_TEAM_SIZE) {
    issues.push(`Your paste has ${pokemon.length} Pokémon, but a team list holds ${MAX_TEAM_SIZE}. Remove the extras.`)
  }
  const entries = pokemon.map((poke) => resolveEntry(poke, translations, sheets.includes('close'), issues))
  if (issues.length > 0) {
    throw new TeamsheetError(issues)
  }

  const [teamFont, ...labelFonts] = await fonts
  const doc = new jsPDF()
  registerFont(doc, TEAM_FONT, teamFont)
  Object.keys(LABEL_FONT_URLS).forEach((name, i) => registerFont(doc, name, labelFonts[i]))

  sheets.forEach((sheet, i) => {
    if (i > 0) doc.addPage()
    drawSheet(doc, sheet, entries, options)
  })

  doc.save(teamsheetFileName(options.player.playerName, options.teamName, sheets))
}

function registerFont(doc: jsPDF, name: string, base64: string) {
  doc.addFileToVFS(`${name}.ttf`, base64)
  doc.addFont(`${name}.ttf`, name, 'normal')
}

// Helper function to allow for case insensitive inputs
function capitalizeInput(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/** Resolves a Pokémon's printed details, adding any problems found to `issues`. */
function resolveEntry(
  poke: Pokemon,
  translations: Translations,
  needsStats: boolean,
  issues: string[],
): TeamsheetEntry {
  const entry: TeamsheetEntry = { name: '', nature: '', ability: '', item: 'NO ITEM', moves: [] }

  const base = getBaseStats(poke.name)
  if (!base) {
    issues.push(`"${poke.name}" isn't a Pokémon we recognize. Check the spelling of its first line.`)
    return entry
  }
  const mega = /^(.+?)-Mega(-[XYZ])?$/.exec(poke.name)
  if (mega) {
    issues.push(`${poke.name} is a Mega Evolution. List it as ${mega[1]} holding its Mega Stone instead.`)
    return entry
  }

  const lookup = (category: Category, englishName: string, kind: string) => {
    const translated = translate(translations, category, englishName)
    if (translated === undefined) {
      issues.push(`${poke.name}: "${englishName}" isn't ${kind} we recognize. Check the spelling.`)
    }
    return translated ?? ''
  }

  const nature = poke.nature ? capitalizeInput(poke.nature) : 'Serious'
  entry.name = lookup('pokes', poke.name, 'a Pokémon')
  entry.nature = translate(translations, 'natures', nature) ?? nature
  if (poke.ability) {
    entry.ability = lookup('abilities', poke.ability, 'an ability')
  } else {
    issues.push(`${poke.name} has no ability. Add an "Ability:" line to its set.`)
  }
  if (poke.item) entry.item = lookup('items', poke.item, 'an item')
  entry.moves = poke.moves.map((move) => lookup('moves', move, 'a move'))

  // Nature is printed on every sheet in Champions, so check it even without stats.
  const modifiers = getNatureModifiers(nature)
  if (!modifiers) {
    issues.push(`${poke.name}: "${nature}" isn't a valid nature.`)
  } else if (needsStats) {
    entry.stats = getChampionsStats(base, fillSpread(poke.evs), modifiers)
  }

  return entry
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
  doc.text(options.teamName, 47, 47)
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

  const divisionX = 154 + 21 * AGE_DIVISIONS.indexOf(player.ageDivision)
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
