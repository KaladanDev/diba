import { describe, it, expect } from 'vitest'
import { act, render } from '@testing-library/react'
import { commands, page, userEvent } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider, type DibaTheme } from '../../provider/DibaProvider'
import {
  Alert,
  Avatar,
  AvatarGroup,
  Chip,
  Label,
  ProgressBar,
  Spinner,
  Tag,
  TagGroup,
  ToastProvider,
  toast,
} from '../../index'
import { box, settled, textContrast, toRgb } from '../../test/visual'
import { DibaSurface } from '../../sdui'

const themes: DibaTheme[] = ['light', 'dark']
const statuses = ['default', 'accent', 'success', 'warning', 'danger'] as const

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

/** Every status's title and description clears AA where it is drawn, in both themes. */
describe('alert colours', () => {
  for (const theme of themes) {
    it(`${theme}: every status reads at AA`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          {statuses.map((status) => (
            <Alert key={status} status={status}>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>وضعیت {status}</Alert.Title>
                <Alert.Description>این پیام برای فروشنده است.</Alert.Description>
              </Alert.Content>
            </Alert>
          ))}
        </Card>,
      )
      await settled(50)
      for (const part of container.querySelectorAll('.alert__title, .alert__description')) {
        expect(
          textContrast(part),
          `${part.closest('.alert')!.className} ${part.className}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
      // Each status draws its title in its own colour.
      const titles = [...container.querySelectorAll('.alert__title')].map((t) => css(t).color)
      expect(new Set(titles).size).toBe(statuses.length)
    })
  }
})

/**
 * An alert is tinted in its status, as Flutter's is, with no shadow: the status colour at 12%
 * over the surface (22% in dark), the brand's soft fill for accent and the second surface for
 * default. Its icon and title take the status's emphasis tone, its description the text colour.
 */
describe('alert tint', () => {
  const tints = {
    default: ['var(--surface-secondary)', '--foreground'],
    accent: ['var(--db-primary-soft)', '--db-primary-emphasis'],
    success: [
      'color-mix(in srgb, var(--db-success) SHARE, var(--surface))',
      '--db-success-emphasis',
    ],
    warning: [
      'color-mix(in srgb, var(--db-warning) SHARE, var(--surface))',
      '--db-warning-emphasis',
    ],
    danger: ['color-mix(in srgb, var(--db-danger) SHARE, var(--surface))', '--db-danger-emphasis'],
  } as const

  for (const theme of themes) {
    it(`${theme}: each status on its own tint, with no shadow`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          {statuses.map((status) => (
            <Alert key={status} status={status}>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>وضعیت {status}</Alert.Title>
                <Alert.Description>این پیام برای فروشنده است.</Alert.Description>
              </Alert.Content>
            </Alert>
          ))}
          <div className="probe" />
        </Card>,
      )
      await settled(50)
      const probe = container.querySelector<HTMLElement>('.probe')!
      const share = theme === 'light' ? '12%' : '22%'
      for (const status of statuses) {
        const alert = container.querySelector(`.alert--${status}`)!
        const [tint, ink] = tints[status]
        probe.style.background = tint.replace('SHARE', share)
        expect(rgb(css(alert).backgroundColor), status).toEqual(rgb(css(probe).backgroundColor))
        expect(css(alert).boxShadow, status).toBe('none')
        probe.style.color = `var(${ink})`
        const title = alert.querySelector('.alert__title')!
        expect(rgb(css(title).color), status).toEqual(rgb(css(probe).color))
        expect(rgb(css(alert.querySelector('.alert__indicator')!).color), status).toEqual(
          rgb(css(probe).color),
        )
        expect(rgb(css(alert.querySelector('.alert__description')!).color), status).toEqual(
          rgb(token('--foreground')),
        )
      }
    })
  }
})

/** An avatar group counts the avatars past `max` in the locale's digits: +۲ in Persian. */
describe('avatar group count', () => {
  for (const [locale, dir, count] of [
    ['fa-IR', 'rtl', '+۲'],
    ['en-US', 'ltr', '+2'],
  ] as const) {
    it(`${locale}: ${count}`, async () => {
      const { container } = render(
        <DibaProvider theme="light" locale={locale} dir={dir}>
          <AvatarGroup max={2}>
            {['نر', 'اک', 'سا', 'مه'].map((name) => (
              <Avatar key={name}>
                <Avatar.Fallback>{name}</Avatar.Fallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </DibaProvider>,
      )
      await settled(20)
      const group = container.querySelector('[data-slot="avatar-group"]')!
      expect(group.lastElementChild!.textContent).toBe(count)
    })
  }
})

/**
 * Diba's avatar. A circle 32, 40 or 48 across, its
 * initials 12, 14 or 17 and medium; a named avatar without a colour takes its name's hue, the hue
 * 18% over the surface with its initials 62% into the text colour (30% and 55% in dark); a colour
 * from the tree is Diba's status tone; a presence dot and a gilt ring, except in a stack.
 */
describe('avatars', () => {
  const avatar = (props: Record<string, unknown>) => ({ type: 'Avatar', props })
  const people = ['نیلوفر رستمی', 'امید کاظمی', 'سارا احمدی', 'رضا', 'مینا']
  /** A colour the browser works out, drawn on a probe. */
  const probe = (container: HTMLElement, colour: string) => {
    const el = container.querySelector<HTMLElement>('.probe')!
    el.style.background = colour
    return rgb(css(el).backgroundColor)
  }

  it('a circle 32, 40 or 48 across, its initials 12, 14 or 17 and medium, kept apart', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            {
              type: 'Stack',
              props: { direction: 'horizontal' },
              children: (['sm', 'md', 'lg'] as const).map((size) =>
                avatar({ name: 'نیلوفر رستمی', size }),
              ),
            } as never
          }
        />
      </Card>,
    )
    await settled(50)
    const faces = [...container.querySelectorAll<HTMLElement>('.avatar')]
    for (const [i, [size, font]] of (
      [
        [32, '12px'],
        [40, '14px'],
        [48, '17px'],
      ] as const
    ).entries()) {
      const face = faces[i]!
      expect(box(face).width).toBe(size)
      expect(box(face).height).toBe(size)
      const initials = face.querySelector('.avatar__fallback')!
      expect(css(initials).borderTopLeftRadius).toBe('9999px')
      expect(css(initials).fontSize).toBe(font)
      expect(css(initials).fontWeight).toBe('500')
      expect(initials.textContent).toBe('ن‌ر')
    }
  })

  for (const theme of themes) {
    it(`${theme}: each name its hue's tint and ink, readable at AA`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <DibaSurface
            tree={
              {
                type: 'Stack',
                props: { direction: 'horizontal' },
                children: [
                  ...people.map((name) => avatar({ name })),
                  // Saffron's name in the fixture.
                  avatar({ name: 'Omid Kazemi' }),
                ],
              } as never
            }
          />
          <div className="probe" />
        </Card>,
      )
      await settled(50)
      const [tint, ink] = theme === 'light' ? ['18%', '62%'] : ['30%', '55%']
      const hues = new Set<string>()
      for (const face of container.querySelectorAll<HTMLElement>('.avatar')) {
        const hue = face.dataset.hue!
        hues.add(hue)
        const stop = { saffron: 600, garnet: 500, emerald: 600, sky: 600, iris: 500 }[hue]
        const initials = face.querySelector('.avatar__fallback')!
        expect(rgb(css(initials).backgroundColor), hue).toEqual(
          probe(container, `color-mix(in srgb, var(--db-${hue}-${stop}) ${tint}, var(--surface))`),
        )
        expect(rgb(css(initials).color), hue).toEqual(
          probe(
            container,
            `color-mix(in srgb, var(--db-${hue}-${stop}) ${ink}, var(--foreground))`,
          ),
        )
        expect(textContrast(initials), hue).toBeGreaterThanOrEqual(4.5)
      }
      // The fixture's names reach all five.
      expect([...hues].sort()).toEqual(['emerald', 'garnet', 'iris', 'saffron', 'sky'])
    })
  }

  it("a colour from the tree is Diba's status tone, on the neutral fill or its own tint", async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="dark">
        <DibaSurface
          tree={
            {
              type: 'Stack',
              props: { direction: 'horizontal' },
              children: [
                avatar({ name: 'امید کاظمی', color: 'default' }),
                avatar({ name: 'امید کاظمی', color: 'accent' }),
                avatar({ name: 'امید کاظمی', color: 'success', variant: 'soft' }),
                avatar({ name: 'امید کاظمی', color: 'accent', variant: 'soft' }),
              ],
            } as never
          }
        />
        <div className="probe" />
      </Card>,
    )
    await settled(50)
    const faces = [...container.querySelectorAll('.avatar__fallback')]
    const look = (i: number) => [rgb(css(faces[i]!).backgroundColor), rgb(css(faces[i]!).color)]
    expect(container.querySelector('.avatar[data-hue]')).toBeNull()
    expect(look(0)).toEqual([
      probe(container, 'var(--default)'),
      probe(container, 'var(--default-foreground)'),
    ])
    expect(look(1)).toEqual([
      probe(container, 'var(--default)'),
      probe(container, 'var(--db-primary-emphasis)'),
    ])
    expect(look(2)).toEqual([
      probe(container, 'color-mix(in srgb, var(--db-success) 22%, var(--surface))'),
      probe(container, 'var(--db-success-emphasis)'),
    ])
    expect(look(3)).toEqual([
      probe(container, 'var(--db-primary-soft)'),
      probe(container, 'var(--db-primary-emphasis)'),
    ])
  })

  it('a presence dot at the bottom of the end side, read after the name; a gilt ring 2 out', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            {
              type: 'Stack',
              props: { direction: 'horizontal' },
              children: [
                avatar({ name: 'نیلوفر رستمی', presence: 'online', size: 'sm' }),
                avatar({ name: 'امید کاظمی', presence: 'away' }),
                avatar({ name: 'سارا احمدی', presence: 'busy', size: 'lg', isRinged: true }),
                avatar({ name: 'رضا', presence: 'offline' }),
              ],
            } as never
          }
        />
        <div className="probe" />
      </Card>,
    )
    await settled(50)
    const faces = [...container.querySelectorAll<HTMLElement>('.avatar')]
    for (const [i, [size, colour, word]] of (
      [
        [10, '--success', 'آنلاین'],
        [12, '--warning', 'غایب'],
        [14, '--danger', 'مشغول'],
        [12, '--muted', 'آفلاین'],
      ] as const
    ).entries()) {
      const face = faces[i]!
      const dot = face.querySelector('.avatar__presence')!
      const [d, f] = [box(dot), box(face)]
      expect(d.width).toBe(size)
      expect(d.height).toBe(size)
      // Persian: the end side is the left.
      expect(d.left).toBe(f.left)
      expect(d.bottom).toBe(f.bottom)
      expect(rgb(css(dot).backgroundColor)).toEqual(probe(container, `var(${colour})`))
      expect(css(dot).borderTopWidth).toBe('2px')
      expect(rgb(css(dot).borderTopColor)).toEqual(probe(container, 'var(--surface)'))
      expect(face.getAttribute('role')).toBe('img')
      expect(face.getAttribute('aria-label')).toBe(`${people[i]}، ${word}`)
      expect(face.querySelector('.avatar__fallback')!.getAttribute('aria-hidden')).toBe('true')
    }
    const ringed = faces[2]!
    expect(css(ringed).outlineStyle).toBe('solid')
    expect(css(ringed).outlineWidth).toBe('2px')
    expect(css(ringed).outlineOffset).toBe('2px')
    expect(rgb(css(ringed).outlineColor)).toEqual(probe(container, 'var(--accent)'))
    expect(css(faces[0]!).outlineStyle).toBe('none')
  })

  it('a stack: a quarter over, no dots or rings, then "+2 more" 6 after it', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            {
              type: 'AvatarGroup',
              props: { max: 3, size: 'lg' },
              children: people.map((name, i) =>
                avatar({ name, presence: 'online', isRinged: i === 0 }),
              ),
            } as never
          }
        />
        <div className="probe" />
      </Card>,
    )
    await settled(50)
    const faces = [...container.querySelectorAll<HTMLElement>('.avatar:not(.avatar-group__count)')]
    expect(faces).toHaveLength(3)
    expect(container.querySelector('.avatar__presence')).toBeNull()
    expect(container.querySelector('.avatar[data-ringed]')).toBeNull()
    // Right to left: each 12 (a quarter of 48) over the one before it.
    expect(box(faces[0]!).left - box(faces[1]!).right).toBe(-12)
    expect(box(faces[1]!).left - box(faces[2]!).right).toBe(-12)
    const count = container.querySelector<HTMLElement>('.avatar-group__count')!
    expect(count.textContent).toBe('+۲ نفر')
    expect(box(faces[2]!).left - box(count).right).toBe(6)
    expect(box(count).height).toBe(40)
    expect(css(count).borderTopLeftRadius).toBe('9999px')
    const words = count.querySelector('.avatar__fallback')!
    expect(css(words).paddingInlineStart).toBe('12px')
    expect(css(words).fontSize).toBe('14px')
    expect(rgb(css(count).backgroundColor)).toEqual(
      probe(container, 'color-mix(in srgb, var(--db-saffron-600) 18%, var(--surface))'),
    )
    expect(rgb(css(words).color)).toEqual(
      probe(container, 'color-mix(in srgb, var(--db-saffron-600) 62%, var(--foreground))'),
    )
    // The last face before the count is not cut round it.
    expect(css(faces[2]!).maskImage).toBe('none')
  })

  it('a grid: 12 apart, with the dots and the ring; in English, "+1 more"', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <DibaProvider theme="light" locale="en-US" dir="ltr">
        <DibaSurface
          tree={
            {
              type: 'AvatarGroup',
              props: { isGrid: true, max: 4 },
              children: people.map((name, i) =>
                avatar({ name, presence: 'online', isRinged: i === 0 }),
              ),
            } as never
          }
        />
      </DibaProvider>,
    )
    await settled(50)
    const faces = [...container.querySelectorAll<HTMLElement>('.avatar:not(.avatar-group__count)')]
    expect(box(faces[1]!).left - box(faces[0]!).right).toBe(12)
    expect(container.querySelectorAll('.avatar__presence')).toHaveLength(4)
    expect(faces[0]!.dataset.ringed).toBe('true')
    expect(container.querySelector('.avatar-group__count')!.textContent).toBe('+1 more')
  })
})

