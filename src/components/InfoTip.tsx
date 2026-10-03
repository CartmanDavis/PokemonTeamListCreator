import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import './InfoTip.css'

interface InfoTipProps {
  /** Accessible name for the button, e.g. "About Player ID". */
  label: string
  children: ReactNode
}

/** An "i" button that toggles an info bubble (disclosure pattern). */
export function InfoTip({ label, children }: InfoTipProps) {
  const [open, setOpen] = useState(false)
  const bubbleId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      className="info-tip"
      ref={rootRef}
      onBlur={(event) => {
        // Close when focus moves somewhere outside the button and bubble.
        if (!rootRef.current?.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="info-tip-button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={bubbleId}
        onClick={() => setOpen((current) => !current)}
      >
        i
      </button>
      <div id={bubbleId} className="info-tip-bubble" hidden={!open}>
        {children}
      </div>
    </div>
  )
}
