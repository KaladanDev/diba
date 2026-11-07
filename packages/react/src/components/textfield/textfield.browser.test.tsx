import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { page, userEvent } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider, type DibaTheme } from '../../provider/DibaProvider'
import {
  Description,
  FieldError,
  Input,
  Label,
  NumberField,
  SearchField,
  TextField,
} from '../../index'
import { box, settled, textContrast, toRgb } from '../../test/visual'
import { DibaSurface } from '../../sdui'

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

function Field({ invalid = false }: { invalid?: boolean }) {
  return (
    <TextField isInvalid={invalid}>
      <Label>نام فروشگاه</Label>
      <Input defaultValue="کالادان" />
      <Description>همان‌طور که در فروشگاه دیده می‌شود.</Description>
      <FieldError>نام لازم است.</FieldError>
    </TextField>
  )
}

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name)
const rgb = (css: string) => toRgb(css.trim())

/**
 * v3's field, which is Diba's: 36 tall with 14px text from 640px wide, and below that 40
 * tall with 16px text, so a phone does not zoom into it. The radius is 12.
 */
describe('field geometry', () => {
  for (const [screen, width, height, font] of [
    ['desktop', 1280, 36, '14px'],
    ['phone', 390, 40, '16px'],
  ] as const) {
    it(`${screen}: an input is ${height} tall, with ${font} text`, async () => {
      await page.viewport(width, 800)
      const { container } = render(
        <Card theme="light">
          <Field />
        </Card>,
      )
      await settled(50)
      const input = container.querySelector('.input')!
      expect(box(input).height).toBe(height)
      expect(getComputedStyle(input).fontSize).toBe(font)
      expect(getComputedStyle(input).borderTopLeftRadius).toBe('12px')
    })
  }
})

/**
 * The colours are the admin's: a paper or slate field, slate text, the muted note, the danger
 * error. An invalid field's label keeps the text colour, as Flutter's does (v3 turns it
 * danger). Each clears AA where it is drawn.
 */
describe('field colours', () => {
  for (const theme of themes) {
    it(`${theme}: label, value, note and error follow Diba's roles, and clear AA`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <div className="valid">
            <Field />
          </div>
          <div className="invalid">
            <Field invalid />
          </div>
        </Card>,
      )
      await settled(50)
      const slate = (light: number, dark: number) =>
        rgb(token(`--db-slate-${theme === 'light' ? light : dark}`))
      const valid = (selector: string) => container.querySelector(`.valid ${selector}`)!
      const invalid = (selector: string) => container.querySelector(`.invalid ${selector}`)!
      const danger = rgb(token('--db-danger'))

      expect(rgb(getComputedStyle(valid('.input')).backgroundColor)).toEqual(
        theme === 'light' ? rgb(token('--db-paper-0')) : slate(0, 900),
      )
      expect(rgb(getComputedStyle(valid('.input')).color)).toEqual(slate(800, 100))
      expect(rgb(getComputedStyle(valid('.label')).color)).toEqual(slate(800, 100))
      // An invalid field's label keeps its colour; the error is red.
      expect(rgb(getComputedStyle(invalid('.label')).color)).toEqual(slate(800, 100))
      expect(rgb(getComputedStyle(invalid('.field-error')).color)).toEqual(danger)
      for (const el of [
        valid('.input'),
        valid('.label'),
        valid('.description'),
        invalid('.label'),
        invalid('.field-error'),
      ]) {
        expect(textContrast(el), el.className).toBeGreaterThanOrEqual(4.5)
      }
    })
  }
})

describe('field focus', () => {
  it('draws Diba’s 2px ring around a focused input', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <Field />
      </Card>,
    )
    await userEvent.tab()
    const input = container.querySelector('.input')!
    expect(document.activeElement).toBe(input)
    expect(getComputedStyle(input).boxShadow).toContain('0px 0px 0px 2px')
  })
})

