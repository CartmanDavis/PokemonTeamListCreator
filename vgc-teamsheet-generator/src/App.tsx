import { useState } from 'react'
import { AgeDivisionSelector } from './components/AgeDivisionSelector'
import { LanguageSelector } from './components/LanguageSelector'
import { PlayerDetailsForm } from './components/PlayerDetailsForm'
import { PrintActions } from './components/PrintActions'
import { SheetSelector } from './components/SheetSelector'
import { TeamPanel } from './components/TeamPanel'
import { usePlayerInfo } from './hooks/usePlayerInfo'
import { useTeamsheetPrinter } from './hooks/useTeamsheetPrinter'
import type { AgeDivision, Lang, SheetKind } from './lib/types'
import './App.css'

function App() {
  const [teamName, setTeamName] = useState('')
  const [paste, setPaste] = useState('')
  const { player, setPlayer, remember, setRemember } = usePlayerInfo()
  const [ageDivision, setAgeDivision] = useState<AgeDivision>('Master')
  const [sheets, setSheets] = useState<SheetKind[]>(['open', 'close'])
  const [lang, setLang] = useState<Lang>('En')
  const { print, error, generating } = useTeamsheetPrinter()

  return (
    <main className="app">
      <PlayerDetailsForm value={player} onChange={setPlayer} remember={remember} onRememberChange={setRemember} />

      <div className="layout">
        <TeamPanel teamName={teamName} onTeamNameChange={setTeamName} paste={paste} onPasteChange={setPaste} />

        <section className="form-area">
          <div className="choices">
            <AgeDivisionSelector value={ageDivision} onChange={setAgeDivision} />
            <SheetSelector value={sheets} onChange={setSheets} />
            <LanguageSelector value={lang} onChange={setLang} />
          </div>

          <PrintActions
            onPrint={() => print({ player, teamName, paste, ageDivision, sheets, lang })}
            generating={generating}
            error={error}
          />
        </section>
      </div>
    </main>
  )
}

export default App
