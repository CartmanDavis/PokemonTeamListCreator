import './SiteNav.css'

/** Tabs for switching between the site's pages. */
export function SiteNav({ current }: { current: 'generate' | 'teamcheck' }) {
  return (
    <nav className="site-nav" aria-label="Pages">
      <a href="#/" aria-current={current === 'generate' ? 'page' : undefined}>
        Generate Teamsheet
      </a>
      <a href="#/teamcheck" aria-current={current === 'teamcheck' ? 'page' : undefined}>
        Verify Team <span className="beta-badge">beta</span>
      </a>
    </nav>
  )
}
