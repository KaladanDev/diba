import { describe, it, expect } from 'vitest'
import avatars from '../../../schema/fixtures/avatars.json'
import messages from '../../../schema/fixtures/messages.json'
import numbers from '../../../schema/fixtures/numbers.json'
import rules from '../../../schema/fixtures/rules.json'
import { hueOf, initials } from './blocks/common'
import { formatNumber } from './format'
import { EMAIL, WEB_URL, dibaMessages } from './messages'

/**
 * The fixtures both platforms test against: Diba's message
 * table, its email and URL rules, and what a number prints as. The Flutter
 * renderer's `fixtures_test.dart` holds its side to the same files, so a
 * message or a price cannot read differently on the two.
 */
describe('the message table', () => {
  it('is exactly fixtures/messages.json', () => {
    expect(dibaMessages).toEqual(messages.messages)
  })
})

describe("Diba's email and URL rules", () => {
  const sets = [
    ['email', EMAIL, rules.email],
    ['url', WEB_URL, rules.url],
  ] as const

  for (const [name, rule, fixture] of sets) {
    it(`${name} is the fixture's pattern`, () => {
      expect(rule.source).toBe(new RegExp(fixture.pattern, fixture.flags).source)
      expect(rule.flags).toBe(fixture.flags)
    })
    it.each(fixture.valid)(`${name} takes %s`, (value) => expect(rule.test(value)).toBe(true))
    it.each(fixture.invalid)(`${name} refuses %s`, (value) => expect(rule.test(value)).toBe(false))
  }
})

describe('numbers print as the fixture says', () => {
  type Case = {
    value: number
    locale: string
    style: 'decimal' | 'percent' | 'currency'
    currency?: string
    maximumFractionDigits?: number
    expected: string
  }
  it.each(numbers.cases as Case[])('$value $style $currency in $locale', (c) => {
    expect(
      formatNumber(c.value, c.locale, {
        style: c.style,
        currency: c.currency,
        maximumFractionDigits: c.maximumFractionDigits,
      }),
    ).toBe(c.expected)
  })
})

describe("an avatar's initials and hue are the fixture's", () => {
  it.each(avatars.cases)('"$name"', (c) => {
    expect(initials(c.name)).toBe(c.initials)
    expect(c.name.trim() ? hueOf(c.name.trim()) : null).toBe(c.hue)
  })
})
