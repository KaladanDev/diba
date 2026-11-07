import { dibaMessages, isPersian } from './messages'

export type FormatStyle = 'decimal' | 'percent' | 'currency'

export interface FormatOptions {
  style?: FormatStyle
  currency?: string
  maximumFractionDigits?: number
}

const isToman = (o: FormatOptions) =>
  o.style === 'currency' && (o.currency === 'IRT' || o.currency === 'TOMAN')

/**
 * The `Intl.NumberFormat` options for a block's `formatStyle` and `currency`,
 * for a React Aria field that formats as it is typed into. Toman has no ISO
 * code, so a toman field formats as a whole number and its word is drawn
 * beside it.
 */
export function numberFormatOptions(o: FormatOptions): Intl.NumberFormatOptions {
  if (isToman(o)) return { maximumFractionDigits: 0 }
  const out: Intl.NumberFormatOptions = {}
  if (o.style === 'percent') out.style = 'percent'
  if (o.style === 'currency' && o.currency) {
    out.style = 'currency'
    out.currency = o.currency
  }
  if (o.maximumFractionDigits !== undefined) out.maximumFractionDigits = o.maximumFractionDigits
  return out
}

/**
 * A figure as NumberField, Slider and ProgressBar show it, the same on both
 * platforms: `packages/schema/fixtures/numbers.json` holds what each must
 * print.
 *
 * `percent` takes a fraction, 0.15 for 15%. `IRT` is the toman: the
 * amount in whole numbers, a space, and the word.
 */
export function formatNumber(value: number, locale: string, o: FormatOptions = {}): string {
  if (isToman(o)) {
    const amount = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
    return `${amount} ${dibaMessages.toman[isPersian(locale) ? 'fa' : 'en']}`
  }
  return new Intl.NumberFormat(locale, numberFormatOptions(o)).format(value)
}

/** The toman's word in the reader's language, or null for any other currency. */
export function tomanWord(locale: string, o: FormatOptions): string | null {
  return isToman(o) ? dibaMessages.toman[isPersian(locale) ? 'fa' : 'en'] : null
}
