import { useState } from 'react'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
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
  const { print, generating, problem, clearProblem } = useTeamsheetPrinter()

  return (
    <div className="page">
      <Header />
      <main className="app">
        <PlayerDetailsForm value={player} onChange={setPlayer} remember={remember} onRememberChange={setRemember} />
        <TeamPanel
          teamName={teamName}
          onTeamNameChange={setTeamName}
          paste={paste}
          onPasteChange={(value) => {
            setPaste(value)
            clearProblem('team')
          }}
          issues={problem?.area === 'team' ? problem : undefined}
        />
        <PrintSettings
          sheets={sheets}
          onSheetsChange={(value) => {
            setSheets(value)
            clearProblem('print')
          }}
          lang={lang}
          onLangChange={setLang}
        />
        <PrintActions
          onPrint={() => print({ player, teamName, paste, sheets, lang })}
          generating={generating}
          problem={problem?.area === 'print' ? problem : undefined}
        />
      </main>
      <Footer />
    </div>
  )
}

export default App
