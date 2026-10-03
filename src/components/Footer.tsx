import './Footer.css'

const REPO_URL = 'https://github.com/CartmanDavis/PokemonTeamListCreator'
const ORIGINAL_REPO_URL = 'https://github.com/DhSufi/PokemonTeamListCreator'
export const X_URL = 'https://x.com/CartmanCodes'

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
          Forked and maintained by{' '}
          <a href={X_URL} target="_blank" rel="noreferrer">
            @CartmanCodes
          </a>
        </li>
        <li>
          Based on{' '}
          <a href={ORIGINAL_REPO_URL} target="_blank" rel="noreferrer">
            DhSufi's Team List Generator
          </a>
        </li>
      </ul>
    </footer>
  )
}