/**
 * A soft chip's label clears AA on its own fill, in every colour and both themes. The fill is a
 * tint, so the reading composites it over the card.
 */
describe('chip colours', () => {
  for (const theme of themes) {
    it(`${theme}: every soft chip reads at AA`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          {statuses.map((color) => (
            <Chip key={color} size="sm" variant="soft" color={color}>
              <Chip.Label>{color}</Chip.Label>
            </Chip>
          ))}
        </Card>,
      )
      await settled(50)
      for (const label of container.querySelectorAll('.chip__label')) {
        expect(textContrast(label), label.parentElement!.className).toBeGreaterThanOrEqual(4.5)
      }
    })
  }
})

/**
 * A chip is Flutter's, on the web too. 24, 28 or 32 tall by size and round, a third of its
 * height in from each end; its icon 0.55 of its height, 4 from its words; the words 12 (14 at lg)
 * and medium; its colours the status tones Flutter's chip takes, the alert's.
 */
describe("chip, Flutter's", () => {
  const chip = (props: Record<string, unknown>, text: string) => ({
    type: 'Chip',
    props,
    children: text,
  })

  it('its height, ends, icon and words by size', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            {
              type: 'Stack',
              props: {},
              children: [
                chip({ size: 'sm', icon: 'circle-check', color: 'success' }, 'پرداخت‌شده'),
                chip({ size: 'md', icon: 'clock', color: 'warning' }, 'در انتظار'),
                chip({ size: 'lg', icon: 'circle-x', color: 'danger' }, 'لغوشده'),
              ],
            } as never
          }
        />
      </Card>,
    )
    await settled(50)
    const chips = [...container.querySelectorAll<HTMLElement>('.chip')]
    expect(chips).toHaveLength(3)
    for (const [i, height] of [24, 28, 32].entries()) {
      const c = chips[i]!
      const look = css(c)
      expect(box(c).height, `${height}`).toBe(height)
      expect(parseFloat(look.paddingLeft)).toBeCloseTo(height / 3, 2)
      expect(parseFloat(look.paddingRight)).toBeCloseTo(height / 3, 2)
      expect(parseFloat(look.borderTopLeftRadius)).toBe(height / 2)
      expect(look.fontSize).toBe(height === 32 ? '14px' : '12px')
      expect(look.fontWeight).toBe('500')
      const icon = c.querySelector('svg')!
      expect(icon.getBoundingClientRect().width).toBeCloseTo(height * 0.55, 1)
      const label = c.querySelector('.chip__label')!
      expect(css(label).paddingLeft).toBe('0px')
      // The icon at the start, at the right in Persian, 4 from the words.
      const [iconBox, words] = [icon.getBoundingClientRect(), label.getBoundingClientRect()]
      expect(iconBox.left - words.right).toBeCloseTo(4, 1)
      expect(c.getBoundingClientRect().right - iconBox.right).toBeCloseTo(height / 3, 1)
    }
  })

  for (const theme of themes) {
    it(`${theme}: each variant in Flutter's tones`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <DibaSurface
            tree={
              {
                type: 'Stack',
                props: {},
                children: ['soft', 'primary', 'secondary', 'tertiary'].flatMap((variant) =>
                  statuses.map((color) => chip({ variant, color }, `${variant} ${color}`)),
                ),
              } as never
            }
          />
          <div className="probe" />
        </Card>,
      )
      await settled(50)
      const probe = container.querySelector<HTMLElement>('.probe')!
      const share = theme === 'light' ? '12%' : '22%'
      const tint: Record<string, string> = {
        default: 'var(--surface-secondary)',
        accent: 'var(--db-primary-soft)',
        success: `color-mix(in srgb, var(--db-success) ${share}, var(--surface))`,
        warning: `color-mix(in srgb, var(--db-warning) ${share}, var(--surface))`,
        danger: `color-mix(in srgb, var(--db-danger) ${share}, var(--surface))`,
      }
      const ink: Record<string, string> = {
        default: 'var(--foreground)',
        accent: 'var(--db-primary-emphasis)',
        success: 'var(--db-success-emphasis)',
        warning: 'var(--db-warning-emphasis)',
        danger: 'var(--db-danger-emphasis)',
      }
      const solid: Record<string, [string, string]> = {
        default: ['var(--default)', 'var(--default-foreground)'],
        accent: ['var(--db-primary)', 'var(--db-primary-fg)'],
        success: ['var(--db-success)', 'var(--db-success-fg)'],
        warning: ['var(--db-warning)', 'var(--db-warning-fg)'],
        danger: ['var(--db-danger)', 'var(--db-danger-fg)'],
      }
      const want = (background: string, color: string) => {
        probe.style.background = background
        probe.style.color = color
        return [rgb(css(probe).backgroundColor), rgb(css(probe).color)]
      }
      const chips = [...container.querySelectorAll<HTMLElement>('.chip')]
      for (const c of chips) {
        const [variant, color] = c.textContent!.split(' ') as [string, string]
        const got = [rgb(css(c).backgroundColor), rgb(css(c).color)]
        const expected =
          variant === 'soft'
            ? want(tint[color]!, ink[color]!)
            : variant === 'primary'
              ? want(...solid[color]!)
              : variant === 'secondary'
                ? want('var(--surface-secondary)', ink[color]!)
                : want('transparent', ink[color]!)
        if (variant === 'tertiary') {
          expect(css(c).backgroundColor, c.textContent!).toBe('rgba(0, 0, 0, 0)')
          expect(got[1], c.textContent!).toEqual(expected[1])
          expect(css(c).borderTopWidth).toBe('1px')
          probe.style.color = 'var(--border)'
          expect(rgb(css(c).borderTopColor), c.textContent!).toEqual(rgb(css(probe).color))
        } else {
          expect(got, c.textContent!).toEqual(expected)
          expect(css(c).borderTopWidth).toBe('0px')
        }
      }
    })
  }
})

