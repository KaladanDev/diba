import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { page, userEvent } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider, type DibaTheme } from '../../provider/DibaProvider'
import { Dropdown, Button, Input, Label, ListBox, Select, TextField } from '../../index'
import { box, settled, textContrast, toRgb, toRgba } from '../../test/visual'
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

const cities = ['تهران', 'شیراز', 'تبریز']

function City({ defaultSelectedKey }: { defaultSelectedKey?: string }) {
  return (
    <Select placeholder="انتخاب کنید" defaultSelectedKey={defaultSelectedKey}>
      <Label>شهر</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {cities.map((city) => (
            <ListBox.Item key={city} id={city} textValue={city}>
              {city}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name)
const rgb = (css: string) => toRgb(css.trim())

/**
 * A select sits in a form beside text fields, so it is as tall as one: 36 from 640px wide, and
 * 40 with 16px text below that.
 */
describe('select geometry', () => {
  for (const [screen, width, height, font] of [
    ['desktop', 1280, 36, '14px'],
    ['phone', 390, 40, '16px'],
  ] as const) {
    it(`${screen}: its trigger is ${height} tall, as a text field is, with ${font} text`, async () => {
      await page.viewport(width, 800)
      const { container } = render(
        <Card theme="light">
          <City />
          <TextField>
            <Label>نام</Label>
            <Input />
          </TextField>
        </Card>,
      )
      await settled(50)
      const trigger = container.querySelector('.select__trigger')!
      expect(box(trigger).height).toBe(height)
      expect(box(trigger).height).toBe(box(container.querySelector('.input')!).height)
      expect(getComputedStyle(container.querySelector('.select__value')!).fontSize).toBe(font)
      expect(getComputedStyle(trigger).borderTopLeftRadius).toBe('12px')
    })
  }
})

/**
 * The trigger is a field, in the field's colours; its menu is an overlay, and each item's text
 * clears AA on it. The chosen item's check is the text colour.
 */
describe('select colours', () => {
  for (const theme of themes) {
    it(`${theme}: a field trigger, an overlay menu, and items that clear AA`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <City defaultSelectedKey="شیراز" />
        </Card>,
      )
      await settled(50)
      const trigger = container.querySelector('.select__trigger')!
      // The page's theme was the light test's a moment ago, and the field eases into the dark one;
      // read it where it comes to rest, not partway there.
      for (const transition of trigger.getAnimations()) transition.finish()
      expect(rgb(getComputedStyle(trigger).backgroundColor)).toEqual(
        rgb(getComputedStyle(document.documentElement).getPropertyValue('--field-background')),
      )
      expect(textContrast(container.querySelector('.select__value')!)).toBeGreaterThanOrEqual(4.5)

      await userEvent.click(trigger)
      await settled(150)
      const popover = document.querySelector('.select__popover')!
      expect(rgb(getComputedStyle(popover).backgroundColor)).toEqual(
        rgb(token(theme === 'light' ? '--db-paper-0' : '--db-slate-900')),
      )
      for (const item of document.querySelectorAll('.list-box-item')) {
        expect(textContrast(item), item.textContent ?? '').toBeGreaterThanOrEqual(4.5)
      }
      const check = document.querySelector(
        '.list-box-item[aria-selected="true"] .list-box-item__indicator',
      )!
      expect(rgb(getComputedStyle(check).color)).toEqual(
        rgb(token(theme === 'light' ? '--db-slate-700' : '--db-slate-200')),
      )
      await userEvent.keyboard('{Escape}')
    })
  }
})

/** A select's resting trigger has the field's 1px edge in both themes. */
describe('a resting trigger’s edge', () => {
  for (const [theme, slate] of [
    ['light', '--db-slate-200'],
    ['dark', '--db-slate-700'],
  ] as const) {
    it(`${theme}: a 1px ${slate.slice(5)} edge, at the same height`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <City />
        </Card>,
      )
      await settled(50)
      const trigger = container.querySelector('.select__trigger')!
      const hairline = getComputedStyle(trigger).boxShadow.match(
        /((?:rgba?|oklch|color)\([^)]*\)) 0px 0px 0px 1px/,
      )
      expect(hairline, getComputedStyle(trigger).boxShadow).not.toBeNull()
      expect(rgb(hairline![1]!)).toEqual(rgb(token(slate)))
      expect(box(trigger).height).toBe(36)
    })
  }
})

