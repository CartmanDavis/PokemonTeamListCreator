const cache = new Map<string, Promise<string>>()

/** Fetches a font file and returns it base64-encoded, as jsPDF's virtual file system expects. */
export function loadFont(url: string): Promise<string> {
  let font = cache.get(url)
  if (!font) {
    font = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load font ${url}: ${response.status}`)
        return response.arrayBuffer()
      })
      .then(toBase64)
    // Don't cache failures so a later attempt can retry.
    font.catch(() => cache.delete(url))
    cache.set(url, font)
  }
  return font
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}
