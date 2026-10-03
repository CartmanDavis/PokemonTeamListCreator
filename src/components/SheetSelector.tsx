import type { SheetKind } from '../lib/types'
import { OptionGroup, type Option } from './OptionGroup'
import './SheetSelector.css'

const SHEETS: Option<SheetKind>[] = [
  { value: 'open', label: 'Open Team List' },
  { value: 'close', label: 'Staff Team List' },
]

interface SheetSelectorProps {
  value: SheetKind[]
  onChange: (value: SheetKind[]) => void
}

export function SheetSelector({ value, onChange }: SheetSelectorProps) {
  const toggle = (sheet: SheetKind) =>
    onChange(value.includes(sheet) ? value.filter((s) => s !== sheet) : [...value, sheet])

  return (
    <OptionGroup
      name="sheet"
      label="Team lists"
      type="checkbox"
      className="sheet-selector"
      options={SHEETS}
      isSelected={(sheet) => value.includes(sheet)}
      onToggle={toggle}
    />
  )
}
