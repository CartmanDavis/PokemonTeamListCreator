import { useEffect, useState } from 'react'
import App from './App'
import TeamCheckApp from './TeamCheckApp'
import { useHashPath } from './hooks/useHashPath'

/** The site's pages, picked by the URL hash: #/ for the generator and #/teamcheck for the team check. */
export function AppRoutes() {
  // The team lives here so it's kept when moving between pages.
  const [teamName, setTeamName] = useState('')
  const [paste, setPaste] = useState('')
  const team = { teamName, onTeamNameChange: setTeamName, paste, onPasteChange: setPaste }
  const path = useHashPath()
  const known = path === '/' || path === '/teamcheck'

  useEffect(() => {
    // Send unknown paths to the generator.
    if (!known) window.history.replaceState(null, '', '#/')
  }, [known])

  return path === '/teamcheck' ? (
    <TeamCheckApp {...team} />
  ) : (
    <App {...team} />
  )
}
