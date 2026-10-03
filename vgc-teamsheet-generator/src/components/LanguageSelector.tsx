import type { Lang } from '../lib/types'
import { OptionGroup, type Option } from './OptionGroup'
import './LanguageSelector.css'

const LANGUAGES: Option<Lang>[] = [
  { value: 'Cht', label: 'Traditional Chinese' },
  { value: 'Chs', label: 'Simplified Chinese' },
  { value: 'En', label: 'English' },
  { value: 'Es', label: 'Spanish' },
  { value: 'Fre', label: 'French' },
  { value: 'Ger', label: 'German' },
  { value: 'Ita', label: 'Italian' },
  { value: 'Jpn', label: 'Japanese' },
  { value: 'Kor', label: 'Korean' },
]

interface LanguageSelectorProps {
  value: Lang | null
  onChange: (value: Lang) => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <OptionGroup
      name="lang"
      label="Team list language"
      className="language-selector"
      options={LANGUAGES}
      isSelected={(lang) => lang === value}
      onToggle={onChange}
    />
  )
}
