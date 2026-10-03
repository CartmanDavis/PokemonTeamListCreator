import type { Lang } from '../lib/types'
import './LanguageSelector.css'

const LANGUAGES: { value: Lang; label: string }[] = [
  { value: 'En', label: 'English' },
  { value: 'Es', label: 'Spanish' },
  { value: 'Fre', label: 'French' },
  { value: 'Ger', label: 'German' },
  { value: 'Ita', label: 'Italian' },
  { value: 'Jpn', label: 'Japanese' },
  { value: 'Kor', label: 'Korean' },
  { value: 'Chs', label: 'Simplified Chinese' },
  { value: 'Cht', label: 'Traditional Chinese' },
]

interface LanguageSelectorProps {
  value: Lang
  onChange: (value: Lang) => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <label className="language-selector">
      <span>Team list language</span>
      <select value={value} onChange={(event) => onChange(event.target.value as Lang)}>
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  )
}
