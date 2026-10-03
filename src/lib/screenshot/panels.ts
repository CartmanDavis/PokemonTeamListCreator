import type { Rect, RgbaImage } from './image'

const TEAM_SIZE = 6

/** Rows of the mask the panel search works on; screenshots are shrunk to about this height first. */
const SEARCH_HEIGHT = 400

/**
 * Finds the six purple team panels, in slot order (left to right, top to bottom).
 *
 * The screen around the panels changes with the device's aspect ratio, so everything else is
 * located relative to these panels rather than to the screenshot. Returns undefined when the
 * screenshot doesn't look like a team screen.
 */
export function findPanels(image: RgbaImage): Rect[] | undefined {
  const step = Math.max(1, Math.round(image.height / SEARCH_HEIGHT))
  const w = Math.floor(image.width / step)
  const h = Math.floor(image.height / step)
  const purple = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * step * image.width + x * step) * 4
      const [r, g, b] = [image.data[i], image.data[i + 1], image.data[i + 2]]
      purple[y * w + x] = b > r + 30 && b > g + 40 ? 1 : 0
    }
  }

  // Bounding boxes of the connected purple areas, found with a flood fill.
  const visited = new Uint8Array(w * h)
  const areas: (Rect & { size: number })[] = []
  for (let start = 0; start < w * h; start++) {
    if (!purple[start] || visited[start]) continue
    let [minX, minY, maxX, maxY, size] = [w, h, 0, 0, 0]
    const stack = [start]
    visited[start] = 1
    while (stack.length > 0) {
      const p = stack.pop()!
      const x = p % w
      const y = (p - x) / w
      size++
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
      const neighbours = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]
      for (const q of neighbours) {
        if (q >= 0 && q < w * h && purple[q] && !visited[q]) {
          visited[q] = 1
          stack.push(q)
        }
      }
    }
    areas.push({
      x: minX * step,
      y: minY * step,
      w: (maxX - minX + 1) * step,
      h: (maxY - minY + 1) * step,
      size,
    })
  }

  const panels = areas.sort((a, b) => b.size - a.size).slice(0, TEAM_SIZE)
  if (panels.length < TEAM_SIZE) return undefined
  // The panels are all the same size, and wider than they are tall.
  const { w: panelW, h: panelH } = panels[0]
  const similar = panels.every((p) => Math.abs(p.w - panelW) < panelW * 0.05 && Math.abs(p.h - panelH) < panelH * 0.05)
  if (!similar || panelW < panelH * 2 || panelH < image.height * 0.05) return undefined

  const top = Math.min(...panels.map((p) => p.y))
  const left = Math.min(...panels.map((p) => p.x))
  const slot = (p: Rect) => Math.round((p.y - top) / panelH) * 2 + Math.round((p.x - left) / panelW)
  return panels.sort((a, b) => slot(a) - slot(b)).map(({ x, y, w, h }) => ({ x, y, w, h }))
}
