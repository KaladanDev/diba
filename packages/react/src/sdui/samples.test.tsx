import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import type { DibaNode } from '@kaladan/diba-schema'
import { DibaProvider } from '../provider/DibaProvider'
import { DibaSurface } from './Surface'
import samples from '../../../schema/fixtures/samples.json'

/**
 * Every sample tree in the Flutter gallery, drawn by the web renderer.
 *
 * The same trees the schema's tests validate and the Flutter gallery draws
 * (`packages/schema/fixtures/samples.json`), so all three answer to one set of
 * trees. A sample that draws with a refusal is a block the web cannot render
 * as the contract says, and one that logs an error is a block React rejected.
 */
type Sample = { id: string; tree: unknown }
type Group = { id: string; samples: Sample[] }
const fixture = samples as Record<'fa' | 'en', Group[]>

let errors: string[] = []
beforeEach(() => {
  errors = []
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    errors.push(args.map(String).join(' '))
  })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('every gallery sample draws on the web', () => {
  for (const lang of ['fa', 'en'] as const) {
    for (const group of fixture[lang]) {
      for (const sample of group.samples) {
        it(`${lang} · ${group.id} · ${sample.id}`, () => {
          const refused: string[] = []
          const { container } = render(
            <DibaProvider
              ownsDocument={false}
              locale={lang === 'fa' ? 'fa-IR' : 'en-US'}
              dir={lang === 'fa' ? 'rtl' : 'ltr'}
            >
              <DibaSurface tree={sample.tree as DibaNode} onRefuse={(r) => refused.push(r)} />
            </DibaProvider>,
          )
          expect(refused).toEqual([])
          expect(errors).toEqual([])
          expect(container.textContent?.length ?? 0).toBeGreaterThan(0)
        })
      }
    }
  }
})
