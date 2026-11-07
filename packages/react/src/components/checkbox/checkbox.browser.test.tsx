import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { commands, page, userEvent } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider, type DibaTheme } from '../../provider/DibaProvider'
import {
  Checkbox,
  Description,
  FieldError,
  Label,
  Radio,
  RadioGroup,
  Slider,
  Switch,
} from '../../index'
import { DibaSurface } from '../../sdui'
import { box, contrast, isTransparent, settled, toRgb, toRgba } from '../../test/visual'

const themes: DibaTheme[] = ['light', 'dark']

/** A card, as an admin section draws one; see button.browser.test.tsx. */
function Card({ theme, children }: { theme: DibaTheme; children: ReactNode }) {
  return (
    <DibaProvider theme={theme} locale="fa-IR" dir="rtl">
      <div
        data-reduce-motion="true"
        style={{
          background: 'var(--surface)',
          color: 'var(--foreground)',
          padding: 16,
          width: 360,
        }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name)
const rgb = (css: string) => toRgb(css.trim())
const css = (el: Element) => getComputedStyle(el)

function Choices() {
  return (
    <>
      <Checkbox className="on" defaultSelected>
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Label>نمایش در فروشگاه</Label>
        </Checkbox.Content>
      </Checkbox>
      <RadioGroup aria-label="نوع" defaultValue="a">
        <Radio value="a">
          <Radio.Content>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Label>دستی</Label>
          </Radio.Content>
        </Radio>
      </RadioGroup>
      <Switch className="off">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Label>خاموش</Label>
        </Switch.Content>
      </Switch>
      <Switch className="on" defaultSelected>
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Label>روشن</Label>
        </Switch.Content>
      </Switch>
    </>
  )
}

/**
 * A choice's state in roles, in both themes. The fill is gilt; what sits on it, the tick,
 * the dot and the on thumb, is slate-700 in both themes; an off thumb is slate-700 or slate-200;
 * an off track is slate-300 or slate-700. Every state-carrying pair is 5.88:1 or better.
 */
describe('choice colours', () => {
  for (const theme of themes) {
    it(`${theme}: gilt fills, slate-700 on them, and the off switch in the secondary roles`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <Choices />
        </Card>,
      )
      await settled(300)
      const gilt = rgb(token('--db-control-fill'))
      const onGilt = rgb(token('--db-control-on-fill'))
      const slate = (n: number) => rgb(token(`--db-slate-${n}`))

      // The checkbox and the radio are SVGs painted as Flutter paints them.
      const fill = container.querySelector(
        '.checkbox.on [data-slot="checkbox-default-indicator--flutter"] rect',
      )!
      expect(rgb(css(fill).fill)).toEqual(gilt)
      const tick = container.querySelector('.checkbox.on [data-slot="checkbox-flutter-mark"]')!
      expect(rgb(css(tick).stroke)).toEqual(onGilt)

      const [disc] = container.querySelectorAll(
        '[data-slot="radio-default-indicator--flutter"] circle',
      )
      expect(rgb(css(disc!).fill)).toEqual(gilt)
      const dot = container.querySelector('[data-slot="radio-default-indicator--dot"]')!
      expect(rgb(css(dot).fill)).toEqual(onGilt)

      const offTrack = container.querySelector('.switch.off .switch__control')!
      const offThumb = container.querySelector('.switch.off .switch__thumb')!
      expect(rgb(css(offTrack).backgroundColor)).toEqual(
        theme === 'light' ? slate(300) : slate(700),
      )
      expect(rgb(css(offThumb).backgroundColor)).toEqual(
        theme === 'light' ? slate(700) : slate(200),
      )
      const onTrack = container.querySelector('.switch.on .switch__control')!
      const onThumb = container.querySelector('.switch.on .switch__thumb')!
      expect(rgb(css(onTrack).backgroundColor)).toEqual(gilt)
      expect(rgb(css(onThumb).backgroundColor)).toEqual(onGilt)

      expect(
        contrast(css(onThumb).backgroundColor, css(onTrack).backgroundColor),
      ).toBeGreaterThanOrEqual(5.8)
      expect(
        contrast(css(offThumb).backgroundColor, css(offTrack).backgroundColor),
      ).toBeGreaterThanOrEqual(5.8)
    })
  }
})

function Stepped({
  step,
  value = 30,
  isDisabled,
}: {
  step?: number
  value?: number
  isDisabled?: boolean
}) {
  return (
    <Slider defaultValue={value} minValue={0} maxValue={100} step={step} isDisabled={isDisabled}>
      <Label>شفافیت</Label>
      <Slider.Output />
      <Slider.Track>
        <Slider.Fill />
        <Slider.Thumb />
      </Slider.Track>
    </Slider>
  )
}

/**
 * The slider is Flutter's. A 4px track, a 6px gilt fill, a round 20px slate-700 thumb with a
 * 3px gilt ring inside its edge, and step dots.
 */
