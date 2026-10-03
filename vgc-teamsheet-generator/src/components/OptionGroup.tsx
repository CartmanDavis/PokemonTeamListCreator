import './OptionGroup.css'

export interface Option<T extends string> {
  value: T
  label: string
}

interface OptionGroupProps<T extends string> {
  name: string
  label: string
  options: readonly Option<T>[]
  /** `radio` allows a single selection, `checkbox` allows any number. */
  type?: 'radio' | 'checkbox'
  isSelected: (value: T) => boolean
  onToggle: (value: T) => void
  className?: string
}

export function OptionGroup<T extends string>({
  name,
  label,
  options,
  type = 'radio',
  isSelected,
  onToggle,
  className,
}: OptionGroupProps<T>) {
  return (
    <fieldset className={['option-group', className].filter(Boolean).join(' ')}>
      <legend className="visually-hidden">{label}</legend>
      {options.map((option) => {
        const selected = isSelected(option.value)
        return (
          <label key={option.value} className={selected ? 'selected' : undefined}>
            <input
              className="visually-hidden"
              type={type}
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onToggle(option.value)}
            />
            <span className="option">
              <span className="chroma">
                <span>{option.label}</span>
              </span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
