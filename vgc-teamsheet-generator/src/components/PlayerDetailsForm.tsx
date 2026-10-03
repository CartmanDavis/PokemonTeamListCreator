import type { PlayerInfo } from '../lib/types'
import { TextField } from './TextField'

const FIELDS: {
  key: keyof PlayerInfo
  label: string
  maxLength?: number
  help?: { href: string; text: string }
}[] = [
  { key: 'playerName', label: 'Player Name', maxLength: 45 },
  { key: 'trainerName', label: 'Trainer Name in Game' },
  { key: 'teamName', label: 'Battle Team Number / Name' },
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

interface PlayerDetailsFormProps {
  value: PlayerInfo
  onChange: (value: PlayerInfo) => void
}

export function PlayerDetailsForm({ value, onChange }: PlayerDetailsFormProps) {
  return FIELDS.map(({ key, label, maxLength, help }) => (
    <TextField
      key={key}
      label={label}
      maxLength={maxLength}
      help={help}
      value={value[key]}
      onChange={(field) => onChange({ ...value, [key]: field })}
    />
  ))
}