describe('slider shape', () => {
  for (const theme of themes) {
    it(`${theme}: a thin track, a thicker gilt fill, and a round ringed thumb`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <Stepped />
        </Card>,
      )
      await settled(100)
      const track = container.querySelector('.slider__track')!
      const bar = getComputedStyle(track, '::before')
      expect(bar.height).toBe('4px')
      expect(rgb(bar.backgroundColor)).toEqual(rgb(token('--db-control-track')))
      expect(rgb(css(track).backgroundColor)).toEqual([0, 0, 0])
      const fill = container.querySelector('.slider__fill')!
      expect(box(fill).height).toBe(6)
      expect(rgb(css(fill).backgroundColor)).toEqual(rgb(token('--db-control-fill')))
      const thumb = container.querySelector('.slider__thumb')!
      expect(box(thumb).width).toBe(20)
      expect(box(thumb).height).toBe(20)
      expect(css(thumb).borderTopLeftRadius).toBe('9999px')
      expect(css(thumb).borderTopWidth).toBe('3px')
      expect(rgb(css(thumb).borderTopColor)).toEqual(rgb(token('--db-control-fill')))
      expect(rgb(css(thumb).backgroundColor)).toEqual(rgb(token('--db-control-on-fill')))
      // The thumb half sits on the empty track. In light its slate-700 body stands apart from
      // that track; in dark the track is slate-700 too, and the gilt ring is what does.
      const edge = theme === 'light' ? css(thumb).backgroundColor : css(thumb).borderTopColor
      expect(contrast(edge, bar.backgroundColor)).toBeGreaterThanOrEqual(3)
      // The thumb's centre and the fill's end meet, on the track's vertical middle.
      const t = box(thumb)
      const f = box(fill)
      expect(Math.abs(t.top + t.height / 2 - (f.top + f.height / 2))).toBeLessThanOrEqual(0.5)
    })
  }

  it('fills from the right in Persian, up to the thumb', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Stepped value={30} />
      </Card>,
    )
    await settled(100)
    const slider = box(container.querySelector('.slider')!)
    const track = box(container.querySelector('.slider__track')!)
    const fill = box(container.querySelector('.slider__fill')!)
    const thumb = box(container.querySelector('.slider__thumb')!)
    // The track is the thumb's run, half a thumb (10px) in from each end of the slider.
    expect(track.left - slider.left).toBe(10)
    expect(slider.right - track.right).toBe(10)
    expect(Math.abs(fill.right - track.right)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(thumb.left + thumb.width / 2 - fill.left)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(fill.width - track.width * 0.3)).toBeLessThanOrEqual(0.5)
  })

  it('draws a dot at each step when given one, slate-700 on the fill and the off colour on the track', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Stepped step={10} value={30} />
      </Card>,
    )
    await settled(100)
    const dots = [...container.querySelectorAll('.slider__step')]
    expect(dots).toHaveLength(11)
    expect(box(dots[0]!).width).toBe(2)
    const on = dots.filter((dot) => dot.getAttribute('data-active') === 'true')
    expect(on).toHaveLength(4)
    expect(rgb(css(on[0]!).backgroundColor)).toEqual(rgb(token('--db-control-on-fill')))
    expect(rgb(css(dots[10]!).backgroundColor)).toEqual(rgb(token('--db-control-thumb-off')))
    // The first dot, at the minimum, is at the right in Persian.
    expect(box(dots[0]!).left).toBeGreaterThan(box(dots[10]!).left)
  })

  it('draws no dots without a step, or when they would be closer than 6px', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <div className="none">
          <Stepped />
        </div>
        <div className="dense">
          <Stepped step={1} />
        </div>
      </Card>,
    )
    await settled(100)
    expect(container.querySelector('.none .slider__step')).toBeNull()
    // 100 steps on a 308px track would be 3px apart.
    expect(container.querySelector('.dense .slider__step')).toBeNull()
  })

  // Flutter's slider fades so too; it had greyed.
  it('fades as a whole when disabled, keeping its colours', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Stepped isDisabled />
      </Card>,
    )
    await settled(100)
    expect(Number(css(container.querySelector('.slider')!).opacity)).toBe(0.5)
    const fill = container.querySelector('.slider__fill')!
    expect(rgb(css(fill).backgroundColor)).toEqual(rgb(token('--db-control-fill')))
    const thumb = container.querySelector('.slider__thumb')!
    expect(rgb(css(thumb).borderTopColor)).toEqual(rgb(token('--db-control-fill')))
    expect(rgb(css(thumb).backgroundColor)).toEqual(rgb(token('--db-control-on-fill')))
  })

  // The same on both platforms: Flutter's slider was
  // 48 high, its track 24 in from each end and its description far under it.
  it('laid out as Flutter’s: a 20px label row, the track 4 under it and as high as its thumb', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            {
              type: 'Slider',
              props: { label: 'شفافیت', defaultValue: 40, description: 'از صفر تا صد' },
            } as never
          }
        />
      </Card>,
    )
    await settled(100)
    const root = container.querySelector('.slider')!
    const label = box(root.querySelector(':scope > [data-slot="label"]')!)
    const output = box(root.querySelector('[data-slot="slider-output"]')!)
    const track = box(root.querySelector('.slider__track')!)
    const description = box(root.querySelector(':scope > [data-slot="description"]')!)
    expect(label.height).toBe(20)
    expect(output.height).toBe(20)
    expect(track.top - label.bottom).toBe(4)
    expect(track.height).toBe(20)
    expect(description.top - track.bottom).toBe(4)
  })

  it('draws Diba’s focus ring around a focused thumb', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Stepped />
      </Card>,
    )
    await userEvent.tab()
    await settled(50)
    expect(css(container.querySelector('.slider__thumb')!).boxShadow).toContain('0px 0px 0px 2px')
  })
})

