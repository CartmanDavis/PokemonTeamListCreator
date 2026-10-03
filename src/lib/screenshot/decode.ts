import { convertIndexedToRgb, decode as decodePngFile, encode as encodePngFile, hasPngSignature } from 'fast-png'
import { decode as decodeJpegFile } from 'jpeg-js'
import { ScreenshotError } from '../errors'
import type { RgbaImage } from './image'

// Images are decoded and encoded in plain JavaScript rather than through a canvas, since
// privacy-focused browsers (LibreWolf, Firefox with resistFingerprinting, Brave) hand pages
// fake pixels when they read a canvas.

/** Decodes a PNG (iPhone and Android screenshots) or JPEG (Switch screenshots) file. */
export function decodeImage(bytes: Uint8Array): RgbaImage {
  if (hasPngSignature(bytes)) return decodePng(bytes)
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    const { data, width, height } = decodeJpegFile(bytes, { useTArray: true, formatAsRGBA: true })
    return { data, width, height }
  }
  throw new ScreenshotError("Screenshots need to be PNG or JPEG images. Other formats, like HEIC, can't be read yet.")
}

function decodePng(bytes: Uint8Array): RgbaImage {
  const png = decodePngFile(bytes)
  const { width, height } = png
  const channels = png.palette ? png.palette[0].length : png.channels
  const source = png.palette ? convertIndexedToRgb(png) : png.data
  // 16-bit images keep the high byte of each value.
  const shift = png.depth === 16 ? 8 : 0
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    const value = (c: number) => source[i * channels + c] >> shift
    const grey = channels < 3
    data[i * 4] = value(0)
    data[i * 4 + 1] = grey ? value(0) : value(1)
    data[i * 4 + 2] = grey ? value(0) : value(2)
    data[i * 4 + 3] = channels === 2 || channels === 4 ? value(channels - 1) : 255
  }
  return { data, width, height }
}

export function encodePng({ data, width, height }: RgbaImage): Uint8Array<ArrayBuffer> {
  // Copied into a plain ArrayBuffer, which Blob requires.
  return new Uint8Array(encodePngFile({ data: Uint8Array.from(data), width, height, channels: 4, depth: 8 }))
}
