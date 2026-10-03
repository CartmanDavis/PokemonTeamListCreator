import { useId } from 'react'
import { TextField } from './TextField'
import './TeamPanel.css'

interface TeamPanelProps {
  teamName: string
  onTeamNameChange: (value: string) => void
  paste: string
  onPasteChange: (value: string) => void
}

export function TeamPanel({ teamName, onTeamNameChange, paste, onPasteChange }: TeamPanelProps) {
  const headingId = useId()
  return (
    <section className="card team-panel" aria-labelledby={headingId}>
      <h2 id={headingId}>Team Info</h2>
      <TextField label="Battle Team Number / Name" value={teamName} onChange={onTeamNameChange} />
      <textarea
        aria-label="Showdown team paste"
        placeholder="Showdown team paste here =)"
        value={paste}
        onChange={(event) => onPasteChange(event.target.value)}
      />
    </section>
  )
}
