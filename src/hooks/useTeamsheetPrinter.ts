import { useRef, useState } from 'react'
import { TeamsheetError } from '../lib/errors'
import type { TeamsheetOptions } from '../lib/types'

export interface PrintProblem {
  /** Which part of the form the problem belongs to, so it can be shown there. */
  area: 'team' | 'print'
  messages: string[]
  /** Changes on every failed attempt, so a repeated problem is announced again. */
  id: number
}

export function useTeamsheetPrinter() {
  const [problem, setProblem] = useState<PrintProblem | null>(null)
  const [generating, setGenerating] = useState(false)
  const attempts = useRef(0)

  const fail = (area: PrintProblem['area'], messages: string[]) =>
    setProblem({ area, messages, id: ++attempts.current })

  async function print(form: TeamsheetOptions) {
    setProblem(null)
    if (!form.paste.trim()) return fail('team', ['Paste your team from Pokémon Showdown to print a team list.'])
    if (form.sheets.length === 0) return fail('print', ['Select at least one team list to print.'])

    setGenerating(true)
    try {
      // jsPDF and the translation tables are only needed once the user prints.
      const { generateTeamsheet } = await import('../lib/teamsheet')
      await generateTeamsheet(form)
    } catch (err) {
      if (err instanceof TeamsheetError) {
        fail('team', err.issues)
      } else {
        console.error(err)
        fail('print', ['Something went wrong generating the PDF. Please try again.'])
      }
    } finally {
      setGenerating(false)
    }
  }

  const clearProblem = (area: PrintProblem['area']) =>
    setProblem((current) => (current?.area === area ? null : current))

  return { print, generating, problem, clearProblem }
}
