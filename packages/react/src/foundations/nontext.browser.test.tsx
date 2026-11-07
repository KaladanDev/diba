import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { userEvent } from '@vitest/browser/context'
import { DibaProvider } from '../provider/DibaProvider'
import { backgroundBehind, contrast, settled, toRgba } from '../test/visual'

import { Button, Label, Meter, ProgressBar, ProgressCircle } from '../index'

/**
 * The dark theme's non-text contrast.
 *
 * The text sweep next door came back clean, and text was never where this
 * library's colour bugs were. All three shipped in something non-text: a star
 * drawn in a border colour, an alert's mark, an icon. Those are the things
 * WCAG 1.4.11 asks for 3:1 on, and nothing has ever measured them in dark.
 *
 * Two kinds of thing are checked, because they fail differently.
 *
 * A focus ring is the strongest case: it is the only indication of where the
 * keyboard is, it is drawn over whatever surface the control sits on, and a
 * ring nobody can see is the same as no ring.
 *
 * An indicator is the second: a track behind a fill, a switch's knob against
 * its own bed. Each carries meaning by
 * itself, so each has to be distinguishable from what it sits against.
 */

let mounted: { unmount: () => void } | null = null
afterEach(() => {
  mounted?.unmount()
  mounted = null
})

const THEMES = ['light', 'dark'] as const

function paint(theme: (typeof THEMES)[number], node: React.ReactNode) {
  mounted?.unmount()
  mounted = render(
    <DibaProvider locale="fa-IR" dir="rtl" theme={theme}>
      <div
        data-reduce-motion="true"
        style={{ padding: 24, background: 'var(--background)', color: 'var(--foreground)' }}
      >
        {node}
      </div>
    </DibaProvider>,
  )
  return mounted
}

/**
 * Composite a colour over what is behind it.
 *
 * A ring may be drawn with alpha. Handing that straight to `contrast()`
 * makes `toRgb` paint it over black and report 2.05 for a ring that is
 * perfectly visible — the same measurement bug that made a transparent caret
 * look like the clearest thing on the page.
 */
function over(colour: string, behind: string): string {
  const [r, g, b, a] = toRgba(colour)
  const [br, bg, bb] = toRgba(behind)
  const mix = (f: number, k: number) => Math.round(f * a + k * (1 - a))
  return `rgb(${mix(r, br)}, ${mix(g, bg)}, ${mix(b, bb)})`
}

const COLOUR = /(oklch|oklab|rgba?|color)\([^)]*\)|#[0-9a-fA-F]{3,8}/

/**
 * The ring in a box-shadow: of its layers, the widest spread that is painted at all. A ring is
 * drawn as a stack of spreads, the page's colour 2 wide as a gap and the ring's colour 4 wide
 * round it, with transparent layers before them, so the first colour in the list is not the ring.
 */
function ringOfShadow(shadow: string): string {
  const layers = shadow.split(/,(?![^(]*\))/)
  let best = ''
  let widest = -1
  for (const layer of layers) {
    const colour = layer.match(COLOUR)?.[0]
    if (!colour || toRgba(colour)[3] === 0) continue
    const lengths = layer.replace(COLOUR, '').match(/-?[\d.]+px/g) ?? []
    const spread = parseFloat(lengths[3] ?? '0')
    if (spread > widest) {
      widest = spread
      best = colour
    }
  }
  return best
}

/** The ring actually painted on a focused element, and what it sits on. */
function ringContrast(el: Element): { ratio: number; colour: string } {
  const style = getComputedStyle(el)
  // An outline of `none` or zero width is not a ring at all.
  const drawn =
    style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
      ? style.outlineColor
      : style.boxShadow !== 'none'
        ? style.boxShadow
        : ''
  const colour = drawn === style.outlineColor ? drawn : ringOfShadow(drawn)
  if (!colour || toRgba(colour)[3] === 0) return { ratio: 0, colour: drawn || 'none' }
  // The backdrop is the *parent's* surface, not the element's. `outline-offset`
  // pushes the ring outside its own box, so measuring it against the box it
  // surrounds compares a ring to the thing it is drawn beside — which reported
  // a button's ring against the button's own primary fill and called it 1.16.
  const paper = backgroundBehind(el.parentElement ?? el)
  return { ratio: contrast(over(colour, paper), paper), colour }
}

