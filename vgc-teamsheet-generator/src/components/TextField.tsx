import { useId } from 'react'

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
  help?: { href: string; text: string }
}

export function TextField({ label, value, onChange, maxLength, help }: TextFieldProps) {
  const id = useId()
  return (
    <div className="text-field">
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
      {help && (
        <a target="_blank" rel="noreferrer" href={help.href}>
          {help.text}
        </a>
      )}
    </div>
  )
}
