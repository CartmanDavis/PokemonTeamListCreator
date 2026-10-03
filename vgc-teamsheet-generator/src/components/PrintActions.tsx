import { Alert, AlertMessages } from './Alert'
import './PrintActions.css'

interface PrintActionsProps {
  onPrint: () => void
  generating: boolean
  /** A problem that isn't about the team itself, e.g. no team list selected. */
  problem?: { messages: string[]; id: number }
}

export function PrintActions({ onPrint, generating, problem }: PrintActionsProps) {
  return (
    <div className="print-actions">
      {problem && (
        <Alert key={problem.id} title="Can't print yet">
          <AlertMessages messages={problem.messages} />
        </Alert>
      )}
      <button onClick={onPrint} disabled={generating}>
        {generating ? 'GENERATING…' : 'PRINT SELECTED'}
      </button>
    </div>
  )
}
