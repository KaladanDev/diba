import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { commands, page, userEvent } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider, type DibaTheme } from '../../provider/DibaProvider'
import { Button } from '../../index'
import { DibaSurface } from '../../sdui'
import { box, settled, textContrast, toRgb } from '../../test/visual'

const themes: DibaTheme[] = ['light', 'dark']
const variants = [
  'primary',
  'secondary',
  'tertiary',
  'outline',
  'ghost',
  'danger',
  'danger-soft',
] as const

/**
 * A card, as an admin section draws one: the copied surface and foreground. The original leaves the
 * page's own colours to the app, and a tertiary button inherits its text from here. Motion is
 * off, through the copy's own `data-reduce-motion`, so a colour is read after it lands, not
 * mid-transition.
 */
function Card({
  theme,
  dir = 'rtl',
  children,
}: {
  theme: DibaTheme
  dir?: 'rtl' | 'ltr'
  children: ReactNode
}) {
  return (
    <DibaProvider theme={theme} locale={dir === 'rtl' ? 'fa-IR' : 'en-US'} dir={dir}>
      <div
        data-reduce-motion="true"
        style={{ background: 'var(--surface)', color: 'var(--foreground)', padding: 16 }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name)
const rgb = (css: string) => toRgb(css.trim())

/**
 * v3's sizes, which are Diba's size tokens. v3 is responsive: from 768px wide a button is 32, 36
 * or 40 tall, and below it 36, 40 or 44, a bigger target for a finger.
 */
describe('button geometry', () => {
  const sizes = { desktop: [32, 36, 40], phone: [36, 40, 44] } as const
  for (const [screen, heights] of Object.entries(sizes)) {
    it(`${screen}: sm, md and lg are ${heights.join(', ')} tall, pills, and square when icon-only`, async () => {
      if (screen === 'desktop') await page.viewport(1280, 800)
      else await page.viewport(390, 844)
      const { container } = render(
        <Card theme="light">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <span key={size}>
              <Button size={size}>ذخیره</Button>
              <Button size={size} isIconOnly aria-label="حذف">
                ×
              </Button>
            </span>
          ))}
        </Card>,
      )
      await settled(50)
      const buttons = [...container.querySelectorAll('.button')]
      buttons.forEach((button, i) => {
        const want = heights[Math.floor(i / 2)]!
        const { height, width } = box(button)
        expect(height, button.className).toBe(want)
        if (button.classList.contains('button--icon-only')) expect(width).toBe(want)
        expect(getComputedStyle(button).borderRadius).toBe('24px')
      })
    })
  }
})

/**
 * Each variant's colours are Diba's roles, as admin-web set them: the gilt accent with its own
 * text, slate for secondary, tertiary, outline and ghost, and the danger tones. The secondary
 * button's text is slate (Diba's theme), not the original accent-soft text, which on a gilt accent
 * is a brown.
 */
describe('button colours', () => {
  beforeEach(async () => {
    await page.viewport(1280, 800)
  })

  for (const theme of themes) {
    const slate = (light: number, dark: number) =>
      rgb(token(`--db-slate-${theme === 'light' ? light : dark}`))

    it(`${theme}: fills and text follow Diba's roles`, async () => {
      const { container } = render(
        <Card theme={theme}>
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </Card>,
      )
      await settled(50)
      const style = (variant: string) =>
        getComputedStyle(container.querySelector(`.button--${variant}`)!)

      expect(rgb(style('primary').backgroundColor)).toEqual(rgb(token('--db-primary')))
      expect(rgb(style('primary').color)).toEqual(rgb(token('--db-primary-fg')))
      expect(rgb(style('secondary').backgroundColor)).toEqual(slate(200, 800))
      expect(rgb(style('secondary').color)).toEqual(slate(700, 200))
      expect(rgb(style('tertiary').backgroundColor)).toEqual(slate(200, 800))
      expect(rgb(style('tertiary').color)).toEqual(slate(800, 100))
      expect(rgb(style('ghost').color)).toEqual(slate(700, 200))
      expect(rgb(style('outline').color)).toEqual(slate(700, 200))
      expect(style('outline').borderTopWidth).toBe('1px')
      expect(rgb(style('outline').borderTopColor)).toEqual(slate(200, 800))
      expect(rgb(style('danger').backgroundColor)).toEqual(rgb(token('--db-danger')))
      expect(rgb(style('danger').color)).toEqual(rgb(token('--db-danger-fg')))
    })

    it(`${theme}: every variant's label clears AA on what is behind it`, async () => {
      const { container } = render(
        <Card theme={theme}>
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </Card>,
      )
      await settled(50)
      const failures = [...container.querySelectorAll('.button')]
        .map((button) => ({ variant: button.textContent, ratio: textContrast(button) }))
        .filter((r) => r.ratio < 4.5)
      expect(failures, JSON.stringify(failures)).toEqual([])
    })
  }
})

