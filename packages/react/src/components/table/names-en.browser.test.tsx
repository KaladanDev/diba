import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { DibaProvider } from '../../provider/DibaProvider'
import { DibaSurface } from '../../sdui'
import { settled } from '../../test/visual'

/**
 * A block's selection boxes on an English page, in a file of its own: React Aria keeps one set of
 * strings a page, and a Persian page gives it Diba's (DibaProvider's `ariaStrings`).
 */

const cell = (children: string) => ({ type: 'Cell', children })

/** What a screen reader calls an element: its labelling elements' words, or its aria-label. */
function nameOf(el: Element) {
  const by = el.getAttribute('aria-labelledby')
  if (!by) return el.getAttribute('aria-label') ?? ''
  return by
    .split(' ')
    .map((id) => {
      const target = document.getElementById(id)
      return target === el ? (el.getAttribute('aria-label') ?? '') : (target?.textContent ?? '')
    })
    .join(' ')
}

describe('a block’s selection boxes on an English page', () => {
  it('"Select All", and "Select" with the row’s header, never its id', async () => {
    const { container } = render(
      <DibaProvider theme="light" locale="en-US" dir="ltr">
        <DibaSurface
          tree={
            {
              type: 'Table',
              props: { label: 'Orders', selectionMode: 'multiple' },
              children: [
                {
                  type: 'TableHeader',
                  children: [
                    {
                      type: 'Column',
                      props: { id: 'order', isRowHeader: true },
                      children: 'Order',
                    },
                    { type: 'Column', props: { id: 'buyer' }, children: 'Buyer' },
                  ],
                },
                {
                  type: 'TableBody',
                  children: [
                    {
                      type: 'Row',
                      props: { id: '7c2e91a4-0b5d-4f1e-9a63-2d8f5c1e0b47' },
                      children: [cell('#1041'), cell('Niloufar Rostami')],
                    },
                  ],
                },
              ],
            } as never
          }
        />
      </DibaProvider>,
    )
    await settled(100)
    const [head, first] = [...container.querySelectorAll('input[type="checkbox"]')]
    expect(nameOf(head!)).toBe('Select All')
    expect(nameOf(first!)).toBe('Select #1041')
    expect(nameOf(first!)).not.toMatch(/7c2e91a4/)
  })
})
