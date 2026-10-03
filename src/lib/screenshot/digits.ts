import { isTextPixel, type RgbaImage } from './image'

// The stat numbers use one game font and only the digits 0-9, so they're read by comparing each
// digit to an averaged example of every digit. Tesseract misread several of them.

const GLYPH_W = 12
const GLYPH_H = 18
/** How much a difference in width-to-height ratio counts against a match, compared to pixels. */
const ASPECT_WEIGHT = 40

interface Glyph {
  /** GLYPH_W × GLYPH_H coverage values from 0 to 1, scaled to the glyph's height and centred. */
  pixels: number[]
  aspect: number
}

export type DigitTemplates = Record<string, Glyph>

/** Splits the text in an image into digits at the empty columns between them. */
function glyphs(image: RgbaImage): Glyph[] {
  const { width, height, data } = image
  const text = (x: number, y: number) => isTextPixel(data, (y * width + x) * 4)
  const columnHasText = (x: number) => {
    for (let y = 0; y < height; y++) if (text(x, y)) return true
    return false
  }

  // All digits share a height, so use the text's overall top and bottom.
  let top = height
  let bottom = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (text(x, y)) {
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
      }
    }
  }
  const textHeight = bottom - top + 1

  const found: Glyph[] = []
  for (let x = 0; x < width; ) {
    if (!columnHasText(x)) {
      x++
      continue
    }
    const start = x
    while (x < width && columnHasText(x)) x++
    if (textHeight < height * 0.25) continue // Stray specks, not digits.

    const glyphWidth = x - start
    const scale = GLYPH_H / textHeight
    const offset = (GLYPH_W - glyphWidth * scale) / 2
    const pixels = new Array<number>(GLYPH_W * GLYPH_H).fill(0)
    for (let gy = 0; gy < GLYPH_H; gy++) {
      for (let gx = 0; gx < GLYPH_W; gx++) {
        const sx = Math.floor((gx - offset) / scale)
        const sy = Math.floor(gy / scale)
        if (sx >= 0 && sx < glyphWidth && sy < textHeight && text(start + sx, top + sy)) pixels[gy * GLYPH_W + gx] = 1
      }
    }
    found.push({ pixels, aspect: glyphWidth / textHeight })
  }
  return found
}

function distance(a: Glyph, b: Glyph): number {
  let d = Math.abs(a.aspect - b.aspect) * ASPECT_WEIGHT
  for (let i = 0; i < a.pixels.length; i++) d += Math.abs(a.pixels[i] - b.pixels[i])
  return d
}

/** Reads a whole number from a crop holding only that number, or undefined if there's none. */
export function readNumber(image: RgbaImage, templates: DigitTemplates): number | undefined {
  const digits = glyphs(image).map((glyph) => {
    let best = ''
    let bestDistance = Infinity
    for (const [digit, template] of Object.entries(templates)) {
      const d = distance(glyph, template)
      if (d < bestDistance) {
        best = digit
        bestDistance = d
      }
    }
    return best
  })
  return digits.length > 0 ? Number(digits.join('')) : undefined
}

/** Averages labelled examples into one template per digit. Used to build digitTemplates.json. */
export function learnDigitTemplates(examples: { image: RgbaImage; value: number }[]): DigitTemplates {
  const samples: Record<string, Glyph[]> = {}
  for (const { image, value } of examples) {
    const found = glyphs(image)
    const digits = String(value)
    if (found.length !== digits.length) {
      throw new Error(`Found ${found.length} digits where ${value} was expected`)
    }
    found.forEach((glyph, i) => (samples[digits[i]] ??= []).push(glyph))
  }

  const round = (n: number) => Math.round(n * 100) / 100
  const templates: DigitTemplates = {}
  for (const digit of Object.keys(samples).sort()) {
    const group = samples[digit]
    const mean = (values: number[]) => round(values.reduce((sum, v) => sum + v, 0) / values.length)
    templates[digit] = {
      pixels: group[0].pixels.map((_, i) => mean(group.map((g) => g.pixels[i]))),
      aspect: mean(group.map((g) => g.aspect)),
    }
  }
  return templates
}
