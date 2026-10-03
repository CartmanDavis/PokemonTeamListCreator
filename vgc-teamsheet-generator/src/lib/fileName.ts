import type { SheetKind } from './types'

const SHEET_LABELS: Record<SheetKind, string> = {
  open: 'Open Team List',
  close: 'Staff Team List',
}

/** Characters that aren't allowed in file names on some systems. */
// Control characters are matched on purpose: they're invalid in file names.
// oxlint-disable-next-line no-control-regex
const UNSAFE_CHARACTERS = /[\\/:*?"<>|\u0000-\u001f]/g

function sanitize(part: string): string {
  return part
    .replace(UNSAFE_CHARACTERS, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/, '')
    .slice(0, 60)
    .trim()
}

/** Local date as YYYY-MM-DD. */
function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * e.g. "Ash Ketchum - BT 3 - Open Team List - 2026-10-02.pdf".
 * Blank parts are left out; with no player or team name it starts with "VGC".
 */
export function teamsheetFileName(playerName: string, teamName: string, sheets: SheetKind[], date = new Date()): string {
  const sheetLabel = sheets.length === 1 ? SHEET_LABELS[sheets[0]] : 'Team List'
  const names = [sanitize(playerName), sanitize(teamName)].filter(Boolean)
  const parts = names.length > 0 ? [...names, sheetLabel] : [`VGC ${sheetLabel}`]
  return `${[...parts, formatDate(date)].join(' - ')}.pdf`
}