/**
 * The choices' roles reach the progress bar: its empty track is the off-track shade, and its fill starts at the
 * right in Persian. The fill is the gilt in dark and its emphasis in light, where the gilt was
 * 1.19 from the track (nontext.browser.test.tsx).
 */
describe('progress bar', () => {
  for (const theme of themes) {
    it(`${theme}: an off-track shade, filled from the right`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <ProgressBar value={40}>
            <Label>درون‌ریزی</Label>
            <ProgressBar.Output />
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </Card>,
      )
      await settled(400)
      const track = container.querySelector('.progress-bar__track')!
      const fill = container.querySelector('.progress-bar__fill')!
      expect(rgb(css(track).backgroundColor)).toEqual(rgb(token('--db-control-track')))
      expect(rgb(css(fill).backgroundColor)).toEqual(rgb(token('--db-indicator-accent')))
      expect(Math.abs(box(fill).right - box(track).right)).toBeLessThanOrEqual(0.5)
      expect(Math.abs(box(fill).width - box(track).width * 0.4)).toBeLessThanOrEqual(1)
    })
  }
})

/**
 * A progress bar is Flutter's, on the web too. The label 14 medium on a 1.35 line beside the
 * value 14 regular on a 1.5 line, centred, 4 over the track; the track 4, 8 or 20 tall and round
 * at its ends, the fill square, the neutral fill for default; indeterminate, Material's two lines.
 */