function Toggle(props: {
  size?: 'sm' | 'md' | 'lg'
  defaultSelected?: boolean
  isDisabled?: boolean
}) {
  return (
    <Switch {...props}>
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Label>ارسال</Label>
      </Switch.Content>
    </Switch>
  )
}

/**
 * The slider under the pointer: Flutter's state layer
 * on the thumb, 48 across, gilt at 8% when the pointer is within 24 of its centre along the track
 * and within the track's height, and 10% while dragged; the open hand over the thumb and the
 * track, the closed one while dragged. A press there takes the thumb where it is; a press on the
 * bare track brings it there. Flutter holds the same in
 * slider_look_test.dart.
 */
describe('slider under the pointer', () => {
  /** The thumb's state layer: the first, spread shadow's colour. */
  const layerAlpha = (thumb: Element) => {
    const first = getComputedStyle(thumb).boxShadow.match(
      /^((?:rgba?|oklab|oklch|color|hsla?)\([^)]*\)|transparent)/,
    )
    return first ? toRgba(first[1]!)[3] : 0
  }

  async function paint() {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Stepped />
      </Card>,
    )
    await settled(50)
    const thumb = container.querySelector('.slider__thumb')!
    const track = container.querySelector('.slider__track')!
    const r = thumb.getBoundingClientRect()
    return { thumb, track, x: r.x + r.width / 2, y: r.y + r.height / 2 }
  }

  it('shows the layer near the thumb, 48 across, not elsewhere on the track', async () => {
    const { thumb, track, x, y } = await paint()
    expect(layerAlpha(thumb)).toBe(0)
    // 16 from the centre: past the 20-wide thumb, within Flutter's 24.
    await commands.pointer(x + 16, y, 'move')
    await settled(150)
    expect(layerAlpha(thumb)).toBeCloseTo(0.08, 2)
    const spread = Number(getComputedStyle(thumb).boxShadow.match(/0px 0px 0px ([\d.]+)px/)![1])
    expect(box(thumb).width + spread * 2).toBe(48)
    expect(getComputedStyle(track).cursor).toBe('grab')
    // Far along the track: no layer.
    const t = track.getBoundingClientRect()
    await commands.pointer(t.right - 10, y, 'move')
    await settled(150)
    expect(layerAlpha(thumb)).toBe(0)
  })

  it('not past the track’s height: the circle over the label’s row takes nothing', async () => {
    const { thumb, x, y } = await paint()
    // 15 above the centre: past the 20px track, inside the 48px circle.
    const above = document.elementFromPoint(x, y - 15)!
    expect(thumb.contains(above)).toBe(false)
    await commands.pointer(x, y - 15, 'move')
    await settled(150)
    expect(layerAlpha(thumb)).toBe(0)
  })

  /** The thumb's value, from its input. */
  const valueOf = (thumb: Element) => Number(thumb.querySelector('input')!.value)
  /** How far a thumb's centre runs: the track. Persian: the minimum is at the right. */
  const run = (track: Element) => box(track).width

  it('a press on the circle beside the thumb takes it where it is', async () => {
    const { thumb, track, x, y } = await paint()
    await commands.pointer(x + 16, y, 'down')
    await settled(50)
    expect(valueOf(thumb)).toBe(30)
    // A tenth of the run, toward the maximum: to the left.
    await commands.pointer(x + 16 - run(track) / 10, y, 'move')
    await settled(50)
    expect(valueOf(thumb)).toBe(40)
    await commands.pointer(x + 16 - run(track) / 10, y, 'up')
  })

  it('held off its centre, it still reaches the end', async () => {
    const { thumb, track, x, y } = await paint()
    await commands.pointer(x + 16, y, 'down')
    await commands.pointer(box(track).left - 40, y, 'move')
    await settled(50)
    expect(valueOf(thumb)).toBe(100)
    await commands.pointer(box(track).left - 40, y, 'up')
  })

  it('a press on the bare track brings the thumb there', async () => {
    const { thumb, track, y } = await paint()
    const at80 = box(track).right - run(track) * 0.8
    await commands.pointer(at80, y, 'down')
    await settled(50)
    expect(valueOf(thumb)).toBe(80)
    await commands.pointer(at80, y, 'up')
  })

  it('a press past the run, where a thumb at the end overhangs, takes it to that end', async () => {
    const { thumb, track, y } = await paint()
    // 5 past the minimum's end, at the right in Persian.
    await commands.pointer(box(track).right + 5, y, 'down')
    await settled(50)
    expect(valueOf(thumb)).toBe(0)
    await commands.pointer(box(track).right + 5, y, 'up')
  })

  it('grabs: the closed hand and a 10% layer while dragged', async () => {
    const { thumb, track, x, y } = await paint()
    expect(getComputedStyle(thumb).cursor).toBe('grab')
    await commands.pointer(x, y, 'down')
    await commands.pointer(x - 30, y, 'move')
    await settled(150)
    expect(getComputedStyle(thumb).cursor).toBe('grabbing')
    expect(getComputedStyle(track).cursor).toBe('grabbing')
    expect(layerAlpha(thumb)).toBeCloseTo(0.1, 2)
    await commands.pointer(x - 30, y, 'up')
  })
})

