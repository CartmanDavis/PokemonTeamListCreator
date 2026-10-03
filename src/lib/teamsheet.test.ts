import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TeamsheetError } from './errors'
import { generateTeamsheet } from './teamsheet'
import { DEFAULT_PLAYER, type Lang, type SheetKind } from './types'

const saved = vi.hoisted(() => [] as { name: string; pages: number }[])

// Read fonts from disk instead of fetching them.
vi.mock('./fonts', async () => {
  const fs = await import('node:fs')
  const path = await import('node:path')
  return { loadFont: async (url: string) => fs.readFileSync(path.join(process.cwd(), url)).toString('base64') }
})

// Record saved PDFs instead of writing them to disk.
vi.mock('jspdf', async (importOriginal) => {
  const mod = await importOriginal<typeof import('jspdf')>()
  class RecordingPDF extends mod.jsPDF {
    constructor(...args: ConstructorParameters<typeof mod.jsPDF>) {
      super(...args)
      ;(this as { save: unknown }).save = (name: string) => {
        saved.push({ name, pages: this.getNumberOfPages() })
      }
    }
  }
  return { ...mod, jsPDF: RecordingPDF }
})

const TEAM = `Incineroar @ Sitrus Berry
Ability: Intimidate
EVs: 32 HP / 2 Atk / 32 SpD
Careful Nature
- Fake Out
- Flare Blitz
- Parting Shot
- Knock Off

Flutter Mane @ Booster Energy
Ability: Protosynthesis
EVs: 32 SpA / 32 Spe
Timid Nature
- Moonblast
- Shadow Ball
- Protect
- Icy Wind`

function generate(paste: string, sheets: SheetKind[] = ['open', 'close'], lang: Lang = 'En') {
  return generateTeamsheet({
    player: { ...DEFAULT_PLAYER, playerName: 'Ash Ketchum' },
    teamName: 'BT 3',
    paste,
    sheets,
    lang,
  })
}

async function issuesFor(paste: string, sheets?: SheetKind[]): Promise<string[]> {
  try {
    await generate(paste, sheets)
  } catch (err) {
    if (err instanceof TeamsheetError) return err.issues
    throw err
  }
  throw new Error('Expected a TeamsheetError')
}

beforeEach(() => {
  saved.length = 0
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 2, 12))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('generateTeamsheet', () => {
  it('prints both sheets as one two-page PDF', async () => {
    await generate(TEAM)
    expect(saved).toEqual([{ name: 'Ash Ketchum - BT 3 - Team List - 2026-10-02.pdf', pages: 2 }])
  })

  it('prints a single sheet on its own', async () => {
    await generate(TEAM, ['open'])
    expect(saved).toEqual([{ name: 'Ash Ketchum - BT 3 - Open Team List - 2026-10-02.pdf', pages: 1 }])
  })

  it.each(['Chs', 'Cht', 'En', 'Es', 'Fre', 'Ger', 'Ita', 'Jpn', 'Kor'] as const)('prints in %s', async (lang) => {
    await generate(TEAM, ['open', 'close'], lang)
    expect(saved).toHaveLength(1)
  })
})

describe('team validation', () => {
  it('reports every problem in the paste at once', async () => {
    const paste = `Charizard-Mega-Y @ Charizardite Y
Ability: Drought
- Heat Wave

Incineroar @ Sitrus Bery
Ability: Intimidate
- Fake Punch

Flutter Mane
- Moonblast`
    expect(await issuesFor(paste)).toEqual([
      'Charizard-Mega-Y is a Mega Evolution. List it as Charizard holding its Mega Stone instead.',
      'Incineroar: "Sitrus Bery" isn\'t an item we recognize. Check the spelling.',
      'Incineroar: "Fake Punch" isn\'t a move we recognize. Check the spelling.',
      'Flutter Mane has no ability. Add an "Ability:" line to its set.',
    ])
    expect(saved).toHaveLength(0)
  })

  it('rejects a paste with no Pokémon', async () => {
    expect(await issuesFor('   ')).toEqual([
      "We couldn't find any Pokémon in your paste. Paste a team exported from Pokémon Showdown.",
    ])
  })

  it('rejects unknown species', async () => {
    expect(await issuesFor('asdf')).toEqual([`"asdf" isn't a Pokémon we recognize. Check the spelling of its first line.`])
  })

  it('rejects more than six Pokémon', async () => {
    const mon = 'Incineroar\nAbility: Intimidate\n- Fake Out'
    expect(await issuesFor(Array(7).fill(mon).join('\n\n'))).toEqual([
      'Your paste has 7 Pokémon, but a team list holds 6. Remove the extras.',
    ])
  })

  it('rejects invalid natures even when only the open sheet is printed', async () => {
    expect(await issuesFor('Incineroar\nAbility: Intimidate\nGrumpy Nature\n- Fake Out', ['open'])).toEqual([
      'Incineroar: "Grumpy" isn\'t a valid nature.',
    ])
  })
})
