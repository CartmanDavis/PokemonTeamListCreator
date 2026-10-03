import { useRef, useState } from 'react'
import { ScreenshotError } from '../lib/errors'
import type { OcrSession } from '../lib/screenshot/ocr'
import type { PokemonReport, TeamScreens } from '../lib/screenshot/verify'

export type TeamCheckState =
  | { status: 'idle' }
  | { status: 'checking'; step: string }
  | { status: 'done'; reports: PokemonReport[]; screens: (keyof TeamScreens)[] }
  | { status: 'failed'; messages: string[]; id: number }

export function useTeamCheck() {
  const [state, setState] = useState<TeamCheckState>({ status: 'idle' })
  const attempts = useRef(0)
  const fail = (messages: string[]) => setState({ status: 'failed', messages, id: ++attempts.current })

  async function check(paste: string, files: File[]) {
    if (!paste.trim()) return fail(['Paste your team from Pokémon Showdown to check it against the game.'])
    if (files.length === 0) return fail(['Add a screenshot of your Battle Team.'])
    if (files.length > 2) return fail(['Add at most two screenshots: one of Moves & More and one of Stats.'])

    setState({ status: 'checking', step: 'Starting the text reader…' })
    let ocr: OcrSession | undefined
    try {
      // The screenshot reader and Tesseract are only needed once someone checks a team.
      const [{ Koffing }, { decodeImage }, { readTeamScreenshot }, { startOcr }, { verifyTeam }] = await Promise.all([
        import('../lib/koffing'),
        import('../lib/screenshot/decode'),
        import('../lib/screenshot/read'),
        import('../lib/screenshot/ocr'),
        import('../lib/screenshot/verify'),
      ])
      const team = Koffing.parse(paste).teams[0]?.pokemon ?? []
      if (team.length === 0) {
        return fail(["We couldn't find any Pokémon in your paste. Paste a team exported from Pokémon Showdown."])
      }

      ocr = await startOcr()
      const screens: TeamScreens = {}
      for (const [i, file] of files.entries()) {
        setState({ status: 'checking', step: `Reading screenshot ${i + 1} of ${files.length}…` })
        const screenshot = await readTeamScreenshot(decodeImage(new Uint8Array(await file.arrayBuffer())), ocr.readText)
        if (screens[screenshot.kind]) {
          const page = screenshot.kind === 'moves' ? 'Moves & More' : 'Stats'
          return fail([`Both screenshots show the ${page} page. Add one of each page.`])
        }
        if (screenshot.kind === 'moves') screens.moves = screenshot.pokemon
        else screens.stats = screenshot.pokemon
      }
      setState({
        status: 'done',
        reports: verifyTeam(team, screens),
        screens: Object.keys(screens) as (keyof TeamScreens)[],
      })
    } catch (err) {
      if (err instanceof ScreenshotError) {
        fail([err.message])
      } else {
        console.error(err)
        fail(["Something went wrong reading your screenshots. Check they're images and try again."])
      }
    } finally {
      await ocr?.close()
    }
  }

  return { state, check }
}