describe("progress bar, Flutter's", () => {
  const bar = (props: Record<string, unknown>) => ({ type: 'ProgressBar', props })

  it('its label and value, 4 over a track by size, a square fill', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            {
              type: 'Stack',
              props: {},
              children: [
                bar({ label: 'کوچک', value: 40, size: 'sm' }),
                bar({ label: 'میانه', value: 40 }),
                bar({ label: 'بزرگ', value: 40, size: 'lg' }),
                bar({ label: 'پیش‌فرض', value: 55, color: 'default' }),
              ],
            } as never
          }
        />
        <div className="probe" />
      </Card>,
    )
    await settled(400)
    const bars = [...container.querySelectorAll<HTMLElement>('.progress-bar')]
    for (const [i, height] of [4, 8, 20].entries()) {
      const b = bars[i]!
      const label = b.querySelector('[data-slot="label"]')!
      const value = b.querySelector('.progress-bar__output')!
      const track = b.querySelector('.progress-bar__track')!
      const fill = b.querySelector('.progress-bar__fill')!
      expect(css(label).fontSize).toBe('14px')
      expect(css(label).lineHeight).toBe('18.9px')
      expect(css(label).fontWeight).toBe('500')
      expect(css(value).lineHeight).toBe('21px')
      expect(css(value).fontWeight).toBe('400')
      const [l, v, t] = [label, value, track].map((e) => e.getBoundingClientRect())
      expect(Math.abs((l!.top + l!.bottom) / 2 - (v!.top + v!.bottom) / 2)).toBeLessThan(0.1)
      expect(t!.top - v!.bottom).toBeCloseTo(4, 1)
      expect(t!.height, `${height}`).toBe(height)
      expect(parseFloat(css(track).borderTopLeftRadius)).toBeGreaterThanOrEqual(height / 2)
      expect(css(fill).borderTopLeftRadius).toBe('0px')
      expect(css(fill).borderTopRightRadius).toBe('0px')
    }
    const probe = container.querySelector<HTMLElement>('.probe')!
    probe.style.background = 'var(--default)'
    expect(rgb(css(bars[3]!.querySelector('.progress-bar__fill')!).backgroundColor)).toEqual(
      rgb(css(probe).backgroundColor),
    )
  })

  it("indeterminate: Material's two lines over 1.8s, no block, no value", async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface tree={bar({ label: 'در حال پردازش', isIndeterminate: true }) as never} />
      </Card>,
    )
    await settled(50)
    const track = container.querySelector('.progress-bar__track')!
    const fill = container.querySelector('.progress-bar__fill')!
    expect(css(fill).display).toBe('none')
    const one = getComputedStyle(track, '::before')
    const two = getComputedStyle(track, '::after')
    expect(one.animationName).toBe('diba-progress-line-1-head, diba-progress-line-1-tail')
    expect(two.animationName).toBe('diba-progress-line-2-head, diba-progress-line-2-tail')
    expect(one.animationDuration).toBe('1.8s')
    expect(rgb(one.backgroundColor)).toEqual(rgb(token('--db-indicator-accent')))
    expect(container.querySelector('.progress-bar__output')!.textContent).toBe('')
  })
})

