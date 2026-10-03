import { useId } from 'react'
import { Alert, AlertMessages } from './Alert'
import { TextField } from './TextField'
import './TeamPanel.css'

interface TeamPanelProps {
  teamName: string
  onTeamNameChange: (value: string) => void
  paste: string
  onPasteChange: (value: string) => void
  /** Problems found in the paste on the last print attempt. */
  issues?: { messages: string[]; id: number }
}

export function TeamPanel({ teamName, onTeamNameChange, paste, onPasteChange, issues }: TeamPanelProps) {
  const headingId = useId()
  const alertId = useId()
  const fixes = issues?.messages.length ?? 0

  return (
    <section className="card team-panel" aria-labelledby={headingId}>
      <h2 id={headingId}>Team Info</h2>
      <TextField label="Battle Team Number / Name" value={teamName} onChange={onTeamNameChange} />
      <textarea
        aria-label="Showdown team paste"
        aria-invalid={issues ? true : undefined}
        aria-describedby={issues ? alertId : undefined}
        placeholder="Showdown team paste here =)"
        value={paste}
        onChange={(event) => onPasteChange(event.target.value)}
      />
      {issues && (
        <Alert
          key={issues.id}
          id={alertId}
          title={fixes === 1 ? 'Your team needs a fix before printing' : `Your team needs ${fixes} fixes before printing`}
        >
          <AlertMessages messages={issues.messages} />
        </Alert>
      )}
    </section>
  )
}