/** In Persian the chevron and an item's check sit at the end, on the left. */
describe('select direction', () => {
  it('puts the chevron and the check on the left in Persian', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <City defaultSelectedKey="تهران" />
      </Card>,
    )
    await settled(50)
    const trigger = box(container.querySelector('.select__trigger')!)
    const chevron = box(container.querySelector('.select__indicator')!)
    expect(chevron.right).toBeLessThan(trigger.left + trigger.width / 2)

    await userEvent.click(container.querySelector('.select__trigger')!)
    await settled(150)
    const item = document.querySelector('.list-box-item[aria-selected="true"]')!
    const check = box(item.querySelector('.list-box-item__indicator')!)
    expect(check.right).toBeLessThan(box(item).left + box(item).width / 2)
    await userEvent.keyboard('{Escape}')
  })
})

describe('select focus', () => {
  it('draws Diba’s 2px ring around a focused trigger', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <City />
      </Card>,
    )
    await userEvent.tab()
    const trigger = container.querySelector('.select__trigger')!
    expect(document.activeElement).toBe(trigger)
    expect(getComputedStyle(trigger).boxShadow).toContain('0px 0px 0px 2px')
  })
})

/**
 * A dropdown's danger item draws its label in the danger colour, as the original's anatomy has it (the
 * label is a Label inside the item), and still clears AA on the overlay.
 */
describe('dropdown', () => {
  for (const theme of themes) {
    it(`${theme}: a danger item in danger, clearing AA`, async () => {
      await page.viewport(1280, 800)
      const { getByRole } = render(
        <Card theme={theme}>
          <Dropdown>
            <Button aria-label="کارها" isIconOnly variant="ghost">
              …
            </Button>
            <Dropdown.Popover placement="bottom end">
              <Dropdown.Menu>
                <Dropdown.Item id="role" textValue="تغییر نقش">
                  <Label>تغییر نقش</Label>
                </Dropdown.Item>
                <Dropdown.Item id="remove" textValue="حذف" variant="danger">
                  <Label>حذف</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </Card>,
      )
      await userEvent.click(getByRole('button', { name: 'کارها' }))
      await settled(150)
      const remove = document.querySelector('.menu-item--danger .label')!
      expect(rgb(getComputedStyle(remove).color)).toEqual(rgb(token('--danger')))
      for (const item of document.querySelectorAll('.menu-item .label')) {
        expect(textContrast(item), item.textContent ?? '').toBeGreaterThanOrEqual(4.5)
      }
      await userEvent.keyboard('{Escape}')
    })
  }
})

/**
 * A list on a page marks its choices as Flutter's list tiles do. With the indicator's `choice`
 * kind, a list of one choice draws Flutter's radio and a list of several its checkbox, at the
 * item's start: the right in Persian. The Select component's indicator is still the copied tick at the
 * end; a tree's select highlights its choice instead.
 */
