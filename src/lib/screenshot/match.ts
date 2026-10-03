/** Lowercased, with spaces and punctuation removed, so "Sp. Atk" and "spatk" compare equal. */
export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    previous = current
  }
  return previous[b.length]
}

/** Whether OCR text plausibly reads as `name`, allowing about one misread letter in five. */
export function looksLike(text: string, name: string): boolean {
  const a = normalizeName(text)
  const b = normalizeName(name)
  return editDistance(a, b) <= Math.floor(b.length / 5)
}

/**
 * The name in `names` that OCR text is closest to, or undefined when none is close enough
 * to be a likely misreading.
 */
export function closestName(text: string, names: Iterable<string>): string | undefined {
  const target = normalizeName(text)
  if (!target) return undefined
  let best: string | undefined
  let bestDistance = Infinity
  for (const name of names) {
    const d = editDistance(target, normalizeName(name))
    if (d < bestDistance) {
      best = name
      bestDistance = d
    }
  }
  return best !== undefined && bestDistance <= Math.max(1, Math.floor(target.length / 4)) ? best : undefined
}
