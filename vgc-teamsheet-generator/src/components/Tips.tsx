import './Tips.css'

export function Tips() {
  return (
    <aside className="tips">
      <p>Check with the event organizer if you're unsure about which lists to submit.</p>
      <p>All Pokémon must be listed exactly as they appear in the Battle Team, at the level they are in the game.</p>
      <p>
        This site is open source. You can check the{' '}
        <a target="_blank" rel="noreferrer" href="https://github.com/DhSufi/PokemonTeamListCreator">
          source code.
        </a>{' '}
        No data of any kind is transferred or stored. All code is executed in your browser without any server
        intervention.
      </p>
    </aside>
  )
}