describe('list box choices', () => {
  function Sizes({ mode }: { mode: 'single' | 'multiple' }) {
    return (
      <ListBox aria-label="اندازه" selectionMode={mode} defaultSelectedKeys={['m']}>
        {['s', 'm', 'l'].map((id) => (
          <ListBox.Item key={id} id={id} textValue={id}>
            <ListBox.ItemIndicator kind="choice" />
            <Label>{id.toUpperCase()}</Label>
          </ListBox.Item>
        ))}
      </ListBox>
    )
  }

  for (const [mode, slot] of [
    ['single', 'radio-default-indicator--flutter'],
    ['multiple', 'checkbox-default-indicator--flutter'],
  ] as const) {
    it(`${mode}: Flutter's ${mode === 'single' ? 'radio' : 'checkbox'} at the start of each item`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme="light">
          <Sizes mode={mode} />
        </Card>,
      )
      await settled(300)
      const items = container.querySelectorAll('.list-box-item')
      expect(items).toHaveLength(3)
      for (const item of items) {
        const mark = item.querySelector(`[data-slot="${slot}"]`)!
        expect(mark, item.textContent!).not.toBeNull()
        // At the start: the right, in Persian, and clear of the label.
        expect(box(mark).left).toBeGreaterThan(box(item.querySelector('.label')!).right)
      }
      const chosen = container.querySelector('.list-box-item[aria-selected="true"]')!
      if (mode === 'single') {
        expect(
          chosen.querySelector('[data-slot="radio-default-indicator--dot"]')!.getAttribute('r'),
        ).toBe('4.5')
      } else {
        expect(
          chosen
            .querySelector('[data-slot="checkbox-default-indicator--flutter"]')!
            .getAttribute('data-mark'),
        ).toBe('check')
      }
    })
  }

  it('a select’s menu keeps the tick at the end', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <City defaultSelectedKey="تهران" />
      </Card>,
    )
    await settled(50)
    await userEvent.click(container.querySelector('.select__trigger')!)
    await settled(150)
    const item = document.querySelector('.list-box-item[aria-selected="true"]')!
    expect(item.querySelector('[data-slot$="default-indicator--flutter"]')).toBeNull()
    expect(item.querySelector('[data-slot="list-box-item-indicator--checkmark"]')).not.toBeNull()
    await userEvent.keyboard('{Escape}')
  })
})

/** A block, as a tree draws it. */
const node = (type: string, props: Record<string, unknown>, children?: unknown) => ({
  type,
  props,
  ...(children === undefined ? {} : { children }),
})

const cityItems = ['تهران', 'شیراز', 'تبریز'].map((city, i) =>
  node('ListBoxItem', { id: `c${i}` }, city),
)

/** Every animation on the page brought to its end. */
const finishAll = () => document.getAnimations().forEach((a) => a.finish())

/**
 * A menu's chosen options are highlighted, as Flutter's menu marks its choice, where the original
 * drew a tick: the neutral fill, and half of it under the pointer, so a
 * chosen option and a hovered one never look alike. A list on a page keeps its radio or checkbox
 *, and no fill for its choice.
 */