/**
 * A resting field has Flutter's 1px edge, slate-200 in light and slate-700 in dark,
 * drawn as its shadow so it stays 36 tall. Light had the original's soft shadow, which left an empty
 * field nearly invisible on a white card; dark had nothing. A secondary field keeps the edge too.
 */
describe('a resting field’s edge', () => {
  const edge = (el: Element) =>
    getComputedStyle(el).boxShadow.match(/((?:rgba?|oklch|color)\([^)]*\)) 0px 0px 0px 1px/)

  for (const theme of themes) {
    const slate = theme === 'dark' ? '--db-slate-700' : '--db-slate-200'
    it(`${theme}: a 1px ${slate.slice(5)} edge, at the same height`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <Field />
          <TextField variant="secondary">
            <Label>شناسه</Label>
            <Input defaultValue="SKU-07" />
          </TextField>
        </Card>,
      )
      await settled(50)
      const [input, secondary] = container.querySelectorAll('.input')
      for (const field of [input!, secondary!]) {
        const hairline = edge(field)
        expect(hairline, getComputedStyle(field).boxShadow).not.toBeNull()
        expect(rgb(hairline![1]!)).toEqual(rgb(token(slate)))
      }
      expect(box(input!).height).toBe(36)
    })
  }
})

/**
 * An invalid field's label keeps the text colour, as Flutter's does; the error under it is
 * the one thing in red, with the field's own edge.
 */
describe('an invalid field', () => {
  for (const theme of themes) {
    it(`${theme}: the label keeps the text colour, the error is red`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <Field invalid />
        </Card>,
      )
      await settled(50)
      const label = container.querySelector('.label')!
      const error = container.querySelector('[data-slot="field-error"]')!
      expect(rgb(getComputedStyle(label).color)).toEqual(rgb(token('--foreground')))
      expect(rgb(getComputedStyle(error).color)).toEqual(rgb(token('--db-danger')))
    })
  }
})

/** a number field with both steppers centres its value between them, as Flutter's does. */
describe('number field value', () => {
  it('sits centred between − and +, and at the start without them', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <NumberField defaultValue={1250} aria-label="وزن">
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
        <NumberField defaultValue={1250} aria-label="قیمت">
          <NumberField.Group>
            <NumberField.Input />
          </NumberField.Group>
        </NumberField>
      </Card>,
    )
    await settled(50)
    const [stepped, plain] = container.querySelectorAll('.number-field__input')
    expect(getComputedStyle(stepped!).textAlign).toBe('center')
    expect(getComputedStyle(plain!).textAlign).not.toBe('center')
  })
})

describe('search field direction', () => {
  it('puts the search icon at the start, on the right in Persian, and the clear button at the end', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <SearchField aria-label="جستجو" defaultValue="شال">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </Card>,
    )
    await settled(50)
    const icon = box(container.querySelector('.search-field__search-icon')!)
    const input = box(container.querySelector('.search-field__input')!)
    const clear = box(container.querySelector('.search-field__clear-button')!)
    expect(icon.left).toBeGreaterThan(input.left)
    expect(clear.right).toBeLessThanOrEqual(input.left + 1)
  })
})

/** A block, as a tree draws it. */
const block = (type: string, props: Record<string, unknown>) => ({ type, props })

/** The box a field draws: its input, or the group round it. */
const fieldBox = (field: Element) =>
  field.querySelector(
    '.input-group, .search-field__group, .number-field__group, .date-input-group, .textarea, .input',
  )!

/**
 * The text fields are in Diba's look, and these are the four things the web changed for
 * it. A secondary field is Flutter's: the second surface inside its edge, a slate step further
 * under a hover. The original's was slate-200 inside its own slate-200 edge, which hid it in light.
 */
