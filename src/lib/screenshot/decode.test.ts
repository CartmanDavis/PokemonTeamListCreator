import { encode as encodeJpeg } from 'jpeg-js'
import { describe, expect, it } from 'vitest'
import { statsScreen, statsScreenshot } from '../../test/fixtures/champions/team'
import { ScreenshotError } from '../errors'
import { decodeImage, encodePng } from './decode'
import { readTeamScreenshot } from './read'

describe('decodeImage', () => {
  it('round-trips a PNG', () => {
    const image = { data: new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 128]), width: 2, height: 1 }
    expect(decodeImage(encodePng(image))).toEqual(image)
  })

  it('reads JPEG screenshots, like the Switch saves', async () => {
    const jpeg = encodeJpeg({ ...statsScreenshot() }, 90).data
    const result = await readTeamScreenshot(decodeImage(jpeg), async () => '')
    expect(result.pokemon).toEqual(statsScreen.map((poke) => ({ ...poke, name: '' })))
  })

  it('rejects other formats', () => {
    expect(() => decodeImage(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toThrow(ScreenshotError)
  })
})
