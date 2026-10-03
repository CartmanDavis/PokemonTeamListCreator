import { useId, type ReactNode } from 'react'
import { InfoTip } from './InfoTip'
import './TextField.css'

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
  help?: ReactNode
}

export function TextField({ label, value, onChange, maxLength, help }: TextFieldProps) {
  const id = useId()
  return (
    <div className={help ? 'text-field has-help' : 'text-field'}>
      {/* The placeholder is a single space so CSS can float the label once the field has content. */}
      <input
        id={id}
        type="text"
        placeholder=" "
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <label htmlFor={id}>{label}</label>
      {help && <InfoTip label={`About ${label}`}>{help}</InfoTip>}
    </div>
  )
}