describe('a menu’s chosen options', () => {
  for (const theme of themes) {
    it(`${theme}: a select’s choice is the neutral fill, with no tick; a hovered option half of it`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(
        <Card theme={theme}>
          <DibaSurface
            tree={node('Select', { label: 'شهر', defaultSelectedKey: 'c1' }, cityItems) as never}
          />
        </Card>,
      )
      await settled(50)
      await userEvent.click(container.querySelector('.select__trigger')!)
      await settled(200)
      finishAll()
      const items = [...document.querySelectorAll('.select__popover .list-box-item')]
      expect(items).toHaveLength(3)
      const chosen = items[1]!
      expect(chosen.getAttribute('aria-selected')).toBe('true')
      for (const item of items) {
        expect(item.querySelector('.list-box-item__indicator'), item.textContent!).toBeNull()
      }
      expect(rgb(getComputedStyle(chosen).backgroundColor)).toEqual(rgb(token('--default')))
      expect(toRgba(getComputedStyle(items[2]!).backgroundColor)[3]).toBe(0)
      await userEvent.hover(items[2]!)
      await settled(50)
      const [r, g, b, a] = toRgba(getComputedStyle(items[2]!).backgroundColor)
      expect(a).toBeCloseTo(0.5, 1)
      // Its colour is the fill's, within the rounding of mixing it with clear.
      const fill = rgb(token('--default'))
      ;[r, g, b].forEach((c, i) => expect(Math.abs(c - fill[i]!)).toBeLessThanOrEqual(2))
      // The chosen option keeps its fill under the pointer.
      await userEvent.hover(chosen)
      await settled(50)
      expect(rgb(getComputedStyle(chosen).backgroundColor)).toEqual(rgb(token('--default')))
      await userEvent.keyboard('{Escape}')
      await settled(200)
    })
  }

  it('a select of several highlights each choice, with no tick', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            node(
              'Select',
              { label: 'شهر', selectionMode: 'multiple', defaultSelectedKeys: ['c0', 'c2'] },
              cityItems,
            ) as never
          }
        />
      </Card>,
    )
    await settled(50)
    await userEvent.click(container.querySelector('.select__trigger')!)
    await settled(200)
    finishAll()
    const items = [...document.querySelectorAll('.select__popover .list-box-item')]
    const fills = items.map((i) => toRgba(getComputedStyle(i).backgroundColor))
    expect(fills[0]!.slice(0, 3)).toEqual(rgb(token('--default')))
    expect(fills[1]![3]).toBe(0)
    expect(fills[2]!.slice(0, 3)).toEqual(rgb(token('--default')))
    expect(document.querySelector('.select__popover .list-box-item__indicator')).toBeNull()
    await userEvent.keyboard('{Escape}')
    await settled(200)
  })

  it('a combo box’s choice is highlighted, with no tick', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={
            node(
              'ComboBox',
              { label: 'شهر', defaultSelectedKey: 'c1', menuTrigger: 'focus' },
              cityItems,
            ) as never
          }
        />
      </Card>,
    )
    await settled(50)
    await userEvent.click(container.querySelector('.combo-box__trigger')!)
    await settled(200)
    finishAll()
    const items = [...document.querySelectorAll('.combo-box__popover .list-box-item')]
    expect(items).toHaveLength(3)
    expect(rgb(getComputedStyle(items[1]!).backgroundColor)).toEqual(rgb(token('--default')))
    expect(toRgba(getComputedStyle(items[0]!).backgroundColor)[3]).toBe(0)
    expect(document.querySelector('.combo-box__popover .list-box-item__indicator')).toBeNull()
    await userEvent.keyboard('{Escape}')
    await settled(200)
  })

  it('a dropdown that chooses highlights its choices, with no tick and no room kept for one', async () => {
    await page.viewport(1280, 800)
    render(
      <Card theme="light">
        <DibaSurface
          tree={
            {
              type: 'Dropdown',
              props: { selectionMode: 'multiple', defaultSelectedKeys: ['price'] },
              children: [
                node('DropdownItem', { id: 'price' }, 'قیمت'),
                node('DropdownItem', { id: 'stock' }, 'موجودی'),
              ],
              slots: { trigger: node('Button', {}, 'ستون‌ها') },
            } as never
          }
        />
      </Card>,
    )
    await settled(50)
    await userEvent.click(page.getByRole('button', { name: 'ستون‌ها' }))
    await settled(200)
    finishAll()
    const [price, stock] = [...document.querySelectorAll('.dropdown__popover .menu-item')]
    expect(rgb(getComputedStyle(price!).backgroundColor)).toEqual(rgb(token('--default')))
    expect(toRgba(getComputedStyle(stock!).backgroundColor)[3]).toBe(0)
    expect(document.querySelector('.dropdown__popover .menu-item__indicator')).toBeNull()
    expect(getComputedStyle(price!).paddingInlineStart).toBe('10px')
    await userEvent.keyboard('{Escape}')
    await settled(200)
  })

  it('a list on a page keeps its radio, and no fill for its choice', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card theme="light">
        <DibaSurface
          tree={node('ListBox', { label: 'شهر', defaultSelectedKeys: ['c1'] }, cityItems) as never}
        />
      </Card>,
    )
    await settled(50)
    const chosen = container.querySelector('.list-box-item[aria-selected="true"]')!
    expect(chosen.querySelector('[data-slot="radio-default-indicator--flutter"]')).not.toBeNull()
    expect(toRgba(getComputedStyle(chosen).backgroundColor)[3]).toBe(0)
  })
})
