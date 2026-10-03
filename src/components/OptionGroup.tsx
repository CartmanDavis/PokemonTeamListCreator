import './OptionGroup.css'

export interface Option<T extends string> {
  value: T
  label: string
}

interface OptionGroupProps<T extends string> {
  name: string
  label: string
  options: readonly Option<T>[]
  /**
   * `radio` allows a single selection and renders as a segmented control.
   * `checkbox` allows any number and renders as checkbox tiles.
   */
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
    <fieldset className={['option-group', `option-group--${type}`, className].filter(Boolean).join(' ')}>
      <legend className="visually-hidden">{label}</legend>
      {options.map((option) => {
        const selected = isSelected(option.value)
        return (
          <label key={option.value} className={selected ? 'selected' : undefined}>
            <input
              className={type === 'radio' ? 'visually-hidden' : undefined}
              type={type}
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onToggle(option.value)}
            />
            {option.label}
          </label>
        )
      })}
    </fieldset>
  )
}