/**
 * The switch is Flutter's M3 switch, at the size Diba's Flutter renderer draws it, which
 * scales M3's 52-by-32 track by the size's track height over 35. The numbers below were measured
 * off Flutter's gallery. A thumb's centre sits half a track's height in from the end it is at,
 * the start (the right, in Persian) when off.
 */
describe('switch shape', () => {
  const k = { sm: 24 / 35, md: 0.8, lg: 32 / 35 } as const
  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`${size}: M3's track and thumb, off at the right and on at the left`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme="light">
          <div className="off">
            <Toggle size={size} />
          </div>
          <div className="on">
            <Toggle size={size} defaultSelected />
          </div>
        </Card>,
      )
      await settled(50)
      for (const state of ['off', 'on'] as const) {
        const track = container.querySelector(`.${state} .switch__control`)!.getBoundingClientRect()
        const thumb = container.querySelector(`.${state} .switch__thumb`)!.getBoundingClientRect()
        expect(track.width).toBeCloseTo(52 * k[size], 1)
        expect(track.height).toBeCloseTo(32 * k[size], 1)
        expect(thumb.width).toBeCloseTo((state === 'off' ? 16 : 24) * k[size], 1)
        expect(thumb.height).toBeCloseTo(thumb.width, 1)
        const fromRight = track.right - (thumb.left + thumb.width / 2)
        expect(fromRight).toBeCloseTo((state === 'off' ? 16 : 36) * k[size], 1)
        expect(thumb.top + thumb.height / 2).toBeCloseTo(track.top + track.height / 2, 1)
      }
    })
  }

  /** Where to put the real mouse: an element's centre, in the test frame. */
  const centreOf = (el: Element) => {
    const r = el.getBoundingClientRect()
    return [r.x + r.width / 2, r.y + r.height / 2] as const
  }
  const layerOf = (thumb: Element) => getComputedStyle(thumb, '::before')

  it('a press on the switch itself grows its thumb to 28 after 100ms, at once', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Toggle />
      </Card>,
    )
    await settled(50)
    const thumb = container.querySelector('.switch__thumb')!
    const [x, y] = centreOf(container.querySelector('.switch__control')!)
    await commands.pointer(x, y, 'down')
    await settled(40)
    expect(box(thumb).width).toBe(Math.round(16 * 0.8))
    await settled(120)
    expect(box(thumb).width).toBe(Math.round(28 * 0.8))
    // The state layer: 40 across, round, 10% of the text colour while pressed.
    expect(parseFloat(layerOf(thumb).width)).toBeCloseTo(40 * 0.8, 1)
    expect(toRgba(layerOf(thumb).backgroundColor)[3]).toBeCloseTo(0.1, 2)
    await commands.pointer(x, y, 'up')
  })

  it('a press on its words chooses it without growing the thumb', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Toggle />
      </Card>,
    )
    await settled(50)
    const thumb = container.querySelector('.switch__thumb')!
    const [x, y] = centreOf(container.querySelector('.switch [data-slot="label"]')!)
    await commands.pointer(x, y, 'down')
    await settled(160)
    expect(box(thumb).width).toBe(Math.round(16 * 0.8))
    expect(toRgba(layerOf(thumb).backgroundColor)[3]).toBeCloseTo(0.1, 2)
    await commands.pointer(x, y, 'up')
    await settled(50)
    expect(container.querySelector('.switch')!.getAttribute('data-selected')).toBe('true')
  })

  it('moves as Flutter’s does: a pill on the way, a little past its end, round at rest', async () => {
    await page.viewport(1280, 800)
    // No Card: its data-reduce-motion would stop the motion.
    const { container } = render(
      <DibaProvider theme="light" locale="fa-IR" dir="rtl">
        <Toggle />
      </DibaProvider>,
    )
    await settled(50)
    const thumb = container.querySelector<HTMLElement>('.switch__thumb')!
    const track = container.querySelector('.switch__control')!
    const frames: { width: number; height: number; fromRight: number }[] = []
    await userEvent.click(container.querySelector('.switch [data-slot="label"]')!, { force: true })
    const until = performance.now() + 450
    await new Promise<void>((done) => {
      const tick = () => {
        const r = thumb.getBoundingClientRect()
        const t = track.getBoundingClientRect()
        frames.push({
          width: r.width,
          height: r.height,
          fromRight: t.right - (r.left + r.width / 2),
        })
        if (performance.now() < until) requestAnimationFrame(tick)
        else done()
      }
      requestAnimationFrame(tick)
    })
    const k = 0.8
    // Flutter's 34-by-22 pill: wider than tall by up to 12, somewhere on the way.
    expect(Math.max(...frames.map((f) => f.width - f.height))).toBeGreaterThan(6 * k)
    // easeOutBack: past the on end (36 from the start) before it settles.
    expect(Math.max(...frames.map((f) => f.fromRight))).toBeGreaterThan(36 * k + 0.4)
    const rest = frames.at(-1)!
    expect(rest.width).toBeCloseTo(24 * k, 1)
    expect(rest.height).toBeCloseTo(24 * k, 1)
    expect(rest.fromRight).toBeCloseTo(36 * k, 1)
    // At rest the stylesheet draws the thumb again.
    expect(thumb.style.width).toBe('')
  })

  it('fades as a whole when disabled, its thumb keeping its role', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Toggle isDisabled />
      </Card>,
    )
    await settled(50)
    expect(Number(css(container.querySelector('.switch')!).opacity)).toBeLessThan(1)
    expect(rgb(css(container.querySelector('.switch__thumb')!).backgroundColor)).toEqual(
      rgb(token('--db-control-thumb-off')),
    )
  })
})

