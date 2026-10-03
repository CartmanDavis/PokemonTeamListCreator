import { readFileSync } from 'node:fs'
import { decodeImage } from '../lib/screenshot/decode'
import type { RgbaImage } from '../lib/screenshot/image'

export const readPng = (path: string): RgbaImage => decodeImage(readFileSync(path))
