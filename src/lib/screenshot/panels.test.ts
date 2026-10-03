import { describe, expect, it } from 'vitest'
import { movesScreenshot, statsScreenshot } from '../../test/fixtures/champions/team'
import { findPanels } from './panels'

describe('findPanels', () => {
  it('finds the six team panels in slot order', () => {
    const panels = findPanels(movesScreenshot())!
    expect(panels).toHaveLength(6)
    // Two columns, three rows.
    expect(new Set(panels.map((p) => p.x)).size).toBe(2)
    expect(panels[0].x).toBeLessThan(panels[1].x)
    expect(panels[0].y).toBe(panels[1].y)
    expect(panels[0].y).toBeLessThan(panels[2].y)
    expect(panels[2].y).toBeLessThan(panels[4].y)
  })

  it('finds the same panels on both screens', () => {
    expect(findPanels(statsScreenshot())).toEqual(findPanels(movesScreenshot()))
  })

  it('returns undefined for an image without team panels', () => {
    const blank = { data: new Uint8ClampedArray(400 * 300 * 4).fill(255), width: 400, height: 300 }
    expect(findPanels(blank)).toBeUndefined()
  })
})
