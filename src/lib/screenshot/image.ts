/** Raw RGBA pixels, as in the browser's ImageData. */
export interface RgbaImage {
  data: Uint8ClampedArray | Uint8Array
  width: number
  height: number
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** A part of a team panel, as fractions of the panel's size: [left, top, right, bottom]. */
export type Region = readonly [number, number, number, number]

export function regionRect(panel: Rect, [left, top, right, bottom]: Region): Rect {
  return {
    x: Math.round(panel.x + left * panel.w),
    y: Math.round(panel.y + top * panel.h),
    w: Math.round((right - left) * panel.w),
    h: Math.round((bottom - top) * panel.h),
  }
}

export function crop(image: RgbaImage, { x, y, w, h }: Rect): RgbaImage {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let row = 0; row < h; row++) {
    const start = ((y + row) * image.width + x) * 4
    data.set(image.data.subarray(start, start + w * 4), row * w * 4)
  }
  return { data, width: w, height: h }
}

/** The in-game text is near-white, unlike the purple panels, stat bars and icons behind it. */
export function isTextPixel(data: RgbaImage['data'], i: number): boolean {
  return Math.min(data[i], data[i + 1], data[i + 2]) > 185
}

/** True for strongly coloured pixels, like type and gender icons (the panel purple is too grey to count). */
export function isSaturatedPixel(data: RgbaImage['data'], i: number): boolean {
  const max = Math.max(data[i], data[i + 1], data[i + 2])
  const min = Math.min(data[i], data[i + 1], data[i + 2])
  return max > 120 && (max - min) / max > 0.6
}
