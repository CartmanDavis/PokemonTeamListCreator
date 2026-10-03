import { describe, expect, it } from 'vitest'
import { movesScreenshot, statsScreen, statsScreenshot } from '../../test/fixtures/champions/team'
import { STAT_IDS } from '../stats'
import digitTemplates from './digitTemplates.json'
import { learnDigitTemplates, readNumber } from './digits'
import { crop, regionRect } from './image'
import { STAT_POINTS, STAT_VALUES } from './layout'
import { findPanels } from './panels'

const image = statsScreenshot()
const panels = findPanels(image)!
const examples = panels.flatMap((panel, slot) =>
  STAT_IDS.flatMap((stat, i) => [
    { image: crop(image, regionRect(panel, STAT_VALUES[i])), value: statsScreen[slot].stats[stat]! },
    { image: crop(image, regionRect(panel, STAT_POINTS[i])), value: statsScreen[slot].points[stat]! },
  ]),
)

describe('digit templates', () => {
  // Regenerate with `pnpm test -u` after changing the layout or digit reader.
  it('are learned from the stats fixture', async () => {
    await expect(JSON.stringify(learnDigitTemplates(examples))).toMatchFileSnapshot('./digitTemplates.json')
  })
})

describe('readNumber', () => {
  it('reads every stat and stat point in the fixture', () => {
    expect(examples.map((e) => readNumber(e.image, digitTemplates))).toEqual(examples.map((e) => e.value))
  })

  it('returns undefined when there are no digits', () => {
    const panel = findPanels(movesScreenshot())![0]
    // On the moves screen, the stat point column is empty panel background.
    expect(readNumber(crop(movesScreenshot(), regionRect(panel, STAT_POINTS[0])), digitTemplates)).toBeUndefined()
  })
})
