import { describe, expect, it } from 'vitest'
import { teamsheetFileName } from './fileName'

// Late in the evening, so a UTC-based date would roll over to the next day.
const date = new Date(2026, 9, 2, 23, 30)

describe('teamsheetFileName', () => {
  it.each([
    [['open', 'close'], 'Ash Ketchum - BT 3 - Team List - 2026-10-02.pdf'],
    [['open'], 'Ash Ketchum - BT 3 - Open Team List - 2026-10-02.pdf'],
    [['close'], 'Ash Ketchum - BT 3 - Staff Team List - 2026-10-02.pdf'],
  ] as const)('names %j sheets', (sheets, expected) => {
    expect(teamsheetFileName('Ash Ketchum', 'BT 3', [...sheets], date)).toBe(expected)
  })

  it('leaves out blank parts', () => {
    expect(teamsheetFileName('Ash Ketchum', '', ['open', 'close'], date)).toBe('Ash Ketchum - Team List - 2026-10-02.pdf')
    expect(teamsheetFileName('', 'BT 3', ['open'], date)).toBe('BT 3 - Open Team List - 2026-10-02.pdf')
  })

  it('falls back to a generic name when there is no player or team name', () => {
    expect(teamsheetFileName('', '  ', ['open', 'close'], date)).toBe('VGC Team List - 2026-10-02.pdf')
    expect(teamsheetFileName('', '', ['close'], date)).toBe('VGC Staff Team List - 2026-10-02.pdf')
  })

  it('strips characters that are invalid in file names', () => {
    expect(teamsheetFileName('Ash/Ketchum: "Pro"?', 'Rain*Team|1.', ['open'], date)).toBe(
      'AshKetchum Pro - RainTeam1 - Open Team List - 2026-10-02.pdf',
    )
  })

  it('keeps non-Latin names', () => {
    expect(teamsheetFileName('ガオガエン 使い', '雨', ['open', 'close'], date)).toBe('ガオガエン 使い - 雨 - Team List - 2026-10-02.pdf')
  })
})
