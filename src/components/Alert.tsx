import { useEffect, useRef, type ReactNode } from 'react'
import './Alert.css'

interface AlertProps {
  id?: string
  title: string
  children?: ReactNode
}

/** An error message that scrolls into view and takes focus when it appears. */
export function Alert({ id, title, children }: AlertProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    ref.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div id={id} ref={ref} className="alert" role="alert" tabIndex={-1}>
      <span className="alert-icon" aria-hidden="true">
        !
      </span>
      <div className="alert-body">
        <p className="alert-title">{title}</p>
        {children}
      </div>
    </div>
  )
}

export function AlertMessages({ messages }: { messages: string[] }) {
  if (messages.length === 1) return <p>{messages[0]}</p>
  return (
    <ul>
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  )
}