/**
 * The checkbox and the radio are Flutter's, painted by a port of Flutter's painters. At rest:
 * an 18px box with 2px corners and a 2px edge in the muted text colour, gilt edge to edge with
 * Flutter's tick when checked; a 16px ring with a 2px slate-500 edge, a gilt disc with a 9px
 * slate-700 dot when chosen. An empty one clears the 3:1 a control needs against the card.
 */
describe('checkbox and radio shape', () => {
  for (const theme of themes) {
    it(`${theme}: Flutter's box and ring, in the choices' roles, clearing 3:1 when empty`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <Checkbox className="on" defaultSelected>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Label>روشن</Label>
            </Checkbox.Content>
          </Checkbox>
          <Checkbox className="off">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Label>خاموش</Label>
            </Checkbox.Content>
          </Checkbox>
          <RadioGroup aria-label="نوع" defaultValue="a">
            {['a', 'b'].map((value) => (
              <Radio key={value} value={value} className={value === 'a' ? 'on' : 'off'}>
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Label>{value}</Label>
                </Radio.Content>
              </Radio>
            ))}
          </RadioGroup>
        </Card>,
      )
      await settled(300)
      const gilt = rgb(token('--db-control-fill'))
      const onGilt = rgb(token('--db-control-on-fill'))
      const muted = rgb(token(theme === 'light' ? '--db-slate-500' : '--db-slate-400'))
      const card = css(container.querySelector('div[data-reduce-motion]')!).backgroundColor
      const flutter = (selector: string) =>
        container.querySelectorAll(`${selector} [data-slot$="default-indicator--flutter"] *`)

      expect(box(container.querySelector('.checkbox.off .checkbox__control')!).width).toBe(18)
      const [inside, edge, noMark] = flutter('.checkbox.off')
      expect(css(inside!).fill).toMatch(/^(transparent|rgba\(0, 0, 0, 0\))$/)
      expect(css(noMark!).display).toBe('none')
      expect(edge!.getAttribute('stroke-width')).toBe('2')
      expect(edge!.getAttribute('rx')).toBe('1')
      expect(rgb(css(edge!).stroke)).toEqual(muted)
      expect(contrast(css(edge!).stroke, card)).toBeGreaterThanOrEqual(3)

      const [full, noEdge, tick] = flutter('.checkbox.on')
      expect(css(noEdge!).display).toBe('none')
      expect(full!.getAttribute('width')).toBe('18')
      expect(full!.getAttribute('rx')).toBe('2')
      // Flutter's `_drawCheck`, in 18ths of the box: (0.15, 0.45), (0.4, 0.7), (0.85, 0.25).
      expect(tick!.getAttribute('d')).toBe('M 2.7 8.1 L 7.2 12.6 L 15.3 4.5')
      expect(tick!.getAttribute('stroke-width')).toBe('2')
      // Drawn at Flutter's 2px: the original's 2.5px rule for its own tick must not reach it.
      expect(css(tick!).strokeWidth).toBe('2px')
      expect(tick!.getAttribute('stroke-linecap')).toBe('butt')
      expect(rgb(css(tick!).stroke)).toEqual(onGilt)

      expect(box(container.querySelector('.radio.off .radio__control')!).width).toBe(16)
      const [, ring, hiddenDot] = flutter('.radio.off')
      expect(ring!.getAttribute('r')).toBe('7')
      expect(ring!.getAttribute('stroke-width')).toBe('2')
      expect(rgb(css(ring!).stroke)).toEqual(rgb(token('--db-slate-500')))
      expect(contrast(css(ring!).stroke, card)).toBeGreaterThanOrEqual(3)
      expect(css(hiddenDot!).display).toBe('none')

      const [disc, ringOn, dot] = flutter('.radio.on')
      expect(rgb(css(disc!).fill)).toEqual(gilt)
      expect(rgb(css(ringOn!).stroke)).toEqual(gilt)
      expect(dot!.getAttribute('r')).toBe('4.5')
      expect(rgb(css(dot!).fill)).toEqual(onGilt)
    })
  }

  it('draws an invalid box with a danger edge, and no outline outside it', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Checkbox isInvalid>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label>قوانین</Label>
          </Checkbox.Content>
        </Checkbox>
      </Card>,
    )
    await settled(50)
    const [, edge] = container.querySelectorAll(
      '[data-slot="checkbox-default-indicator--flutter"] rect',
    )
    expect(rgb(css(edge!).stroke)).toEqual(rgb(token('--db-danger')))
    // v3's outline is still declared, in a danger colour the control empties to transparent.
    const control = css(container.querySelector('.checkbox__control')!)
    expect(control.outlineStyle === 'none' || isTransparent(control.outlineColor)).toBe(true)
  })

  it('animates as Flutter does: the fill first, then the check, coming to rest checked', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <DibaProvider theme="light" locale="fa-IR" dir="rtl">
        <Checkbox>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label>ارسال</Label>
          </Checkbox.Content>
        </Checkbox>
      </DibaProvider>,
    )
    const svg = () => container.querySelector('[data-slot="checkbox-default-indicator--flutter"]')!
    await userEvent.click(container.querySelector('.checkbox__control')!)
    const seen: string[] = []
    const started = performance.now()
    while (performance.now() - started < 400) {
      const mark = svg().getAttribute('data-mark')!
      if (seen.at(-1) !== mark) seen.push(mark)
      await new Promise(requestAnimationFrame)
    }
    expect(seen).toEqual(['none', 'check'])
    expect(svg().querySelector('path')!.getAttribute('d')).toBe('M 2.7 8.1 L 7.2 12.6 L 15.3 4.5')
  })

  it('paints every frame between the two rests, not only the ends', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <DibaProvider theme="light" locale="fa-IR" dir="rtl">
        <RadioGroup aria-label="نوع" defaultValue="a">
          {['a', 'b'].map((value) => (
            <Radio key={value} value={value}>
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Label>{value}</Label>
              </Radio.Content>
            </Radio>
          ))}
        </RadioGroup>
      </DibaProvider>,
    )
    const dots = () =>
      container.querySelectorAll<SVGCircleElement>('[data-slot="radio-default-indicator--dot"]')
    await userEvent.click(container.querySelectorAll('.radio__control')[1]!)
    const radii = new Set<string>()
    const started = performance.now()
    while (performance.now() - started < 300) {
      radii.add(dots()[1]!.getAttribute('r')!)
      await new Promise(requestAnimationFrame)
    }
    // The dot grows through several radii on its way to 4.5, frame by frame.
    expect(radii.size).toBeGreaterThanOrEqual(5)
    expect(dots()[1]!.getAttribute('r')).toBe('4.5')
    expect(dots()[0]!.style.display).toBe('none')
  })

  it('takes Flutter’s pressed colour, the state being left: 10% gilt on an empty box', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Checkbox>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label>ارسال</Label>
          </Checkbox.Content>
        </Checkbox>
      </Card>,
    )
    await settled(50)
    const content = container.querySelector('[data-slot="checkbox-content"]')!
    content.setAttribute('data-pressed', 'true')
    const layer = getComputedStyle(container.querySelector('.checkbox__control')!, '::after')
    const expected = document.createElement('div')
    expected.style.background = 'color-mix(in srgb, var(--db-control-fill) 10%, transparent)'
    container.append(expected)
    expect(layer.backgroundColor).toBe(getComputedStyle(expected).backgroundColor)
    expect(layer.scale).toBe('1')
  })
})