describe('a secondary field', () => {
  for (const theme of themes) {
    const [fill, hover] =
      theme === 'dark' ? ['--db-slate-800', '--db-slate-700'] : ['--db-slate-100', '--db-slate-200']
    it(`${theme}: ${fill.slice(5)} inside its edge, ${hover.slice(5)} under a hover`, async () => {
      await page.viewport(1280, 800)
      const secondary = { label: 'نام', variant: 'secondary' }
      const { container } = render(
        <Card theme={theme}>
          <DibaSurface
            tree={
              {
                type: 'Stack',
                children: [
                  block('TextField', secondary),
                  block('TextField', { ...secondary, suffix: 'تومان' }),
                  block('TextArea', secondary),
                  block('SearchField', secondary),
                  block('NumberField', secondary),
                  block('DateField', secondary),
                ],
              } as never
            }
          />
        </Card>,
      )
      await settled(50)
      const boxes = [
        ...container.querySelectorAll('.textfield, .search-field, .number-field, .date-picker'),
      ].map(fieldBox)
      expect(boxes).toHaveLength(6)
      // The pointer stays where the last test left it, over the first field.
      await userEvent.unhover(boxes[0]!)
      await settled(250)
      for (const field of boxes) {
        for (const transition of field.getAnimations()) transition.finish()
        const style = getComputedStyle(field)
        expect(rgb(style.backgroundColor), field.className).toEqual(rgb(token(fill)))
        expect(style.boxShadow, field.className).toMatch(/0px 0px 0px 1px/)
      }
      await userEvent.hover(boxes[0]!)
      await settled(250)
      expect(rgb(getComputedStyle(boxes[0]!).backgroundColor)).toEqual(rgb(token(hover)))
    })
  }
})

/**
 * Every text field is 40 tall under 640 wide, with 16px text, as the original's own text field is;
 * The original held a search, number or date field at 36 there and clipped its input inside.
 */
describe('a text field’s height', () => {
  for (const [screen, width, height] of [
    ['desktop', 1280, 36],
    ['phone', 390, 40],
  ] as const) {
    it(`${screen}: every kind is ${height} tall`, async () => {
      await page.viewport(width, 800)
      const { container } = render(
        <Card theme="light">
          <DibaSurface
            tree={
              {
                type: 'Stack',
                children: [
                  block('TextField', { label: 'نام' }),
                  block('TextField', { label: 'قیمت', suffix: 'تومان' }),
                  block('SearchField', { label: 'جستجو' }),
                  block('NumberField', { label: 'وزن', defaultValue: 2 }),
                  block('DateField', { label: 'تاریخ', defaultValue: '2026-10-22' }),
                ],
              } as never
            }
          />
        </Card>,
      )
      await settled(50)
      const boxes = [
        ...container.querySelectorAll('.textfield, .search-field, .number-field, .date-picker'),
      ].map(fieldBox)
      expect(boxes).toHaveLength(5)
      for (const field of boxes) expect(box(field).height, field.className).toBe(height)
    })
  }
})

/**
 * A toman field's word sits inside it, beside the figure, as a text field's suffix does: 14
 * in the placeholder colour, 12 from the figure and from the end. The original's grid had no column for
 * it, and it fell under the field, out of sight.
 */
describe('a toman field’s word', () => {
  it('sits inside the field, at the end, 12 from the figure and from the end or the plus', async () => {
    await page.viewport(1280, 800)
    const toman = { formatStyle: 'currency', currency: 'IRT', defaultValue: 1250000 }
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            {
              type: 'Stack',
              children: [
                block('NumberField', { label: 'قیمت', hideSteppers: true, ...toman }),
                block('NumberField', { label: 'قیمت', ...toman }),
              ],
            } as never
          }
        />
      </Card>,
    )
    await settled(50)
    const [plain, stepped] = container.querySelectorAll('.number-field__group')
    // At rest: the pointer stays where the last test left it.
    for (const group of [plain!, stepped!]) await userEvent.unhover(group)
    await settled(250)
    for (const group of [plain!, stepped!]) {
      const unit = group.querySelector('[data-slot="unit"]')!
      const input = group.querySelector('.number-field__input')!
      const g = box(group)
      const u = box(unit)
      expect(u.top).toBeGreaterThanOrEqual(g.top)
      expect(u.bottom).toBeLessThanOrEqual(g.bottom)
      // Right to left: the end is the left.
      expect(u.right).toBe(box(input).left)
      expect(getComputedStyle(input).paddingInlineEnd).toBe('0px')
      const style = getComputedStyle(unit)
      expect(style.paddingInlineStart).toBe('12px')
      expect(style.paddingInlineEnd).toBe('12px')
      expect(style.fontSize).toBe('14px')
      expect(rgb(style.color)).toEqual(rgb(token('--muted')))
      expect(textContrast(unit)).toBeGreaterThanOrEqual(4.5)
    }
    expect(box(plain!.querySelector('[data-slot="unit"]')!).left).toBe(box(plain!).left)
    expect(box(stepped!.querySelector('[data-slot="unit"]')!).left).toBe(
      box(stepped!.querySelector('.number-field__increment-button')!).right,
    )
  })
})

