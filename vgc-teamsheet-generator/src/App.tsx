import { useState } from 'react'
import { AgeDivisionSelector } from './components/AgeDivisionSelector'
import { LanguageSelector } from './components/LanguageSelector'
import { PastePanel } from './components/PastePanel'
import { PlayerDetailsForm } from './components/PlayerDetailsForm'
import { PrintActions } from './components/PrintActions'
import { SheetSelector } from './components/SheetSelector'
import { usePlayerInfo } from './hooks/usePlayerInfo'
import { useTeamsheetPrinter } from './hooks/useTeamsheetPrinter'
import { readUrlDefaults } from './lib/urlParams'
import type { SheetKind } from './lib/types'
import './App.css'

const urlDefaults = readUrlDefaults()

function App() {
  const [paste, setPaste] = useState('')
  const { player, setPlayer, remember, setRemember } = usePlayerInfo(urlDefaults.player)
  const [ageDivision, setAgeDivision] = useState(urlDefaults.ageDivision)
  const [sheets, setSheets] = useState<SheetKind[]>(['open', 'close'])
  const [lang, setLang] = useState(urlDefaults.lang)
  const { print, error, generating } = useTeamsheetPrinter()

  return (
    <main className="app">
      <PlayerDetailsForm value={player} onChange={setPlayer} remember={remember} onRememberChange={setRemember} />

      <div className="layout">
        <PastePanel value={paste} onChange={setPaste} />

        <section className="form-area">
          <div className="choices">
            <AgeDivisionSelector value={ageDivision} onChange={setAgeDivision} />
            <SheetSelector value={sheets} onChange={setSheets} />
            <LanguageSelector value={lang} onChange={setLang} />
          </div>

          <PrintActions
            onPrint={() => print({ player, paste, ageDivision, sheets, lang })}
            generating={generating}
            error={error}
          />
        </section>
      </div>
    </main>
  )
}

export default App