/**
 * Choices' labels and errors as Flutter shows them. An option's label is regular
 * weight, where a field's label above it stays medium. When invalid, every label keeps the text
 * colour and the error is red, under a checkbox too, where the original greyed it. A required group's
 * star is on the group's label only; a lone required checkbox keeps its own.
 */
describe('choice labels and errors', () => {
  const star = (label: Element) => getComputedStyle(label, '::after').content

  it('an invalid checkbox: the label keeps the text colour and its star, the error is red', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Checkbox isInvalid isRequired>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label>شرایط را می‌پذیرم</Label>
          </Checkbox.Content>
          <FieldError>برای ادامه لازم است.</FieldError>
        </Checkbox>
      </Card>,
    )
    await settled(50)
    const label = container.querySelector('.label')!
    expect(rgb(css(label).color)).toEqual(rgb(token('--foreground')))
    expect(star(label)).toBe('"*"')
    const error = container.querySelector('[data-slot="field-error"]')!
    expect(error.textContent).toBe('برای ادامه لازم است.')
    expect(rgb(css(error).color)).toEqual(rgb(token('--db-danger')))
  })

  it('a required, invalid radio group: one star, on its label; no label in red; a red error', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <RadioGroup isRequired isInvalid>
          <Label>اندازه</Label>
          {['S', 'M', 'L'].map((value) => (
            <Radio key={value} value={value}>
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Label>{value}</Label>
              </Radio.Content>
            </Radio>
          ))}
          <FieldError>یکی را انتخاب کنید.</FieldError>
        </RadioGroup>
      </Card>,
    )
    await settled(50)
    const [group, ...options] = container.querySelectorAll('.label')
    expect(star(group!)).toBe('"*"')
    expect(options).toHaveLength(3)
    for (const option of options) {
      expect(star(option), option.textContent!).toBe('none')
      expect(rgb(css(option).color)).toEqual(rgb(token('--foreground')))
    }
    expect(rgb(css(group!).color)).toEqual(rgb(token('--foreground')))
    const error = container.querySelector('[data-slot="field-error"]')!
    expect(rgb(css(error).color)).toEqual(rgb(token('--db-danger')))
  })

  it('an option’s label is regular weight; a group’s label stays medium', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <RadioGroup defaultValue="a">
          <Label className="group-label">نوع</Label>
          <Radio value="a">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              <Label>دستی</Label>
            </Radio.Content>
          </Radio>
        </RadioGroup>
        <Choices />
      </Card>,
    )
    await settled(50)
    expect(css(container.querySelector('.group-label')!).fontWeight).toBe('500')
    const options = container.querySelectorAll(
      '.checkbox__content .label, .radio__content .label, .switch__content .label',
    )
    expect(options.length).toBeGreaterThanOrEqual(5)
    for (const option of options) {
      expect(css(option).fontWeight, option.textContent!).toBe('400')
    }
  })
})

