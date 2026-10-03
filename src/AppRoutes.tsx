import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import App from './App'
import TeamCheckApp from './TeamCheckApp'

/** The site's pages. main.tsx wraps these in a HashRouter, since GitHub Pages can't route paths. */
export function AppRoutes() {
  // The paste lives here so it's kept when moving between pages.
  const [paste, setPaste] = useState('')
  return (
    <Routes>
      <Route path="/" element={<App paste={paste} onPasteChange={setPaste} />} />
      <Route path="/teamcheck" element={<TeamCheckApp paste={paste} onPasteChange={setPaste} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
