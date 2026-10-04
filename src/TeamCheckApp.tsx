import { useEffect } from 'react'
import { Footer, X_URL } from './components/Footer'
import { Header } from './components/Header'
import { SiteNav } from './components/SiteNav'
import { TeamCheck } from './components/TeamCheck'
import { TeamPanel } from './components/TeamPanel'
import './App.css'

/** The #/teamcheck page: checks a paste against screenshots of the in-game team. */
interface TeamCheckAppProps {
  teamName: string
  onTeamNameChange: (value: string) => void
  paste: string
  onPasteChange: (value: string) => void
}

function TeamCheckApp({ teamName, onTeamNameChange, paste, onPasteChange }: TeamCheckAppProps) {
  useEffect(() => {
    const previous = document.title
    document.title = 'In-Game Team Check · VGC Teamsheet Generator'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <div className="page">
      <Header title="In-Game Team Check" />
      <SiteNav current="teamcheck" />
      <main className="app">
        <p className="beta-notice">
          <strong>This feature is in beta.</strong> If you run into problems, DM me on{' '}
          <a href={X_URL} target="_blank" rel="noreferrer">
            X (@CartmanCodes)
          </a>{' '}
          with your screenshots, device model, and paste.
        </p>
        <TeamPanel teamName={teamName} onTeamNameChange={onTeamNameChange} paste={paste} onPasteChange={onPasteChange} />
        <TeamCheck paste={paste} />
      </main>
      <Footer />
    </div>
  )
}

export default TeamCheckApp
