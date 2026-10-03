import { useId } from 'react'
import type { Lang, SheetKind } from '../lib/types'
import { LanguageSelector } from './LanguageSelector'
import { SheetSelector } from './SheetSelector'
import './PrintSettings.css'

interface PrintSettingsProps {
  sheets: SheetKind[]
  onSheetsChange: (value: SheetKind[]) => void
  lang: Lang
  onLangChange: (value: Lang) => void
}

export function PrintSettings({ sheets, onSheetsChange, lang, onLangChange }: PrintSettingsProps) {
  const headingId = useId()
  return (
    <section className="print-settings" aria-labelledby={headingId}>
      <h2 id={headingId}>Print Settings</h2>
      <SheetSelector value={sheets} onChange={onSheetsChange} />
      <LanguageSelector value={lang} onChange={onLangChange} />
    </section>
  )
}
