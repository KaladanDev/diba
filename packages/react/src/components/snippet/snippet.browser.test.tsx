import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DibaProvider } from '../../provider/DibaProvider'
import { Card } from '../card'
import { Snippet } from './Snippet'
import { snippetOptions } from './snippet.styles'
import {
  backgroundBehind,
  box,
  contrast,
  hasHorizontalOverflow,
  settled,
  textContrast,
  toRgb,
} from '../../test/visual'

function show(
  props: Partial<React.ComponentProps<typeof Snippet>> = {},
  dir: 'rtl' | 'ltr' = 'rtl',
  width: number | string = 360,
) {
  return render(
    <DibaProvider locale={dir === 'rtl' ? 'fa-IR' : 'en-US'} dir={dir}>
      <div style={{ width }}>
        <Snippet symbol="$" {...props}>
          {props.children ?? 'npm install @kaladan/diba-react'}
        </Snippet>
      </div>
    </DibaProvider>,
  )
}

const frame = () => document.querySelector<HTMLElement>('[data-slot="snippet"]')!
const code = () => document.querySelector<HTMLElement>('.db-snippet__code')!
const copy = () => screen.getByRole('button')

describe('snippet appearance', () => {
  describe('legibility', () => {
    for (const variant of snippetOptions.variant) {
      it(`${variant}: the command is readable`, async () => {
        const { unmount } = show({ variant })
        await settled(60)
        expect(textContrast(code())).toBeGreaterThanOrEqual(4.5)
        unmount()
      })
    }

    // Flutter's look: the prompt reads as the words do.
    it("the prompt is the words' colour, not dimmed", async () => {
      show()
      await settled(60)
      const symbol = document.querySelector<HTMLElement>('.db-snippet__symbol')!
      expect(getComputedStyle(symbol).opacity).toBe('1')
      expect(getComputedStyle(symbol).color).toBe(getComputedStyle(code()).color)
    })
  })

  describe('the command runs left to right, the copy at the frame’s end', () => {
    /**
     * The whole row left to right on a Persian page too, the words at the left and the copy
     * button at the frame's right edge, its padding in (it had followed the words); the code an LTR run so `npm i` is not reversed.
     */
    for (const dir of ['rtl', 'ltr'] as const) {
      it(`the copy button sits at the end, ${dir === 'rtl' ? 'in Persian' : 'in English'}`, async () => {
        show({}, dir)
        await settled(60)
        expect(box(code()).left - box(frame()).left).toBeLessThan(20)
        expect(box(frame()).right - box(copy()).right).toBeCloseTo(12, 0)
        expect(box(copy()).left - (box(code()).left + box(code()).width)).toBeLessThan(1)
        expect(box(frame()).width).toBe(360)
      })
    }

    it('the command itself does not turn round', async () => {
      show({}, 'rtl')
      await settled(60)
      expect(getComputedStyle(code()).direction).toBe('ltr')
    })

    it('and the prompt stays in front of it, not behind', async () => {
      show({}, 'rtl')
      await settled(60)
      const symbol = box(document.querySelector('.db-snippet__symbol')!)
      const line = box(document.querySelector('.db-snippet__line')!)
      // Left-to-right inside its own run: "in front" is the left edge, even on
      // a right-to-left page.
      expect(symbol.left - line.left).toBeLessThan(5)
    })
  })

  describe('a long command', () => {
    const long = 'bun add @kaladan/diba-react @kaladan/diba-tokens @kaladan/diba-schema'

    /**
     * Asserted by actually scrolling it. `scrollWidth > clientWidth` is true of
     * an element that merely overflows, scrollable or not — it reports the
     * overflow either way, so it says nothing about whether anyone can reach
     * the rest of the command.
     */
    it('scrolls, rather than merely overflowing', async () => {
      show({ children: long })
      await settled(60)
      code().scrollLeft = 500
      expect(code().scrollLeft).toBeGreaterThan(0)
    })

    it('and does not stretch the page doing it', async () => {
      show({ children: long })
      await settled(60)
      expect(hasHorizontalOverflow()).toBe(false)
    })

    it('and the frame keeps the width it was given', async () => {
      show({ children: long })
      await settled(60)
      expect(box(frame()).width).toBe(360)
    })

    it('and the copy button is not pushed out of it', async () => {
      show({ children: long })
      await settled(60)
      expect(box(copy()).width).toBeGreaterThan(20)
      expect(box(copy()).right).toBeLessThanOrEqual(box(frame()).right)
      expect(box(copy()).left).toBeGreaterThanOrEqual(box(frame()).left)
    })

    it('does not wrap — a command broken across lines pastes wrong', async () => {
      show({ children: long })
      await settled(60)
      const line = document.querySelector<HTMLElement>('.db-snippet__line')!
      expect(getComputedStyle(line).whiteSpace).toBe('pre')
      expect(box(line).height).toBeLessThan(40)
    })
  })

  describe('several lines', () => {
    it('each gets its own', async () => {
      show({ children: ['cd kits/diba', 'bun install', 'bun run build'] })
      await settled(60)
      const lines = [...document.querySelectorAll<HTMLElement>('.db-snippet__line')]
      expect(lines).toHaveLength(3)
      expect(box(lines[1]!).top).toBeGreaterThan(box(lines[0]!).top)
      expect(box(lines[2]!).top).toBeGreaterThan(box(lines[1]!).top)
    })

    /** At the top end, level with the first line. */
    it('and the copy button stays at the top end, by the first line', async () => {
      show({ children: ['cd kits/diba', 'bun install', 'bun run build'] })
      await settled(60)
      const lines = [...document.querySelectorAll<HTMLElement>('.db-snippet__line')].map(box)
      const button = box(copy())
      expect(button.top - box(frame()).top).toBeCloseTo(6, 0)
      expect(box(frame()).right - button.right).toBeCloseTo(12, 0)
      const middle = (b: { top: number; height: number }) => b.top + b.height / 2
      expect(Math.abs(middle(lines[0]!) - middle(button))).toBeLessThan(1)
      // The last line as far from the frame's foot as the first from its head, to a pixel's
      // rounding: 15.5 each.
      const head = lines[0]!.top - box(frame()).top
      const foot = box(frame()).bottom - lines[2]!.bottom
      expect(Math.abs(head - foot)).toBeLessThanOrEqual(1)
    })

    it('one line sits centred on the button, as before', async () => {
      show()
      await settled(60)
      const line = box(document.querySelector<HTMLElement>('.db-snippet__line')!)
      const button = box(copy())
      expect(Math.abs(line.top + line.height / 2 - (button.top + button.height / 2))).toBeLessThan(
        1,
      )
      expect(box(frame()).height).toBe(52)
    })

    it('with nothing to press, the words keep their own height', async () => {
      show({ hideCopyButton: true })
      await settled(60)
      expect(box(frame()).height).toBe(33)
    })
  })

  describe('sizes', () => {
    // Flutter's padding grows with the size; its type is 14 on 21 at every one.
    it('the frame grows; the type stays 14 on 21', async () => {
      const measured: { height: number; text: number }[] = []
      for (const size of snippetOptions.size) {
        const { unmount } = show({ size })
        await settled(30)
        measured.push({
          height: box(frame()).height,
          text: parseFloat(getComputedStyle(code()).fontSize),
        })
        unmount()
      }
      expect(measured[0]!.height).toBeLessThan(measured[2]!.height)
      expect(measured.map((m) => m.text)).toEqual([14, 14, 14])
    })
  })

  describe('variants', () => {
    it('secondary draws a line and no fill; default fills and draws no line', async () => {
      const { unmount } = show({ variant: 'secondary' })
      await settled(30)
      const outlined = getComputedStyle(frame())
      const outlineLine = outlined.borderTopColor
      const outlineFill = outlined.backgroundColor
      const outlineWidth = outlined.borderTopWidth
      unmount()

      show({ variant: 'default' })
      await settled(30)
      const filled = getComputedStyle(frame())

      expect(outlineFill).toBe('rgba(0, 0, 0, 0)')
      expect(outlineLine).not.toBe('rgba(0, 0, 0, 0)')
      expect(outlineWidth).toBe('1px')
      expect(filled.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
      expect(filled.borderTopWidth).toBe('0px')
    })

    /**
     * On a grey card the second surface is the card's own grey: a default snippet takes the
     * surface there, so it still has a frame, as a pager's page shown does (2026-11-06).
     */
    for (const theme of ['light', 'dark'] as const) {
      for (const variant of ['secondary', 'tertiary'] as const) {
        it(`${theme}: on a ${variant} card, the surface, told from the card`, async () => {
          render(
            <DibaProvider locale="fa-IR" dir="rtl" theme={theme}>
              <Card variant={variant}>
                <Snippet>DB-1041</Snippet>
              </Card>
            </DibaProvider>,
          )
          await settled(60)
          const card = document.querySelector<HTMLElement>('.card')!
          const fill = getComputedStyle(frame()).backgroundColor
          const surface = getComputedStyle(document.documentElement).getPropertyValue('--surface')
          expect(toRgb(fill)).toEqual(toRgb(surface))
          expect(fill).not.toBe(getComputedStyle(card).backgroundColor)
        })
      }
    }
  })
})
