import './PrintActions.css'

interface PrintActionsProps {
  onPrint: () => void
  generating: boolean
  error: string
}

export function PrintActions({ onPrint, generating, error }: PrintActionsProps) {
  return (
    <div className="print-actions">
      <button onClick={onPrint} disabled={generating}>
        {generating ? 'GENERATING…' : 'PRINT SELECTED'}
      </button>
      <p className="error" role="alert">
        {error}
      </p>
    </div>
  )
}
