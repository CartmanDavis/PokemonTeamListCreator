import { describe, expect, it } from 'vitest'
import { loadTranslations, translate } from './i18n'

describe('translate', () => {
  it('translates Showdown names into the chosen language', async () => {
    const jpn = await loadTranslations('Jpn')
    expect(translate(jpn, 'pokes', 'Incineroar')).toBe('ガオガエン')
    expect(translate(jpn, 'moves', 'Fake Out')).toBe('ねこだまし')

    const en = await loadTranslations('En')
    expect(translate(en, 'items', 'Sitrus Berry')).toBe('Sitrus Berry')
  })

  it('returns undefined for unknown names', async () => {
    const en = await loadTranslations('En')
    expect(translate(en, 'moves', 'Fake Punch')).toBeUndefined()
  })
})
