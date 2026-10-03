import './PastePanel.css'

interface PastePanelProps {
  value: string
  onChange: (value: string) => void
}

export function PastePanel({ value, onChange }: PastePanelProps) {
  return (
    <section className="paste-panel">
      <img src="/logo.png" alt="VGC Teamsheet Generator" />
      <textarea
        aria-label="Showdown team paste"
        placeholder="Showdown team paste here =)"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  )
}