describe('button focus', () => {
  it('draws a 2px ring in Diba’s ring colour when reached by keyboard', async () => {
    const { container } = render(
      <Card theme="light">
        <Button>ذخیره</Button>
      </Card>,
    )
    await userEvent.tab()
    const button = container.querySelector('.button')!
    expect(button).toHaveAttribute('data-focus-visible', 'true')
    const shadow = getComputedStyle(button).boxShadow
    expect(shadow).toContain('0px 0px 0px 2px')
  })
})

describe('button direction', () => {
  it('puts a leading icon on the right in Persian, and on the left in English', async () => {
    for (const dir of ['rtl', 'ltr'] as const) {
      const { container, unmount } = render(
        <Card theme="light" dir={dir}>
          <Button>
            <svg viewBox="0 0 16 16" aria-hidden />
            <span>ذخیره</span>
          </Button>
        </Card>,
      )
      await settled(50)
      const icon = box(container.querySelector('.button svg')!)
      const label = box(container.querySelector('.button span')!)
      if (dir === 'rtl') expect(icon.left).toBeGreaterThan(label.left)
      else expect(icon.left).toBeLessThan(label.left)
      unmount()
    }
  })
})

/**
 * A button that shows only its icon says its label in a tooltip, as Flutter's renderer always has
 *: the copied tooltip, above the button and 10 off it,
 * after half a second under a hover, or at once under keyboard focus. A labelled button has none.
 * packages/flutter/test/actions_look_test.dart holds Flutter to the same.
 */