/**
 * On both platforms an option is one target. Its control, its label and its description
 * answer a pointer alike: the hand, the circle and a press; a switch's thumb circle too. The rest
 * of its row answers none of them, and a disabled option nothing at all. The original's option stretched
 * to its row and showed the hand and the circle across it, while only its label took a press.
 * packages/flutter/test/choice_target_test.dart holds the same for Flutter.
 */
describe('an option is one target', () => {
  const at = (x: number, y: number) => document.elementFromPoint(x, y)
  const centre = (el: Element): [number, number] => {
    const r = el.getBoundingClientRect()
    return [r.x + r.width / 2, r.y + r.height / 2]
  }
  const kinds = ['checkbox', 'radio', 'switch'] as const

  function Options({ disabled = false }: { disabled?: boolean }) {
    return (
      <Card theme="light">
        <Checkbox isDisabled={disabled}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label>بیمهٔ مرسوله</Label>
          </Checkbox.Content>
          <Description>تا ۵۰ میلیون تومان</Description>
        </Checkbox>
        <RadioGroup aria-label="ارسال" isDisabled={disabled}>
          <Radio value="post">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              <Label>پست</Label>
            </Radio.Content>
            <Description>۳ تا ۵ روز</Description>
          </Radio>
        </RadioGroup>
        <Switch isDisabled={disabled}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Label>حالت آزمایشی</Label>
          </Switch.Content>
          <Description>سفارش‌ها واقعی نیستند.</Description>
        </Switch>
      </Card>
    )
  }

  async function paint(disabled = false) {
    await page.viewport(1280, 800)
    const { container } = render(<Options disabled={disabled} />)
    await settled(50)
    return (kind: (typeof kinds)[number]) => {
      const option = container.querySelector(`.${kind}`)!
      // A switch's state layer is on its thumb; a checkbox's or radio's on its control.
      const control = option.querySelector(
        kind === 'switch' ? '[data-slot="switch-thumb"]' : `[data-slot="${kind}-control"]`,
      )!
      return {
        option,
        content: option.querySelector(`[data-slot="${kind}-content"]`)!,
        control,
        description: option.querySelector('[data-slot="description"]')!,
        layer: () => {
          if (kind !== 'switch') return getComputedStyle(control, '::after').scale
          return isTransparent(getComputedStyle(control, '::before').backgroundColor) ? '0' : '1'
        },
      }
    }
  }

  for (const kind of kinds) {
    it(`a ${kind}: its description is its label`, async () => {
      const { content, description } = (await paint())(kind)
      const hit = at(...centre(description))!
      expect(content.contains(hit)).toBe(true)
      expect(getComputedStyle(hit).cursor).toBe('pointer')
    })

    // Above the control, outside it and outside the label's row, inside the 40px circle. A
    // switch's thumb circle lies on its track. A checkbox's or a radio's reaches past its 20px row
    // (Diba's spacing, below), where Flutter's cannot take a pointer, so the web's does not either.
    it(`a ${kind}: its circle's rim ${kind === 'switch' ? 'is' : 'is not'} its label`, async () => {
      const { option, content, control } = (await paint())(kind)
      const [cx, cy] = centre(control)
      const hit = at(cx, cy - 15)!
      if (kind === 'switch') {
        expect(content.contains(hit)).toBe(true)
        expect(getComputedStyle(hit).cursor).toBe('pointer')
      } else {
        expect(option.contains(hit)).toBe(false)
        expect(getComputedStyle(hit).cursor).not.toBe('pointer')
      }
    })

    it(`a ${kind}: a press on its description chooses it`, async () => {
      const { option, description } = (await paint())(kind)
      // Forced: a pointer lands on whatever is on top there, which is the label.
      await userEvent.click(description, { force: true })
      expect(option.getAttribute('data-selected')).toBe('true')
    })

    it(`a ${kind}: the circle shows for its description, not for its empty row`, async () => {
      const { option, description, layer } = (await paint())(kind)
      await userEvent.hover(description, { force: true })
      // A switch's layer fades in over 100ms.
      await settled(150)
      expect(layer()).toBe('1')

      // The far end of the option's row, at the label's height (Persian: the label is at the
      // right): not the option.
      const card = option.closest('[data-reduce-motion]')!.getBoundingClientRect()
      const empty = at(card.left + 24, option.getBoundingClientRect().top + 10)!
      expect(option.contains(empty)).toBe(false)
      expect(getComputedStyle(empty).cursor).not.toBe('pointer')
      await userEvent.hover(empty, { force: true, position: { x: 2, y: 2 } })
      await settled(150)
      expect(layer()).toBe('0')
    })

    it(`a disabled ${kind} answers nowhere: no hand, no circle, no press`, async () => {
      const { option, content, control, description, layer } = (await paint(true))(kind)
      const [cx, cy] = centre(control)
      for (const [x, y] of [
        centre(content),
        centre(description),
        [cx, cy - 15] as [number, number],
      ]) {
        expect(option.contains(at(x, y)), `${kind} at ${x},${y}`).toBe(false)
      }
      await userEvent.click(description, { force: true })
      expect(option.getAttribute('data-selected')).not.toBe('true')
      expect(layer()).toBe('0')
    })
  }
})

