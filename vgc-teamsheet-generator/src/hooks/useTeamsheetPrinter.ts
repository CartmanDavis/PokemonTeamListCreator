import { useState } from 'react'
import { TeamsheetError } from '../lib/errors'
import type { TeamsheetOptions } from '../lib/types'

export function useTeamsheetPrinter() {
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  async function print(form: TeamsheetOptions) {
    setError('')
    if (form.sheets.length === 0) return setError('NO TEAM LIST SELECTED')
    if (!form.paste) return setError('NO PASTE DETECTED')

    setGenerating(true)
    try {
      // jsPDF and the translation tables are only needed once the user prints.
      const { generateTeamsheet } = await import('../lib/teamsheet')
      await generateTeamsheet(form)
    } catch (err) {
      if (!(err instanceof TeamsheetError)) console.error(err)
      setError(err instanceof TeamsheetError ? err.message : 'SOMETHING WENT WRONG GENERATING THE PDF')
    } finally {
      setGenerating(false)
    }
  }

  return { print, error, generating }
}
