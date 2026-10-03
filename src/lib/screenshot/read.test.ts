import { describe, expect, it } from 'vitest'
import { movesScreenshot, statsScreen, statsScreenshot } from '../../test/fixtures/champions/team'
import { ScreenshotError } from '../errors'
import { readTeamScreenshot } from './read'

const noText = async () => ''

describe('readTeamScreenshot', () => {
  it('reads stats, stat points and nature arrows from the stats screen', async () => {
    const result = await readTeamScreenshot(statsScreenshot(), noText)
    expect(result.kind).toBe('stats')
    expect(result.pokemon).toEqual(statsScreen.map((poke) => ({ ...poke, name: '' })))
  })

  it('recognises the moves screen', async () => {
    const result = await readTeamScreenshot(movesScreenshot(), noText)
    expect(result.kind).toBe('moves')
    expect(result.pokemon).toHaveLength(6)
  })

  it('snaps misread text to the nearest known name', async () => {
    const result = await readTeamScreenshot(movesScreenshot(), async () => 'Protcct')
    expect(result.kind === 'moves' && result.pokemon[0].moves).toEqual(['Protect', 'Protect', 'Protect', 'Protect'])
  })

  it('rejects screenshots without team panels', async () => {
    const blank = { data: new Uint8ClampedArray(400 * 300 * 4).fill(255), width: 400, height: 300 }
    await expect(readTeamScreenshot(blank, noText)).rejects.toThrow(ScreenshotError)
  })
})