/**
 * Diba's spacing for checkbox and radio rows, the same on both platforms: the
 * box flush with the option's start, its words 12 on, its description 4 under them in line with
 * the words; down a group rows 24 apart, across 16, the first 16 under the group's label, and the
 * group's description straight under its options. Drawn through the surface, as a tree draws
 * them. packages/flutter/test/choice_spacing_test.dart holds Flutter to the same numbers.
 */
describe("Diba's spacing for checkbox and radio rows", () => {
  const rect = (el: Element | null) => el!.getBoundingClientRect()
  /** The first two options in a group. */
  const firstTwo = (root: Element, selector: string): [DOMRect, DOMRect] => {
    const [first, second] = root.querySelectorAll(selector)
    return [rect(first ?? null), rect(second ?? null)]
  }
  /** Where an element's words are, not its box. */
  const words = (el: Element | null) => {
    const range = document.createRange()
    range.selectNodeContents(el!)
    return range.getBoundingClientRect()
  }

  async function paint(tree: Record<string, unknown>) {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface tree={tree as never} />
      </Card>,
    )
    await settled(50)
    return container
  }

  // Persian: an option starts at its right.
  for (const [kind, size, on] of [
    ['checkbox', 18, 30],
    ['radio', 16, 28],
  ] as const) {
    it(`a ${kind}: its box ${size}, flush, its words ${on} on, its description 24 down`, async () => {
      const container = await paint(
        kind === 'checkbox'
          ? {
              type: 'Checkbox',
              props: { label: 'بیمهٔ مرسوله', description: 'تا ۵۰ میلیون تومان' },
            }
          : {
              type: 'RadioGroup',
              props: { label: 'ارسال' },
              children: [
                {
                  type: 'Radio',
                  props: { value: 'post', label: 'پست', description: '۳ تا ۵ روز' },
                },
              ],
            },
      )
      const option = container.querySelector(`.${kind}`)!
      const control = rect(option.querySelector(`[data-slot="${kind}-control"]`))
      const label = rect(option.querySelector(`[data-slot="${kind}-content"] [data-slot="label"]`))
      const description = option.querySelector(':scope > [data-slot="description"]')

      expect(control.width).toBe(size)
      expect(control.right).toBeCloseTo(rect(option).right, 1)
      expect(control.right - label.right).toBeCloseTo(on, 1)
      expect(label.height).toBe(20)
      expect(control.top - label.top).toBeCloseTo((20 - size) / 2, 1)
      expect(rect(description).top - label.top).toBeCloseTo(24, 1)
      expect(rect(description).height).toBe(16)
      expect(control.right - words(description).right).toBeCloseTo(28, 0)
      expect(rect(option).height).toBe(40)
    })
  }

  for (const type of ['RadioGroup', 'CheckboxGroup'] as const) {
    const item = type === 'RadioGroup' ? 'Radio' : 'Checkbox'
    const kind = item.toLowerCase()
    const group = (props: Record<string, unknown>) => ({
      type,
      props: { label: 'ارسال', ...props },
      children: [
        { type: item, props: { value: 'tipax', label: 'تیپاکس', description: '۲ روز' } },
        { type: item, props: { value: 'post', label: 'پست' } },
      ],
    })

    it(`a ${type} down: 16 under its label, rows 24 apart, its description straight under`, async () => {
      const container = await paint(group({ description: 'هر دو بیمه‌شده' }))
      const root = container.querySelector(`.${kind}-group`)!
      const [first, second] = firstTwo(root, `.${kind}`)

      expect(
        first.top - rect(root.querySelector(':scope > [data-slot="label"]')).bottom,
      ).toBeCloseTo(16, 1)
      expect(first.height).toBe(40)
      expect(second.top - first.bottom).toBeCloseTo(24, 1)
      expect(rect(root.querySelector(':scope > [data-slot="description"]')).top).toBeCloseTo(
        second.bottom,
        1,
      )
    })

    it(`a ${type} across: 16 apart, on one line 16 under its label`, async () => {
      const container = await paint(group({ orientation: 'horizontal' }))
      const root = container.querySelector(`.${kind}-group`)!
      const [first, second] = firstTwo(root, `.${kind}`)

      expect(first.left - second.right).toBeCloseTo(16, 1)
      expect(second.top).toBeCloseTo(first.top, 1)
      expect(
        first.top - rect(root.querySelector(':scope > [data-slot="label"]')).bottom,
      ).toBeCloseTo(16, 1)
    })
  }

  // Radios placed straight in a horizontal group, not in the surface's row of options: still a row,
  // under the group's label.
  it('a horizontal RadioGroup of its own radios keeps them in a row, under its label', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <RadioGroup orientation="horizontal" defaultValue="a">
          <Label>نوع</Label>
          {['a', 'b'].map((value) => (
            <Radio key={value} value={value}>
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Label>{value}</Label>
              </Radio.Content>
            </Radio>
          ))}
        </RadioGroup>
      </Card>,
    )
    await settled(50)
    const root = container.querySelector('.radio-group')!
    const [first, second] = firstTwo(root, '.radio')
    expect(second.top).toBeCloseTo(first.top, 1)
    expect(first.left - second.right).toBeCloseTo(16, 1)
    expect(first.top - rect(root.querySelector(':scope > [data-slot="label"]')).bottom).toBeCloseTo(
      16,
      1,
    )
  })
})
