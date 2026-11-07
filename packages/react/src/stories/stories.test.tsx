/// <reference types="vite/client" />
import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { composeStories } from '@storybook/react-vite'
import type { Meta } from '@storybook/react-vite'
import { DibaProvider } from '../provider/DibaProvider'

/**
 * Every story in Storybook's sections draws, in Persian and in English,
 * without a React warning: a story is what a reader copies, so one that warns teaches the warning.
 * Storybook's own build only proves they compile.
 */

type Stories = { default: Meta } & Record<string, unknown>
const files = import.meta.glob<Stories>(
  [
    '../components/**/*.stories.tsx',
    '../patterns/**/*.stories.tsx',
    '../foundations/**/*.stories.tsx',
    '../sdui/**/*.stories.tsx',
  ],
  { eager: true },
)
const sections = Object.entries(files).filter(([, file]) =>
  /^(Components|Patterns|Foundations|SDUI)\//.test(String(file.default?.title ?? '')),
)

afterEach(cleanup)

describe.each(sections)('%s', (_, file) => {
  const composed = Object.entries(composeStories(file as never)) as [string, React.FC][]
  for (const [name, Story] of composed) {
    for (const locale of ['fa-IR', 'en-US'] as const) {
      it(`${name} draws in ${locale} without a warning`, () => {
        const warn = vi.spyOn(console, 'error').mockImplementation(() => {})
        const { container } = render(
          <DibaProvider
            locale={locale}
            dir={locale === 'fa-IR' ? 'rtl' : 'ltr'}
            ownsDocument={false}
          >
            <Story />
          </DibaProvider>,
        )
        expect(container.textContent?.trim()).not.toBe('')
        expect(warn.mock.calls.map((c) => String(c[0]).slice(0, 160))).toEqual([])
      })
    }
  }
})
