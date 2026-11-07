/**
 * Persian and Arabic-Indic digits mapped onto the Latin ones.
 *
 * An Iranian bank or courier sends its code in Persian numerals, and a phone
 * offering that code back to the field would otherwise be rejected by a
 * `0-9` filter — the one case this component exists for, failing on the one
 * script it was built for.
 */
const DIGITS: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
}

/** Latin digits only, whatever script they arrived in. */
export function toLatinDigits(text: string): string {
  return text.replace(/[۰-۹٠-٩]/g, (d) => DIGITS[d] ?? d)
}

/** Each numbering system's digits, zero to nine: Latin, Persian, Arabic-Indic. */
const SYSTEMS: Record<string, string> = {
  latn: '0123456789',
  arabext: '۰۱۲۳۴۵۶۷۸۹',
  arab: '٠١٢٣٤٥٦٧٨٩',
}

/** The numbering system a locale writes numbers in: `arabext` for Persian, `latn` for English. */
export function numberingSystemOf(locale: string): string {
  return new Intl.NumberFormat(locale).resolvedOptions().numberingSystem
}

/**
 * Text with its digits in [system]'s, whichever were typed; a system without a table here leaves
 * it as it is. With [separators], a number's decimal and group marks follow too: `.` and `,` for
 * Latin, `٫` and `٬` for the others.
 */
export function toDigitsOf(system: string, text: string, separators = false): string {
  const digits = SYSTEMS[system]
  if (!digits) return text
  let out = toLatinDigits(text).replace(/[0-9]/g, (d) => digits[Number(d)]!)
  if (separators) {
    out =
      system === 'latn'
        ? out.replace(/٫/g, '.').replace(/٬/g, ',')
        : out.replace(/\./g, '٫').replace(/,/g, '٬')
  }
  return out
}
