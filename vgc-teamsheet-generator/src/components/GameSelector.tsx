import type { Game } from '../lib/types'
import { OptionGroup, type Option } from './OptionGroup'

const GAMES: Option<Game>[] = [
  { value: 'sv', label: 'Scarlet & Violet' },
  { value: 'champions', label: 'Champions' },
]

interface GameSelectorProps {
  value: Game
  onChange: (value: Game) => void
}

export function GameSelector({ value, onChange }: GameSelectorProps) {
  return (
    <OptionGroup
      name="game"
      label="Game"
      options={GAMES}
      isSelected={(game) => game === value}
      onToggle={onChange}
    />
  )
}