describe('sizes', () => {
  it('a tag’s remove button is Flutter’s 18px cross with a 24px target; spinners and avatars keep v3’s sizes', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <TagGroup aria-label="برچسب‌ها" onRemove={() => {}}>
          <TagGroup.List>
            <Tag id="a" textValue="نخی">
              نخی
              <Tag.RemoveButton aria-label="حذف" />
            </Tag>
          </TagGroup.List>
        </TagGroup>
        <Spinner aria-label="بارگذاری" />
        <Spinner size="xl" aria-label="بارگذاری" />
        <Avatar size="sm">
          <Avatar.Fallback>ک</Avatar.Fallback>
        </Avatar>
        <Avatar>
          <Avatar.Fallback>م</Avatar.Fallback>
        </Avatar>
      </Card>,
    )
    await settled(50)
    const remove = container.querySelector('.tag__remove-button')!
    // Flutter's chip, a 32px tag whose cross is 18 in a square as wide as the line.
    expect(remove.getBoundingClientRect().width).toBeCloseTo(18.9, 1)
    expect(box(remove.querySelector('svg')!).width).toBe(18)
    expect(getComputedStyle(remove, '::after').width).toBe('24px')
    expect(box(container.querySelector('.tag')!).height).toBe(32)
    const [md, xl] = container.querySelectorAll('.spinner')
    expect(css(md!).width).toBe('24px')
    expect(css(xl!).width).toBe('40px')
    expect(rgb(css(md!).color)).toEqual(rgb(token('--db-primary')))
    const [sm, mdAvatar] = container.querySelectorAll('.avatar')
    expect(box(sm!).width).toBe(32)
    expect(box(mdAvatar!).width).toBe(40)
    expect(css(sm!.querySelector('.avatar__fallback')!).fontSize).toBe('12px')
  })
})

/**
 * A tag is Flutter's chip: 28, 32 or 36 tall by size, 8px corners, 14px text. A default tag is
 * the second surface with muted text; a surface tag is the surface outlined in the border colour. A
 * chosen tag in a group of several choices starts with a gilt tick; one of a single choice does not.
 */
describe('tags', () => {
  for (const theme of themes) {
    it(`${theme}: Flutter's chip, by size and variant, with a tick on a chosen filter`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <TagGroup aria-label="کلیدواژه‌ها" size="sm" className="small">
            <TagGroup.List>
              <Tag id="a">ابریشم</Tag>
            </TagGroup.List>
          </TagGroup>
          <TagGroup
            aria-label="وضعیت"
            selectionMode="single"
            defaultSelectedKeys={['open']}
            className="single"
          >
            <TagGroup.List>
              <Tag id="open">باز</Tag>
              <Tag id="closed">بسته</Tag>
            </TagGroup.List>
          </TagGroup>
          <TagGroup
            aria-label="فیلترها"
            selectionMode="multiple"
            defaultSelectedKeys={['a']}
            variant="surface"
            size="lg"
            className="filters"
          >
            <TagGroup.List>
              <Tag id="a">موجود</Tag>
              <Tag id="b">حراج</Tag>
            </TagGroup.List>
          </TagGroup>
        </Card>,
      )
      await settled(50)
      const tag = (selector: string) => container.querySelector(selector)!
      expect(box(tag('.small .tag')).height).toBe(28)
      const closed = tag('.single .tag:not([data-selected="true"])')
      expect(box(closed).height).toBe(32)
      expect(css(closed).borderTopLeftRadius).toBe('8px')
      expect(css(closed).fontSize).toBe('14px')
      expect(rgb(css(closed).backgroundColor)).toEqual(rgb(token('--surface-secondary')))
      expect(rgb(css(closed).color)).toEqual(rgb(token('--muted')))
      expect(container.querySelector('.single [data-slot="tag-check"]')).toBeNull()

      const [chosen, plain] = container.querySelectorAll('.filters .tag')
      expect(box(plain!).height).toBe(36)
      expect(css(plain!).borderTopWidth).toBe('1px')
      expect(rgb(css(plain!).borderTopColor)).toEqual(rgb(token('--border')))
      expect(rgb(css(plain!).backgroundColor)).toEqual(rgb(token('--surface')))
      expect(plain!.querySelector('[data-slot="tag-check"]')).toBeNull()
      const tick = chosen!.querySelector('[data-slot="tag-check"]')!
      expect(rgb(css(tick).color)).toEqual(rgb(token('--db-control-on-fill')))
      // The tick leads: at the start, the right in Persian.
      expect(box(tick).left).toBeGreaterThan(box(chosen!).left + box(chosen!).width / 2)
    })
  }

  it('a spinner runs over a track ring in the off-track shade', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Spinner aria-label="بارگذاری" />
      </Card>,
    )
    await settled(50)
    const track = container.querySelector('[data-slot="spinner-track"]')!
    expect(rgb(css(track).stroke)).toEqual(rgb(token('--db-control-track')))
    expect(css(track).strokeWidth).toBe('3px')
  })
})

