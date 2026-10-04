import { useId, useState, type ReactNode } from 'react'
import type { PlayerInfo } from '../lib/types'
import { AgeDivisionSelector } from './AgeDivisionSelector'
import { TextField } from './TextField'
import './PlayerDetailsForm.css'

const FIELDS: {
  key: Exclude<keyof PlayerInfo, 'ageDivision'>
  label: string
  maxLength?: number
  help?: ReactNode
}[] = [
  { key: 'playerName', label: 'Player Name', maxLength: 45 },
  { key: 'trainerName', label: 'Trainer Name in Game' },
  { key: 'switchName', label: 'Switch Profile Name' },
  {
    key: 'playerId',
    label: 'Player ID',
    help: (
      <>
        <p>Your Play! Pokémon Player ID is shown under your name in your Pokémon Trainer Central account.</p>
        <p>Don't have one yet?</p>
        <ol>
          <li>
            Log in to Pokémon Trainer Central and choose <strong>Play! Pokémon</strong> from the menu.
          </li>
          <li>
            Select <strong>Create a Play! Pokémon Account</strong> and fill in the required details.
          </li>
          <li>
            At <strong>Enter Your Player ID</strong>, choose <strong>I do not have a Player ID</strong>, then{' '}
            <strong>Continue</strong>.
          </li>
        </ol>
        <p>
          If you were given a Player ID at an event, choose <strong>I have a Player ID</strong> instead and enter it
          with its PIN.
        </p>
      </>
    ),
  },
  { key: 'birth', label: 'Date of Birth' },
  {
    key: 'supportId',
    label: 'Support ID',
    help: (
      <>
        <p>Your Pokémon Champions Support ID can be found in two places:</p>
        <ul>
          <li>
            On the title screen, in the bottom-right corner before you select <strong>Start</strong>.
          </li>
          <li>
            In the main menu, under <strong>Submenu → Legal Info &amp; More</strong>.
          </li>
        </ul>
        <p>It only appears on the Staff team list.</p>
      </>
    ),
  },
]

function summarize(player: PlayerInfo): string {
  return [player.playerName || 'No name yet', `${player.ageDivision} Division`, player.playerId && `ID ${player.playerId}`]
    .filter(Boolean)
    .join(' · ')
}

interface PlayerDetailsFormProps {
  value: PlayerInfo
  onChange: (value: PlayerInfo) => void
  remember: boolean
  onRememberChange: (remember: boolean) => void
}

export function PlayerDetailsForm({ value, onChange, remember, onRememberChange }: PlayerDetailsFormProps) {
  const headingId = useId()
  // Returning players with saved info start with the compact summary.
  const [editing, setEditing] = useState(!remember)

  if (!editing) {
    return (
      <section className="card player-details" aria-labelledby={headingId}>
        <div className="card-header">
          <h2 id={headingId}>Player Info</h2>
          <button type="button" className="secondary-button" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
        <p className="player-summary">{summarize(value)}</p>
      </section>
    )
  }

  return (
    <section className="card player-details" aria-labelledby={headingId}>
      <div className="card-header">
        <h2 id={headingId}>Player Info</h2>
      </div>

      <div className="player-details-fields">
        {FIELDS.map(({ key, label, maxLength, help }) => (
          <TextField
            key={key}
            label={label}
            maxLength={maxLength}
            help={help}
            value={value[key]}
            onChange={(field) => onChange({ ...value, [key]: field })}
          />
        ))}
      </div>

      <div className="player-details-footer">
        <AgeDivisionSelector
          value={value.ageDivision}
          onChange={(ageDivision) => onChange({ ...value, ageDivision })}
        />
        <div className="player-details-actions">
          <label className="remember" title="Stored only in this browser">
            <input type="checkbox" checked={remember} onChange={(event) => onRememberChange(event.target.checked)} />
            Save my info for next time
          </label>
          <button type="button" className="secondary-button" onClick={() => setEditing(false)}>
            Done
          </button>
        </div>
      </div>
    </section>
  )
}
