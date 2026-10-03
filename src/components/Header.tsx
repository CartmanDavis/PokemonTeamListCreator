import './Header.css'

export function Header({ title = 'VGC Teamsheet Generator' }: { title?: string }) {
  return (
    <header className="site-header">
      <h1>{title}</h1>
    </header>
  )
}
