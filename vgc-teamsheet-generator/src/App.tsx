import { useState } from 'react'
import { OptionGroup, type Option } from './components/OptionGroup'
import { TextField } from './components/TextField'
import { TeamsheetError } from './lib/errors'
import type { AgeDivision, Game, Lang, PlayerInfo, SheetKind } from './lib/types'
import './App.css'

const GAMES: Option<Game>[] = [
  { value: 'sv', label: 'Scarlet & Violet' },
  { value: 'champions', label: 'Champions' },
]

const DIVISIONS: Option<AgeDivision>[] = [
  { value: 'Junior', label: 'Junior' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Master', label: 'Master' },
]

const SHEETS: Option<SheetKind>[] = [
  { value: 'open', label: 'Open Team List' },
  { value: 'close', label: 'Staff Team List' },
]

const LANGS: Option<Lang>[] = [
  { value: 'Cht', label: 'Traditional Chinese' },
  { value: 'Chs', label: 'Simplified Chinese' },
  { value: 'En', label: 'English' },
  { value: 'Es', label: 'Spanish' },
  { value: 'Fre', label: 'French' },
  { value: 'Ger', label: 'German' },
  { value: 'Ita', label: 'Italian' },
  { value: 'Jpn', label: 'Japanese' },
  { value: 'Kor', label: 'Korean' },
]

const PLAYER_FIELDS: {
  key: keyof PlayerInfo
  /** URL search param that pre-fills the field. */
  param: string
  label: string
  maxLength?: number
  help?: { href: string; text: string }
}[] = [
  { key: 'playerName', param: 'player', label: 'Player Name', maxLength: 45 },
  { key: 'trainerName', param: 'trainer', label: 'Trainer Name in Game' },
  { key: 'teamName', param: 'team', label: 'Battle Team Number / Name' },
  { key: 'switchName', param: 'switch', label: 'Switch Profile Name' },
  {
    key: 'playerId',
    param: 'id',
    label: 'Player ID',
    help: {
      href: 'https://support.pokemon.com/hc/en-us/articles/360001031234-How-do-I-generate-a-Player-ID',
      text: 'What is my Player ID?',
    },
  },
  { key: 'birth', param: 'dob', label: 'Date of Birth' },
  {
    key: 'supportId',
    param: 'spid',
    label: 'Support ID',
    help: { href: 'https://x.com/RoiRehh/status/2100668064249393459', text: 'What is my Support ID?' },
  },
]

// Thanks a lot to @joezhuu for the URL parameters
const urlParams = new URLSearchParams(window.location.search)

function initialPlayer(): PlayerInfo {
  const player = {} as PlayerInfo
  for (const { key, param } of PLAYER_FIELDS) {
    player[key] = urlParams.get(param) ?? ''
  }
  return player
}

function initialDivision(): AgeDivision {
  const age = urlParams.get('age')
  return DIVISIONS.find((d) => d.value === age)?.value ?? 'Master'
}

function initialLang(): Lang | null {
  // Params use the legacy lowercase ids, e.g. `lang=jpn`.
  const lang = urlParams.get('lang')?.toLowerCase()
  return LANGS.find((l) => l.value.toLowerCase() === lang)?.value ?? null
}

function App() {
  const [paste, setPaste] = useState('')
  const [game, setGame] = useState<Game>('champions')
  const [player, setPlayer] = useState(initialPlayer)
  const [ageDivision, setAgeDivision] = useState(initialDivision)
  const [sheets, setSheets] = useState<SheetKind[]>(['open', 'close'])
  const [lang, setLang] = useState(initialLang)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  const toggleSheet = (sheet: SheetKind) =>
    setSheets((current) => (current.includes(sheet) ? current.filter((s) => s !== sheet) : [...current, sheet]))

  async function handlePrint() {
    setError('')
    if (sheets.length === 0) return setError('NO TEAM LIST SELECTED')
    if (!paste) return setError('NO PASTE DETECTED')
    if (!lang) return setError('NO LANGUAGE SELECTED')

    setGenerating(true)
    try {
      // jsPDF and the translation tables are only needed once the user prints.
      const { generateTeamsheet } = await import('./lib/teamsheet')
      await generateTeamsheet({ player, paste, game, ageDivision, sheets, lang })
    } catch (err) {
      if (!(err instanceof TeamsheetError)) console.error(err)
      setError(err instanceof TeamsheetError ? err.message : 'SOMETHING WENT WRONG GENERATING THE PDF')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <p className="banner">CURRENTLY WORKING ON UPDATE FOR POKÉMON CHAMPIONS</p>
      <div className="layout">
        <section className="paste-area">
          <img src="/logo.png" alt="VGC Teamsheet Generator" />
          <textarea
            className="paste"
            aria-label="Showdown team paste"
            placeholder="Showdown team paste here =)"
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
          />
        </section>

        <section className="form-area">
          <div className="player-details">
            <OptionGroup
              name="game"
              label="Game"
              options={GAMES}
              isSelected={(value) => value === game}
              onToggle={setGame}
            />
            {PLAYER_FIELDS.map(({ key, label, maxLength, help }) => (
              <TextField
                key={key}
                label={label}
                maxLength={maxLength}
                help={help}
                value={player[key]}
                onChange={(value) => setPlayer((current) => ({ ...current, [key]: value }))}
              />
            ))}
          </div>

          <div className="choices">
            <OptionGroup
              name="ageDivision"
              label="Age division"
              options={DIVISIONS}
              isSelected={(value) => value === ageDivision}
              onToggle={setAgeDivision}
            />
            <OptionGroup
              name="sheet"
              label="Team lists"
              type="checkbox"
              className="sheets"
              options={SHEETS}
              isSelected={(value) => sheets.includes(value)}
              onToggle={toggleSheet}
            />
            <OptionGroup
              name="lang"
              label="Team list language"
              className="languages"
              options={LANGS}
              isSelected={(value) => value === lang}
              onToggle={setLang}
            />
          </div>

          <div className="actions">
            <button className="print" onClick={handlePrint} disabled={generating}>
              {generating ? 'GENERATING…' : 'PRINT SELECTED'}
            </button>
            <p className="error" role="alert">
              {error}
            </p>
          </div>
        </section>

        <aside className="tips">
          <p>Check with the event organizer if you're unsure about which lists to submit.</p>
          <p>All Pokémon must be listed exactly as they appear in the Battle Team, at the level they are in the game.</p>
          <p>
            This site is open source. You can check the{' '}
            <a target="_blank" rel="noreferrer" href="https://github.com/DhSufi/PokemonTeamListCreator">
              source code.
            </a>{' '}
            No data of any kind is transferred or stored. All code is executed in your browser without any server
            intervention.
          </p>
        </aside>
      </div>
    </>
  )
}

export default App
