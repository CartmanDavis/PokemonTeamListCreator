import { useState } from 'react'
import { PlayerDetailsForm } from './components/PlayerDetailsForm'
import { PrintActions } from './components/PrintActions'
import { PrintSettings } from './components/PrintSettings'
import { TeamPanel } from './components/TeamPanel'
import { usePlayerInfo } from './hooks/usePlayerInfo'
import { useTeamsheetPrinter } from './hooks/useTeamsheetPrinter'
import type { Lang, SheetKind } from './lib/types'
import './App.css'

function App() {
  const [teamName, setTeamName] = useState('')
  const [paste, setPaste] = useState('')
  const { player, setPlayer, remember, setRemember } = usePlayerInfo()
  const [sheets, setSheets] = useState<SheetKind[]>(['open', 'close'])
  const [lang, setLang] = useState<Lang>('En')
  const { print, error, generating } = useTeamsheetPrinter()

  return (
    <main className="app">
      <h1 className="visually-hidden">VGC Teamsheet Generator</h1>
      <PlayerDetailsForm value={player} onChange={setPlayer} remember={remember} onRememberChange={setRemember} />
      <TeamPanel teamName={teamName} onTeamNameChange={setTeamName} paste={paste} onPasteChange={setPaste} />
      <PrintSettings sheets={sheets} onSheetsChange={setSheets} lang={lang} onLangChange={setLang} />
      <PrintActions
        onPrint={() => print({ player, teamName, paste, sheets, lang })}
        generating={generating}
        error={error}
      />
    </main>
  )
}

export default App
