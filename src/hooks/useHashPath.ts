import { useEffect, useState } from 'react'

const readPath = () => window.location.hash.replace(/^#/, '') || '/'

/** The path after the "#" in the URL, e.g. "/teamcheck". Hash URLs work on GitHub Pages, which can't route paths. */
export function useHashPath(): string {
  const [path, setPath] = useState(readPath)
  useEffect(() => {
    const onHashChange = () => setPath(readPath())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return path
}
