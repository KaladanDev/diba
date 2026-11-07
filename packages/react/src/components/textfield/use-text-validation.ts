'use client'

/*
 * Kaladan's: what a text, search or number field, or a group of checkboxes, says of a value its
 * own checks refuse, in the page's language. React Aria shows the browser's messages, in the browser's language whatever
 * the page's: a Persian page in an English browser said "Please fill out this field." These are a
 * tree's fields' words, checked by the same rules: required, the fewest and most letters as a
 * reader counts them, Diba's email and web-address rules, and a pattern.
 *
 * They go to React Aria as the field's `validate`, which it reads before the browser's own, and
 * so stop a form as those did; a `validate` of the caller's still goes first. A field that shows
 * what is wrong at once (validationBehavior "aria") checks nothing built in, so neither do these:
 * an empty required field there says nothing until its caller does.
 */
import { FormContext, useLocale, useSlottedContext } from 'react-aria-components'

import { useDibaStrings } from '../../i18n/strings'
import { EMAIL, WEB_URL, graphemes } from '../../utils/rules'

type Result = string | string[] | true | null | undefined

/** Whether a check found something wrong. */
const failed = (result: Result) =>
  result != null && result !== true && (Array.isArray(result) ? result.length > 0 : result !== '')

interface Checks<V> {
  isRequired?: boolean
  validationBehavior?: 'native' | 'aria'
  validate?: (value: V) => Result
}

interface TextChecks extends Checks<string> {
  minLength?: number
  maxLength?: number
  type?: string
  pattern?: string
}

/** Whether the field checks what the browser would: its own behaviour, or its form's. */
function useNative(own?: 'native' | 'aria') {
  const form = useSlottedContext(FormContext) as { validationBehavior?: 'native' | 'aria' } | null

  return (own ?? form?.validationBehavior ?? 'native') === 'native'
}

/** A pattern as the browser reads it: the whole value, Unicode-aware. */
function matches(pattern: string, value: string) {
  try {
    return new RegExp(`^(?:${pattern})$`, 'v').test(value)
  } catch {
    try {
      return new RegExp(`^(?:${pattern})$`, 'u').test(value)
    } catch {
      return true
    }
  }
}

/** A TextField's or a SearchField's `validate`. */
export function useTextValidate(checks: TextChecks) {
  const t = useDibaStrings()
  const { locale } = useLocale()
  const native = useNative(checks.validationBehavior)
  const count = (n: number) => new Intl.NumberFormat(locale).format(n)

  return (value: string): Result => {
    const own = checks.validate?.(value)

    if (failed(own) || !native) return own
    if (value === '') return checks.isRequired ? t.required : own
    if (checks.minLength != null && graphemes(value) < checks.minLength)
      return t.tooShort(count(checks.minLength))
    if (checks.maxLength != null && graphemes(value) > checks.maxLength)
      return t.tooLong(count(checks.maxLength))
    if (checks.type === 'email' && !EMAIL.test(value)) return t.invalidEmail
    if (checks.type === 'url' && !WEB_URL.test(value)) return t.invalidUrl
    if (checks.pattern && !matches(checks.pattern, value)) return t.patternMismatch

    return own
  }
}

/**
 * A CheckboxGroup's `validate`: none on in a required one. The browser said "Please check this box
 * if you want to proceed." even of a group; it says «دست‌کم یکی را انتخاب کنید.», as a tree's does.
 * A lone checkbox, a switch or a radio group says the browser's own "required" in FieldError, in
 * Diba's words (field-error.tsx).
 */
export function useChoiceValidate<V>(
  checks: Checks<V>,
  isEmpty: (value: V) => boolean,
  word: 'required' | 'chooseOne' = 'required',
) {
  const t = useDibaStrings()
  const native = useNative(checks.validationBehavior)

  return (value: V): Result => {
    const own = checks.validate?.(value)

    if (failed(own) || !native) return own
    if (checks.isRequired && isEmpty(value)) return t[word]

    return own
  }
}

/** A NumberField's `validate`: a required field with no number. */
export function useNumberValidate(checks: Checks<number>) {
  const t = useDibaStrings()
  const native = useNative(checks.validationBehavior)

  return (value: number): Result => {
    const own = checks.validate?.(value)

    if (failed(own) || !native) return own
    if (checks.isRequired && (value == null || Number.isNaN(value))) return t.required

    return own
  }
}
