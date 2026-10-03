import './Footer.css'

const REPO_URL = 'https://github.com/CartmanDavis/PokemonTeamListCreator'
const ORIGINAL_REPO_URL = 'https://github.com/DhSufi/PokemonTeamListCreator'
const X_URL = 'https://x.com/CartmanCodes'

export function Footer() {
  return (
    <footer className="site-footer">
      <ul>
        <li>
          Open source on{' '}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </li>
        <li>
          Made by{' '}
          <a href={X_URL} target="_blank" rel="noreferrer">
            @CartmanCodes
          </a>
        </li>
        <li>
          Thanks to{' '}
          <a href={ORIGINAL_REPO_URL} target="_blank" rel="noreferrer">
            DhSufi
          </a>{' '}
          for the original
        </li>
      </ul>
    </footer>
  )
}
