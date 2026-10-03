import { useId, useState } from 'react'
import type { PlayerInfo } from '../lib/types'
import { AgeDivisionSelector } from './AgeDivisionSelector'
import { TextField } from './TextField'
import './PlayerDetailsForm.css'

const FIELDS: {
  key: Exclude<keyof PlayerInfo, 'ageDivision'>
  label: string
  maxLength?: number
  help?: { href: string; text: string }
}[] = [
  { key: 'playerName', label: 'Player Name', maxLength: 45 },
  { key: 'trainerName', label: 'Trainer Name in Game' },
  { key: 'switchName', label: 'Switch Profile Name' },
  {
    key: 'playerId',
    label: 'Player ID',
    help: {
      href: 'https://support.pokemon.com/hc/en-us/articles/360001031234-How-do-I-generate-a-Player-ID',
      text: 'What is my Player ID?',
    },
  },
  { key: 'birth', label: 'Date of Birth' },
  {
    key: 'supportId',
    label: 'Support ID',
    help: { href: 'https://x.com/RoiRehh/status/2100668064249393459', text: 'What is my Support ID?' },
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
        <label className="remember" title="Stored only in this browser">
          <input type="checkbox" checked={remember} onChange={(event) => onRememberChange(event.target.checked)} />
          Save my info for next time
        </label>
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
        <button type="button" className="secondary-button" onClick={() => setEditing(false)}>
          Done
        </button>
      </div>
    </section>
  )
}
