import { CircleAlert, CircleCheck } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { useTeamCheck } from '../hooks/useTeamCheck'
import type { Check, PokemonReport } from '../lib/screenshot/verify'
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

/**
 * What the game shows for each Pokémon. A wrong value is struck through with what the paste says
 * it should be beside it, and warnings sit beside the field they're about.
 */
export function TeamCheckResults({ reports }: { reports: PokemonReport[] }) {
  const problems = reports.some((report) => report.checks.some((c) => !c.ok))
  return (
    <>
      {problems ? (
        <Alert title="There were issues found with your in-game team" />
      ) : (
        <p className="team-check-valid" role="status">
          <CircleCheck size={20} aria-hidden="true" />
          Your team is valid. This tool can make mistakes. Be sure to double check!
        </p>
      )}
      <div className="team-check-results">
        {reports.map((report, i) => (
          <section key={i} className="team-check-pokemon" aria-label={report.name}>
            <h3>{report.name}</h3>
            <table>
              <tbody>
                {report.checks.map((c, i) => (
                  <tr key={i} className={c.ok ? undefined : 'mismatch'}>
                    <th scope="row">{c.label}</th>
                    <td>
                      {c.foundDetail !== undefined ? (
                        <StatValue check={c} />
                      ) : c.ok ? (
                        <Value text={c.found} />
                      ) : (
                        <>
                          <s>
                            <Value text={c.found} />
                          </s>
                          <span className="team-check-expected">{c.expected || 'nothing'}</span>
                        </>
                      )}
                      {c.note && (
                        <span className="team-check-note" role="img" aria-label={c.note} title={c.note}>
                          <CircleAlert size={16} aria-hidden="true" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </>
  )
}

function Value({ text }: { text: string }) {
  return text || <span className="team-check-blank">-</span>
}

/**
 * A stat's points, with the nature's + or −, then the stat itself, each in a column of its own
 * so they line up from row to row. Whichever is wrong is struck through with the paste's value
 * beside it.
 */
function StatValue({ check: c }: { check: Check }) {
  const pointsOk = c.found === c.expected && c.foundNature === c.expectedNature
  const totalOk = c.foundDetail === c.expectedDetail
  return (
    <>
      <span className="team-check-stat-points">
        <Struck when={!pointsOk}>
          <span className="team-check-number">{c.found}</span>
          <span className="team-check-nature">{c.foundNature}</span>
        </Struck>
        {!pointsOk && (
          <span className="team-check-expected">
            {c.expected}
            {c.expectedNature}
          </span>
        )}
      </span>
      <Struck when={!totalOk}>
        <span className="team-check-number team-check-total">{c.foundDetail}</span>
      </Struck>
      {!totalOk && <span className="team-check-expected">{c.expectedDetail}</span>}
    </>
  )
}

function Struck({ when, children }: { when: boolean; children: ReactNode }) {
  return when ? <s>{children}</s> : children
}
