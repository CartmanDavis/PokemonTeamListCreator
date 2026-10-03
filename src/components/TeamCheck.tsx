import { useId, useState } from 'react'
import { useTeamCheck } from '../hooks/useTeamCheck'
import type { PokemonReport } from '../lib/screenshot/verify'
import { Alert, AlertMessages } from './Alert'
import './TeamCheck.css'

interface TeamCheckProps {
  paste: string
}

export function TeamCheck({ paste }: TeamCheckProps) {
  const headingId = useId()
  const [files, setFiles] = useState<File[]>([])
  const { state, check } = useTeamCheck()
  const checking = state.status === 'checking'

  return (
    <section className="card team-check" aria-labelledby={headingId}>
      <h2 id={headingId}>Verify In-Game Team</h2>
      <p className="team-check-hint">
        Add screenshots of your Battle Team's <strong>Moves &amp; More</strong> and <strong>Stats</strong> pages to check
        them against your paste. Screenshots are read on your device and never uploaded.
      </p>
      <p className="team-check-disclaimer">
        A lot of care went into building this tool to read your screenshots accurately, but this check can make
        mistakes. As a competitor, it's your responsibility to make sure your team list matches your in-game team.
      </p>
      <div className="team-check-controls">
        <input
          type="file"
          accept="image/*"
          multiple
          aria-label="Battle Team screenshots"
          onChange={(event) => setFiles([...(event.target.files ?? [])])}
        />
        <button className="secondary-button" onClick={() => check(paste, files)} disabled={checking}>
          {checking ? 'Checking…' : 'Check team'}
        </button>
      </div>
      {state.status === 'checking' && (
        <p className="team-check-hint" role="status">
          {state.step}
        </p>
      )}
      {state.status === 'failed' && (
        <Alert key={state.id} title="Couldn't check your team">
          <AlertMessages messages={state.messages} />
        </Alert>
      )}
      {state.status === 'done' && (
        <>
          {state.screens.length < 2 && (
            <p className="team-check-hint">
              Only the {state.screens[0] === 'moves' ? 'Moves & More' : 'Stats'} page was checked. Add the other page to
              check everything.
            </p>
          )}
          <TeamCheckResults reports={state.reports} />
        </>
      )}
    </section>
  )
}

export function TeamCheckResults({ reports }: { reports: PokemonReport[] }) {
  const problems = reports.reduce((sum, report) => sum + report.checks.filter((c) => !c.ok).length, 0)
  return (
    <div className="team-check-results">
      <p className={problems === 0 ? 'team-check-summary ok' : 'team-check-summary'} role="status">
        {problems === 0
          ? 'Your team is valid. This tool can make mistakes. Be sure to double check!'
          : `${problems} ${problems === 1 ? 'error' : 'errors'}`}
      </p>
      {reports.map((report, i) => {
        const wrong = report.checks.filter((c) => !c.ok)
        return (
          <details key={i} className="team-check-pokemon" open={wrong.length > 0}>
            <summary>
              <span aria-hidden="true">{wrong.length === 0 ? '✓' : '✗'}</span> {report.name}
              {wrong.length > 0 && ` (${wrong.length} ${wrong.length === 1 ? 'error' : 'errors'})`}
            </summary>
            <table>
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">Paste</th>
                  <th scope="col">Game</th>
                </tr>
              </thead>
              <tbody>
                {report.checks.map((c, i) => (
                  <tr key={i} className={c.ok ? undefined : 'mismatch'}>
                    <th scope="row">{c.label}</th>
                    <td>
                      <Value text={c.expected} detail={c.expectedDetail} />
                    </td>
                    <td>
                      <Value text={c.found} detail={c.foundDetail} />
                      {c.note && (
                        <span className="team-check-note" role="img" aria-label={c.note} title={c.note}>
                          !
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        )
      })}
    </div>
  )
}

/** A value with a detail is a pair of numbers, like stat points and the stat, kept right-aligned. */
function Value({ text, detail }: { text: string; detail?: string }) {
  if (!detail) return text || <span className="team-check-blank">-</span>
  return (
    <>
      <span className="team-check-number">{text}</span>{' '}
      <span className="team-check-number team-check-detail">({detail})</span>
    </>
  )
}