/** The toast queue raises a toast in the provider, at the reading start's bottom corner. */
/**
 * A tag group is Flutter's, on the web too: its InputChip, measured. A tag that does nothing
 * lies on the surface, one that can be chosen, opened or removed on the second surface, a chosen
 * one on the iris's soft fill; 17 from its words to each edge, 8 more past an icon, a tick or a
 * cross, each as wide as the line; Flutter's washes and no ring.
 */
describe("tag group, Flutter's", () => {
  const tag = (id: string, text: string, props: Record<string, unknown> = {}) => ({
    type: 'Tag',
    props: { id, ...props },
    children: text,
  })
  const group = (props: Record<string, unknown>, tags: unknown[], extra = {}) => ({
    type: 'TagGroup',
    props,
    children: tags,
    ...extra,
  })
  const stack = (...children: unknown[]) => ({ type: 'Stack', props: {}, children })
  /** The words' box, the text node's own. */
  const words = (el: Element) => {
    const cell = el.querySelector('[role="gridcell"]')!
    const text = [...cell.childNodes].find((n) => n.nodeType === 3 && n.textContent?.trim())!
    const range = document.createRange()
    range.selectNodeContents(text)
    return range.getBoundingClientRect()
  }
  async function hover(el: Element) {
    const r = el.getBoundingClientRect()
    await commands.pointer(r.left - 30, r.top - 30, 'move')
    await commands.pointer(r.left + r.width / 2, r.top + r.height / 2, 'move')
  }
  const line = 14 * 1.35

  for (const theme of themes) {
    it(`${theme}: the surface for one that does nothing, the second surface, the iris when chosen, 38% disabled`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <DibaSurface
            tree={
              stack(
                group({ label: 'هیچ' }, [
                  tag('a', 'ابریشم'),
                  tag('b', 'هدیه', { isDisabled: true }),
                ]),
                group({ label: 'چند', selectionMode: 'multiple', defaultSelectedKeys: ['a'] }, [
                  tag('a', 'موجود'),
                  tag('b', 'حراج'),
                ]),
                group({ label: 'پیوند' }, [tag('a', 'شال', { href: '/products?tag=scarf' })]),
                group({ label: 'رو', variant: 'surface', selectionMode: 'single' }, [
                  tag('a', 'باز'),
                ]),
              ) as never
            }
          />
          <div className="probe" />
        </Card>,
      )
      await settled(400)
      const probe = (colour: string) => {
        const el = container.querySelector<HTMLElement>('.probe')!
        el.style.background = colour
        return rgb(css(el).backgroundColor)
      }
      const [plain, disabled, chosen, open, link, surface] = [
        ...container.querySelectorAll<HTMLElement>('.tag'),
      ]
      const look = (el: Element) => [rgb(css(el).backgroundColor), rgb(css(el).color)]
      // One that does nothing is drawn as an unchosen one, at full strength, and a chosen one
      // is gilt with slate-700 on it.
      expect(look(plain!)).toEqual([probe('var(--surface-secondary)'), probe('var(--muted)')])
      expect(css(plain!).color).not.toMatch(/\/ 0\.38\)$/)
      expect(look(open!)).toEqual([probe('var(--surface-secondary)'), probe('var(--muted)')])
      expect(look(chosen!)).toEqual([
        probe('var(--db-control-fill)'),
        probe('var(--db-control-on-fill)'),
      ])
      expect(look(link!)[0]).toEqual(probe('var(--surface-secondary)'))
      expect(rgb(css(disabled!).backgroundColor)).toEqual(probe('var(--surface)'))
      expect(css(disabled!).opacity).toBe('1')
      expect(css(disabled!).color).toMatch(/\/ 0\.38\)$/)
      expect(rgb(css(surface!).borderTopColor)).toEqual(probe('var(--border)'))
      expect(rgb(css(surface!).backgroundColor)).toEqual(probe('var(--surface)'))
      expect(css(plain!).borderTopColor).toBe('rgba(0, 0, 0, 0)')
    })
  }

  // A click on a single choice once seemed to move nothing: the iris soft fill was all but the
  // unchosen one's.
  it('a click moves the gilt from one tag to another', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            group({ label: 'وضعیت', selectionMode: 'single', defaultSelectedKeys: ['open'] }, [
              tag('open', 'باز'),
              tag('closed', 'بسته'),
            ]) as never
          }
        />
      </Card>,
    )
    await settled(300)
    const [open, closed] = [...container.querySelectorAll<HTMLElement>('.tag')]
    const fill = (el: Element) => rgb(css(el).backgroundColor)
    expect(fill(open!)).toEqual(rgb(token('--db-control-fill')))
    expect(fill(closed!)).toEqual(rgb(token('--surface-secondary')))
    const r = closed!.getBoundingClientRect()
    await commands.pointer(r.left + r.width / 2, r.top + r.height / 2, 'move')
    await commands.pointer(r.left + r.width / 2, r.top + r.height / 2, 'down')
    await commands.pointer(r.left + r.width / 2, r.top + r.height / 2, 'up')
    await commands.pointer(1, 1, 'move')
    await settled(400)
    expect(fill(closed!)).toEqual(rgb(token('--db-control-fill')))
    expect(fill(open!)).toEqual(rgb(token('--surface-secondary')))
  })

  it('28, 32 or 36 tall with 2, 4 or 6 kept above and below, 8 apart, 17 from the words', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            stack(
              ...(['sm', 'md', 'lg'] as const).map((size) =>
                group({ label: size, size }, [tag('a', 'موجود'), tag('b', 'حراج')]),
              ),
            ) as never
          }
        />
      </Card>,
    )
    await settled(100)
    for (const [i, [height, keep]] of (
      [
        [28, 2],
        [32, 4],
        [36, 6],
      ] as const
    ).entries()) {
      const g = container.querySelectorAll('.tag-group')[i]!
      const [a, b] = [...g.querySelectorAll('.tag')]
      expect(box(a!).height).toBe(height)
      expect(css(a!).marginTop).toBe(`${keep}px`)
      expect(css(a!).marginBottom).toBe(`${keep}px`)
      expect(box(g.querySelector('.tag-group__list')!).height).toBe(height + 2 * keep)
      // Right to left: the second 8 after the first.
      expect(box(a!).left - box(b!).right).toBe(8)
      const w = words(a!)
      const r = a!.getBoundingClientRect()
      expect(w.left - r.left).toBeCloseTo(17, 1)
      expect(r.right - w.right).toBeCloseTo(17, 1)
      expect(css(a!).borderTopLeftRadius).toBe('8px')
      expect(css(a!).fontSize).toBe('14px')
      expect(css(a!).fontWeight).toBe('500')
      expect(css(a!).lineHeight).toBe('18.9px')
    }
    // The group's name 4 over the list, so 8 over the first tag at md.
    const md = container.querySelectorAll('.tag-group')[1]!
    const name = md.querySelector('[data-slot="label"]')!
    expect(box(md.querySelector('.tag')!).top - box(name).bottom).toBe(8)
  })

  it("a chosen tag among several leads with Material's tick, as wide as the line; an icon too", async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            stack(
              group({ label: 'چند', selectionMode: 'multiple', defaultSelectedKeys: ['a', 'c'] }, [
                tag('a', 'موجود'),
                tag('b', 'شال', { icon: 'tag' }),
                tag('c', 'حراج', { icon: 'tag' }),
              ]),
            ) as never
          }
        />
        <div className="probe" />
      </Card>,
    )
    await settled(400)
    const [chosen, withIcon, chosenWithIcon] = [...container.querySelectorAll('.tag')]
    const tick = chosen!.querySelector('[data-slot="tag-check"]')!
    const r = chosen!.getBoundingClientRect()
    expect(tick.getBoundingClientRect().width).toBeCloseTo(line, 1)
    expect(tick.querySelector('path')!.getAttribute('d')).toBe('M5.7 11.1L10.2 15.6L18.3 7.5')
    expect(tick.getAttribute('stroke-width')).toBe('2')
    expect(css(tick.querySelector('path')!).strokeDashoffset).toBe('0px')
    // At the start, the right in Persian: 9 in from the edge, the words 8 after it.
    expect(r.right - tick.getBoundingClientRect().right).toBeCloseTo(9, 1)
    expect(tick.getBoundingClientRect().left - words(chosen!).right).toBeCloseTo(8, 1)
    expect(rgb(css(tick).color)).toEqual(rgb(token('--db-control-on-fill')))
    const tr = tick.getBoundingClientRect()
    expect(tr.top + tr.height / 2).toBeCloseTo(r.top + r.height / 2, 1)
    // An icon is 16 in the same square, in the muted colour until chosen.
    const icon = withIcon!.querySelector('[role="gridcell"] > svg')!
    expect(box(icon).width).toBe(16)
    const w = withIcon!.getBoundingClientRect()
    expect(w.right - icon.getBoundingClientRect().right).toBeCloseTo(9 + (line - 16) / 2, 1)
    expect(rgb(css(icon).color)).toEqual(rgb(token('--muted')))
    // Chosen with an icon: the tick takes its square, the words where they were.
    const over = chosenWithIcon!.querySelector('[data-slot="tag-check"]')!
    const under = chosenWithIcon!.querySelector(
      '[role="gridcell"] > svg:not([data-slot="tag-check"])',
    )!
    expect(css(under).display).toBe('none')
    expect(
      chosenWithIcon!.getBoundingClientRect().right - over.getBoundingClientRect().right,
    ).toBeCloseTo(9, 1)
    expect(
      chosenWithIcon!.getBoundingClientRect().right - words(chosenWithIcon!).right,
    ).toBeCloseTo(17 + line, 1)
  })

  it("a removable tag ends in Material's cross, 18 in a square as wide as the line", async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            stack(
              group({ label: 'کلیدواژه‌ها' }, [tag('a', 'ابریشم')], {
                actions: { onRemove: { do: 'call', action: 'keyword.remove', value: 'tag' } },
              }),
              group({ label: 'هیچ', emptyMessage: 'هنوز برچسبی نیست.' }, []),
            ) as never
          }
        />
      </Card>,
    )
    await settled(100)
    const t = container.querySelector('.tag')!
    const cross = t.querySelector('.tag__remove-button')!
    const r = t.getBoundingClientRect()
    const c = cross.getBoundingClientRect()
    expect(c.width).toBeCloseTo(line, 1)
    expect(c.left - r.left).toBeCloseTo(9, 1)
    expect(words(t).left - c.right).toBeCloseTo(8, 1)
    expect(box(cross.querySelector('svg')!).width).toBe(18)
    expect(cross.querySelector('path')!.getAttribute('d')).toMatch(/^M19 6\.41 17\.59 5 12 10\.59/)
    expect(rgb(css(cross).color)).toEqual(rgb(token('--muted')))
    expect(css(cross).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    // Removable, it is on the second surface; nothing else about it is chosen.
    expect(rgb(css(t).backgroundColor)).toEqual(rgb(token('--surface-secondary')))
    const empty = container.querySelector('.tag-group__empty')!
    expect(css(empty).fontSize).toBe('14px')
    expect(css(empty).lineHeight).toBe('21px')
    expect(css(empty).fontWeight).toBe('400')
    expect(rgb(css(empty).color)).toEqual(rgb(token('--muted')))
  })

  for (const theme of themes) {
    it(`${theme}: Flutter's washes, hovered, focused and pressed, and no ring`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <DibaSurface
            tree={
              stack(
                group({ label: 'یکی', selectionMode: 'single' }, [
                  tag('a', 'باز'),
                  tag('b', 'بسته'),
                ]),
                group({ label: 'هیچ' }, [tag('a', 'ابریشم')]),
              ) as never
            }
          />
        </Card>,
      )
      await settled(100)
      const [open, closed, plain] = [...container.querySelectorAll('.tag')]
      // Flutter's theme's own washes, as tokens: black at 4% and 12% and a 40% grey; white and a
      // 25% grey in dark.
      const [hoverWash, focusWash, pressWash] = [
        '--db-state-hover',
        '--db-state-focus',
        '--db-state-press',
      ].map((t) => token(t).trim())
      expect([hoverWash, focusWash, pressWash]).toEqual(
        theme === 'light'
          ? ['oklch(0 0 0 / 0.04)', 'oklch(0 0 0 / 0.12)', 'oklch(0.795 0 0 / 0.4)']
          : ['oklch(1 0 0 / 0.04)', 'oklch(1 0 0 / 0.12)', 'oklch(0.845 0 0 / 0.25)'],
      )
      await hover(open!)
      await settled(50)
      expect(css(open!).backgroundImage).toContain(hoverWash)
      expect(css(open!).cursor).toBe('pointer')
      // One that does nothing is not washed.
      await hover(plain!)
      await settled(50)
      expect(css(plain!).backgroundImage).not.toContain(hoverWash)
      expect(css(plain!).cursor).toBe('default')
      const r = closed!.getBoundingClientRect()
      await commands.pointer(r.left + r.width / 2, r.top + r.height / 2, 'move')
      await commands.pointer(r.left + r.width / 2, r.top + r.height / 2, 'down')
      await settled(50)
      expect(css(closed!).backgroundImage).toContain(pressWash)
      await commands.pointer(r.left + r.width / 2, r.top + r.height / 2, 'up')
      await commands.pointer(1, 1, 'move')
      await settled(50)
      await userEvent.tab()
      await settled(50)
      const focused = container.querySelector('.tag[data-focus-visible="true"]')!
      expect(focused).not.toBeNull()
      expect(css(focused).backgroundImage).toContain(focusWash)
      expect(css(focused).outlineStyle).toBe('none')
      expect(css(focused).boxShadow).toBe('none')
    })
  }
})