describe('an icon-only action says its label', () => {
  const surface = (tree: Record<string, unknown>) =>
    render(
      <Card theme="light">
        <div style={{ paddingTop: 80 }}>
          <DibaSurface tree={tree as never} />
        </div>
      </Card>,
    )
  const tip = () => document.querySelector('.tooltip')

  /** The pointer onto [el] from beside it, as a mouse arrives: React Aria counts a hover once the pointer has moved. */
  async function hover(el: Element) {
    const r = el.getBoundingClientRect()
    await commands.pointer(r.left - 30, r.top + r.height / 2, 'move')
    await commands.pointer(r.left + r.width / 2, r.top + r.height / 2, 'move')
  }

  const trees: [string, Record<string, unknown>][] = [
    ['a Button', { type: 'Button', props: { icon: 'pencil', isIconOnly: true, label: 'ویرایش' } }],
    [
      'a LinkButton',
      {
        type: 'LinkButton',
        props: { href: '/settings', icon: 'settings', isIconOnly: true, label: 'ویرایش' },
      },
    ],
    [
      'a ToggleButton',
      {
        type: 'ToggleButtonGroup',
        props: { label: 'قلم' },
        children: [
          {
            type: 'ToggleButton',
            props: { id: 'b', icon: 'bold', isIconOnly: true, label: 'ویرایش' },
          },
        ],
      },
    ],
  ]

  for (const [name, tree] of trees) {
    it(`${name}: under a hover, after half a second, above it`, async () => {
      await page.viewport(1280, 800)
      const { container } = surface(tree)
      await settled(50)
      const target = container.querySelector('[aria-label="ویرایش"]')!
      await hover(target)
      await settled(200)
      expect(tip()).toBeNull()
      await settled(500)
      expect(tip()?.textContent).toBe('ویرایش')
      const bubble = box(tip()!)
      expect(Math.round(box(target).top - bubble.bottom)).toBe(10)
      expect(getComputedStyle(tip()!).fontSize).toBe('12px')
      expect(tip()!.querySelector('[data-slot="overlay-arrow"]')).not.toBeNull()
      // Away, and past React Aria's warm-up: for a moment after one tooltip, the next opens at
      // once.
      await commands.pointer(1, 1, 'move')
      await settled(1500)
    })
  }

  // On a right-to-left page tall enough to scroll, Chrome puts the scrollbar on the left and the
  // page starts its width in, which React Aria did not count while overlays went to the bare body:
  // the tooltip sat 15px to the right of its button. This browser
  // hides its scrollbars, so the test holds the cause: overlays go to the page's own layer, an
  // ordinary positioned element that React Aria measures right.
  it("in the page's layer, its arrow over the button's middle", async () => {
    const { container } = surface(trees[0]![1])
    await userEvent.tab()
    await settled(50)
    const layer = tip()!.closest('[data-diba-overlays]')!
    expect(layer).not.toBeNull()
    expect(layer.parentElement).toBe(document.body)
    expect(getComputedStyle(layer).position).toBe('absolute')
    // The arrow, which stays over the button where the bubble keeps clear of the page's edge.
    const target = box(container.querySelector('[aria-label="ویرایش"]')!)
    const arrow = box(tip()!.querySelector('[data-slot="overlay-arrow-group"]')!)
    // Within a pixel, its rounding; the shift was 15.
    expect(
      Math.abs(arrow.left + arrow.width / 2 - (target.left + target.width / 2)),
    ).toBeLessThanOrEqual(1)
  })

  // Positioning the body itself fixed that and broke this: React Aria took the body to be the
  // window's height, and on a page taller than the window hung the tooltip below its button.
  it('above its button on a page taller than the window', async () => {
    await page.viewport(1280, 400)
    const tall = document.createElement('div')
    tall.style.height = '1600px'
    document.body.append(tall)
    try {
      const { container } = surface(trees[0]![1])
      await userEvent.tab()
      await settled(50)
      const target = box(container.querySelector('[aria-label="ویرایش"]')!)
      expect(tip()!.getAttribute('data-placement')).toBe('top')
      expect(Math.round(target.top - box(tip()!).bottom)).toBe(10)
    } finally {
      tall.remove()
      await page.viewport(1280, 800)
    }
  })

  it('below it, 10 off, with no room above', async () => {
    const { container } = render(
      <Card theme="light">
        <DibaSurface tree={trees[0]![1] as never} />
      </Card>,
    )
    await userEvent.tab()
    await settled(50)
    const target = box(container.querySelector('[aria-label="ویرایش"]')!)
    expect(tip()!.getAttribute('data-placement')).toBe('bottom')
    expect(Math.round(box(tip()!).top - target.bottom)).toBe(10)
  })

  it('under keyboard focus, at once', async () => {
    const { container } = surface(trees[0]![1])
    await userEvent.tab()
    await settled(50)
    expect(document.activeElement).toBe(container.querySelector('[aria-label="ویرایش"]'))
    expect(tip()?.textContent).toBe('ویرایش')
  })

  it('a labelled button has none', async () => {
    const { container } = surface({ type: 'Button', props: { icon: 'pencil' }, children: 'ویرایش' })
    await settled(50)
    await hover(container.querySelector('.button')!)
    await settled(900)
    expect(tip()).toBeNull()
  })
})