/**
 * A text field's prefix and suffix are in the muted colour, which clears AA. The original's were
 * the placeholder colour, 2.6:1 on a white field.
 */
describe('a text field’s affix', () => {
  for (const theme of themes) {
    it(`${theme}: muted, and clears AA`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <DibaSurface
            tree={
              {
                type: 'Stack',
                children: [
                  block('TextField', { label: 'قیمت', suffix: 'تومان' }),
                  block('TextField', { label: 'نشانی', prefix: 'kaladan.shop/', dir: 'ltr' }),
                ],
              } as never
            }
          />
        </Card>,
      )
      await settled(50)
      const affixes = [...container.querySelectorAll('.input-group__prefix, .input-group__suffix')]
      expect(affixes).toHaveLength(2)
      // At rest: under a hover the field steps darker, and the words come to 4.49:1.
      for (const affix of affixes) await userEvent.unhover(affix.parentElement!)
      await settled(250)
      for (const affix of affixes) {
        expect(rgb(getComputedStyle(affix).color)).toEqual(rgb(token('--muted')))
        expect(textContrast(affix)).toBeGreaterThanOrEqual(4.5)
      }
    })
  }
})

/**
 * In a narrow field the text shrinks, so a search field's clear button stays inside it.
 * The original let an input keep a browser input's own width, about 180px, which pushed it out.
 */
describe('a narrow search field', () => {
  it('keeps its clear button inside it', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <div style={{ width: 190 }}>
          <DibaSurface
            tree={
              {
                type: 'Stack',
                children: [block('SearchField', { label: 'جستجو', defaultValue: 'DB-1041' })],
              } as never
            }
          />
        </div>
      </Card>,
    )
    await settled(50)
    const group = box(container.querySelector('.search-field__group')!)
    const clear = box(container.querySelector('.search-field__clear-button')!)
    const input = box(container.querySelector('.search-field__input')!)
    expect(clear.left).toBe(group.left + 8)
    expect(input.left).toBeGreaterThanOrEqual(clear.right)
    expect(input.right).toBeLessThanOrEqual(group.right)
  })
})

/**
 * An empty date field's placeholders keep their colours when it is invalid, as an empty text
 * field's placeholder does. The original turned them red.
 */
describe('an empty, invalid date field', () => {
  it('keeps its placeholders grey', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={block('DateField', { label: 'تولد', errorMessage: 'تاریخ را بنویسید.' }) as never}
        />
      </Card>,
    )
    await settled(50)
    const segments = [...container.querySelectorAll('.date-input-group__segment')]
    const words = segments.filter((s) => s.getAttribute('data-placeholder') === 'true')
    const slashes = segments.filter((s) => s.getAttribute('data-type') === 'literal')
    expect(words.length).toBe(3)
    for (const s of words)
      expect(rgb(getComputedStyle(s).color)).toEqual(rgb(token('--field-placeholder')))
    for (const s of slashes) expect(rgb(getComputedStyle(s).color)).toEqual(rgb(token('--muted')))
    expect(
      rgb(getComputedStyle(fieldBox(container.querySelector('.date-picker')!)).outlineColor),
    ).toEqual(rgb(token('--danger')))
  })
})
