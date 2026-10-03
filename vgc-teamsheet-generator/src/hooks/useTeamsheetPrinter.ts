import { useState } from 'react'
import { TeamsheetError } from '../lib/errors'
import type { Lang, TeamsheetOptions } from '../lib/types'

/** The teamsheet form before validation; the language may not be picked yet. */
export type TeamsheetForm = Omit<TeamsheetOptions, 'lang'> & { lang: Lang | null }

export function useTeamsheetPrinter() {
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  async function print(form: TeamsheetForm) {
    setError('')
    if (form.sheets.length === 0) return setError('NO TEAM LIST SELECTED')
    if (!form.paste) return setError('NO PASTE DETECTED')
    if (!form.lang) return setError('NO LANGUAGE SELECTED')

    setGenerating(true)
    try {
      // jsPDF and the translation tables are only needed once the user prints.
      const { generateTeamsheet } = await import('../lib/teamsheet')
      await generateTeamsheet({ ...form, lang: form.lang })
    } catch (err) {
      if (!(err instanceof TeamsheetError)) console.error(err)
      setError(err instanceof TeamsheetError ? err.message : 'SOMETHING WENT WRONG GENERATING THE PDF')
    } finally {
      setGenerating(false)
    }
  }

  return { print, error, generating }
}