describe('toast', () => {
  for (const theme of themes) {
    it(`${theme}: a success toast, bottom right in Persian, reading at AA`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <ToastProvider placement="bottom start" />
        </Card>,
      )
      act(() => {
        toast.success('محصول ذخیره شد')
      })
      await settled(600)
      const shown = document.querySelector('.toast--success')!
      expect(shown).not.toBeNull()
      const title = shown.querySelector('.toast__title')!
      expect(title).toHaveTextContent('محصول ذخیره شد')
      expect(textContrast(title)).toBeGreaterThanOrEqual(4.5)
      expect(box(shown).right).toBeGreaterThan(1280 / 2)
      act(() => toast.clear())
      await settled(400)
      expect(container).toBeDefined()
    })
  }
})

/**
 * The mark is 20 across in its 24 box, the status's or a tree's own icon alike; at the start,
 * 16 in, the words 16 after it.
 */
describe('alert mark', () => {
  it('the status’s mark and a tree’s own icon: 20 in a 24 box, the words 16 after it', async () => {
    const { container } = render(
      <Card theme="light">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>پرداخت انجام نشد</Alert.Title>
            </Alert.Content>
          </Alert>
          <DibaSurface
            tree={
              {
                type: 'Alert',
                props: { status: 'accent', title: 'کد تخفیف فعال شد', icon: 'sparkles' },
              } as never
            }
          />
        </div>
      </Card>,
    )
    await settled(50)
    const alerts = [...container.querySelectorAll('.alert')]
    expect(alerts).toHaveLength(2)
    for (const alert of alerts) {
      const indicator = alert.querySelector('.alert__indicator')!
      const mark = indicator.querySelector('svg')!
      const title = alert.querySelector('.alert__title')!
      expect([box(indicator).width, box(indicator).height]).toEqual([24, 24])
      expect([box(mark).width, box(mark).height]).toEqual([20, 20])
      // Right to left: the mark at the start, the right, 16 in; the words 16 after it.
      expect(box(alert).right - box(indicator).right).toBe(16)
      expect(box(indicator).left - box(title).right).toBe(16)
    }
  })
})
