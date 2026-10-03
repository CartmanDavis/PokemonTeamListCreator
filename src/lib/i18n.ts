import translators from '../data/translators.json'
import type { Lang } from './types'

export type Category = 'pokes' | 'abilities' | 'items' | 'moves' | 'types' | 'natures'

type Table = Record<string, string | undefined>

export type Translations = Record<Category, Table>

/** Maps English Showdown names to the language-neutral ids used by the translation tables. */
const idTables: Record<Category, Table> = translators

const loaders = import.meta.glob<Translations>('../data/i18n/*.json', { import: 'default' })

export function loadTranslations(lang: Lang): Promise<Translations> {
  return loaders[`../data/i18n/${lang}.json`]()
}

/** Translates an English Showdown name, or returns undefined when it isn't known. */
export function translate(translations: Translations, category: Category, englishName: string): string | undefined {
  const id = idTables[category][englishName]
  return id === undefined ? undefined : translations[category][id]
}
