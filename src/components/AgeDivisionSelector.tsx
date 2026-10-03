import { AGE_DIVISIONS, type AgeDivision } from '../lib/types'
import { OptionGroup, type Option } from './OptionGroup'

const DIVISIONS: Option<AgeDivision>[] = AGE_DIVISIONS.map((division) => ({ value: division, label: division }))

interface AgeDivisionSelectorProps {
  value: AgeDivision
  onChange: (value: AgeDivision) => void
}

export function AgeDivisionSelector({ value, onChange }: AgeDivisionSelectorProps) {
  return (
    <OptionGroup
      name="ageDivision"
      label="Age division"
      options={DIVISIONS}
      isSelected={(division) => division === value}
      onToggle={onChange}
    />
  )
}