const focusable: [string, React.ReactNode, string][] = [
  ['a button', <Button key="b">دکمه</Button>, 'button'],
  [
    'a ghost button',
    <Button key="g" variant="ghost">
      دکمه
    </Button>,
    'button',
  ],
]

for (const theme of THEMES) {
  describe(`non-text contrast — ${theme}`, () => {
    /**
     * 3:1 against the surface the ring is drawn on, which is WCAG 1.4.11's bar
     * for a control's state being visible at all.
     */
    describe('a focus ring can be seen', () => {
      for (const [name, node, selector] of focusable) {
        it(name, async () => {
          paint(theme, node)
          await settled(60)
          await userEvent.tab()
          await settled(200)

          const focused = document.activeElement
          expect(focused, 'nothing took focus').not.toBe(document.body)

          // The ring may be on the control or on the box that owns it.
          const candidates = [focused!, focused!.parentElement]
            .filter(Boolean)
            .map((el) => ringContrast(el as Element))
          const best = Math.max(...candidates.map((c) => c.ratio))

          expect(
            best,
            `${name}: best ring contrast was ${best} (${candidates.map((c) => c.colour).join(' | ')}) against ${backgroundBehind(focused as Element)}`,
          ).toBeGreaterThanOrEqual(3)
          void selector
        })
      }
    })

    /**
     * An indicator carries meaning on its own, so it has to be told apart from
     * whatever it sits against. This is where every colour bug in this library
     * has actually been.
     */
    describe('an indicator can be told from its background', () => {
      /*
       * The status colours, on a bar, a meter and a ring. A default one is left out on purpose:
       * its neutral fill is lighter than its track, as Flutter draws it, and the look was picked
       * so; the meaning there is in the value written beside it. In light the accent's gilt and
       * the warning's amber were 1.19 and 1.59 from the track; they take their emphasis there.
       */
      for (const kind of ['progress-bar', 'meter'] as const) {
        for (const color of ['accent', 'success', 'warning', 'danger'] as const) {
          it(`a ${color} ${kind} fill against its track`, async () => {
            const Root = kind === 'meter' ? Meter : ProgressBar
            paint(
              theme,
              <Root value={60} color={color}>
                <Label>بارگذاری</Label>
                <Root.Track>
                  <Root.Fill />
                </Root.Track>
              </Root>,
            )
            await settled(60)
            const track = document.querySelector<HTMLElement>(`.${kind}__track`)!
            const fill = document.querySelector<HTMLElement>(`.${kind}__fill`)!
            expect(
              contrast(
                getComputedStyle(fill).backgroundColor,
                getComputedStyle(track).backgroundColor,
              ),
            ).toBeGreaterThanOrEqual(3)
          })
        }
      }

      for (const color of ['accent', 'success', 'warning', 'danger'] as const) {
        it(`a ${color} progress-circle arc against its track`, async () => {
          paint(
            theme,
            <ProgressCircle value={60} color={color} aria-label="بارگذاری">
              <ProgressCircle.Track>
                <ProgressCircle.TrackCircle />
                <ProgressCircle.FillCircle />
              </ProgressCircle.Track>
            </ProgressCircle>,
          )
          await settled(60)
          const track = document.querySelector<SVGElement>('.progress-circle__track-circle')!
          const fill = document.querySelector<SVGElement>('.progress-circle__fill-circle')!
          expect(
            contrast(getComputedStyle(fill).stroke, getComputedStyle(track).stroke),
          ).toBeGreaterThanOrEqual(3)
        })
      }
    })
  })
}
