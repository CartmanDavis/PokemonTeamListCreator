import { createWorker, PSM } from 'tesseract.js'
import { encodePng } from './decode'
import type { RgbaImage } from './image'
import type { TextReader } from './read'

export interface OcrSession {
  readText: TextReader
  close: () => Promise<void>
}

// Tesseract decodes the PNG itself, so no canvas is involved (see decode.ts for why that matters).
const toPngBlob = (image: RgbaImage) => new Blob([encodePng(image)], { type: 'image/png' })

/**
 * Starts Tesseract for reading single lines of English text. The first use downloads its
 * engine and English data (about 10 MB) from a CDN; the browser caches them after that.
 */
export async function startOcr(): Promise<OcrSession> {
  const worker = await createWorker('eng')
  await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_LINE })
  return {
    readText: async (image) => (await worker.recognize(toPngBlob(image))).data.text,
    close: async () => {
      await worker.terminate()
    },
  }
}
