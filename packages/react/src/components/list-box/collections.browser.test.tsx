import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { page, userEvent } from '@vitest/browser/context'
import { Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { box, settled } from '../../test/visual'
import {
  Button,
  ComboBox,
  Dropdown,
  Input,
  Label,
  ListBox,
  Menu,
  Select,
  Tag,
  TagGroup,
} from '../../index'

/**
 * The collections as a page composes them: a select's value on one line, cut with an ellipsis,
 * however narrow its field; an icon leading a list's, a menu's or a dropdown's item 16 across, as
 * a button's is; and a tag that opens a page drawn as one that does something.
 */

function Card({ width = 420, children }: { width?: number; children: ReactNode }) {
  return (
    <DibaProvider theme="light" locale="fa-IR" dir="rtl">
      <div
        data-reduce-motion="true"
        style={{ background: 'var(--surface)', color: 'var(--foreground)', padding: 16, width }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

const OPTIONS = ['شال و روسری ابریشمی دست‌باف', 'کیف چرمی', 'صنایع دستی اصفهان']

function Picker(props: Partial<React.ComponentProps<typeof Select>>) {
  return (
    <Select aria-label="دسته" fullWidth {...props}>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {OPTIONS.map((o, i) => (
            <ListBox.Item key={o} id={String(i)} textValue={o}>
              {o}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}

describe("a select's value stays on one line", () => {
  it('a long choice, or several, in a narrow field: 36 tall, cut with an ellipsis', async () => {
    await page.viewport(1280, 800)
    const { container } = render(
      <Card width={160}>
        <Picker defaultValue="0" />
        <Picker selectionMode="multiple" defaultValue={['0', '1', '2']} />
      </Card>,
    )
    await settled(50)
    for (const select of container.querySelectorAll('[data-slot="select"]')) {
      const value = select.querySelector<HTMLElement>('[data-slot="select-value"]')!
      expect(box(select.querySelector('[data-slot="select-trigger"]')!).height).toBe(36)
      expect(getComputedStyle(value).textOverflow).toBe('ellipsis')
      expect(getComputedStyle(value).whiteSpace).toBe('nowrap')
      expect(value.scrollWidth).toBeGreaterThan(value.clientWidth)
    }
  })
})

describe("an item's icon is 16, as a button's", () => {
  it('in a list, a menu and an open dropdown', async () => {
    const { container } = render(
      <Card>
        <ListBox aria-label="کارها">
          <ListBox.Item id="edit" textValue="ویرایش">
            <Pencil />
            <Label>ویرایش</Label>
          </ListBox.Item>
        </ListBox>
        <Menu aria-label="کارها">
          <Menu.Item id="edit" textValue="ویرایش">
            <Pencil />
            <Label>ویرایش</Label>
          </Menu.Item>
        </Menu>
        <Dropdown defaultOpen>
          <Button>کارها</Button>
          <Dropdown.Popover>
            <Dropdown.Menu>
              <Dropdown.Item id="edit" textValue="ویرایش">
                <Pencil />
                <Label>ویرایش</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </Card>,
    )
    await settled(400)
    const icons = [
      container.querySelector('.list-box-item > svg')!,
      container.querySelector('.menu-item > svg')!,
      document.querySelector('[data-slot="dropdown-popover"] .menu-item > svg')!,
    ]
    for (const icon of icons) {
      // A dropdown's card opens from 0.95; its size is read off its style, not its box.
      expect(getComputedStyle(icon).width).toBe('16px')
      expect(getComputedStyle(icon).height).toBe('16px')
    }
  })
})

describe('a tag that opens a page', () => {
  it('takes the hand and a wash under the pointer, as a chosen one does; a tag that only shows, neither', async () => {
    const { container } = render(
      <Card>
        <TagGroup aria-label="دسته‌ها">
          <TagGroup.List>
            <Tag id="tea" href="#tea" textValue="چای">
              چای
            </Tag>
            <Tag id="new" textValue="تازه">
              تازه
            </Tag>
          </TagGroup.List>
        </TagGroup>
      </Card>,
    )
    await settled(50)
    const [link, plain] = [...container.querySelectorAll<HTMLElement>('[data-slot="tag"]')]
    expect(getComputedStyle(link!).cursor).toBe('pointer')
    expect(getComputedStyle(plain!).cursor).not.toBe('pointer')
    const wash = (tag: HTMLElement) => getComputedStyle(tag).getPropertyValue('--tag-hover').trim()
    await userEvent.hover(link!)
    await settled(50)
    const linkWash = wash(link!)
    await userEvent.hover(plain!)
    await settled(50)
    expect(linkWash).not.toBe(wash(plain!))
  })
})

describe("a select's chosen option with an icon", () => {
  it('lays the icon on its words’ line, 16 and 8 before them, the field 36 tall', async () => {
    const { container } = render(
      <Card width={320}>
        <Select aria-label="نوع" defaultValue="physical" fullWidth>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="physical" textValue="کالای فیزیکی">
                <Pencil />
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <Label>کالای فیزیکی</Label>
                </span>
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </Card>,
    )
    await settled(50)
    const value = container.querySelector('[data-slot="select-value"]')!
    const icon = box(value.querySelector(':scope > svg')!)
    const words = box(value.querySelector('.label')!)
    expect(box(container.querySelector('[data-slot="select-trigger"]')!).height).toBe(36)
    expect(icon.width).toBe(16)
    // On a Persian page the icon is at the start, the right, its words 8 to its left.
    expect(icon.left - words.right).toBe(8)
    expect(
      Math.abs((icon.top + icon.bottom) / 2 - (words.top + words.bottom) / 2),
    ).toBeLessThanOrEqual(1)
  })
})

describe('a submenu’s chevron', () => {
  it('points toward the page’s end: turned on a Persian page, as drawn on an English one', async () => {
    for (const dir of ['rtl', 'ltr'] as const) {
      const { unmount } = render(
        <DibaProvider theme="light" locale={dir === 'rtl' ? 'fa-IR' : 'en-US'} dir={dir}>
          <Dropdown defaultOpen>
            <Button>more</Button>
            <Dropdown.Popover>
              <Dropdown.Menu>
                <Dropdown.SubmenuTrigger>
                  <Dropdown.Item id="share">
                    share
                    <Dropdown.SubmenuIndicator />
                  </Dropdown.Item>
                  <Dropdown.Popover>
                    <Dropdown.Menu>
                      <Dropdown.Item id="link">link</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown.SubmenuTrigger>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </DibaProvider>,
      )
      await settled(300)
      const chevron = document.querySelector('[data-slot="submenu-indicator"] > svg')!
      expect(getComputedStyle(chevron).scale).toBe(dir === 'rtl' ? '-1 1' : 'none')
      unmount()
    }
  })
})

describe('an option given words alone', () => {
  it('a combo box chooses it, pressed or from the keyboard, and writes its words in', async () => {
    const Colour = () => (
      <Card>
        <ComboBox aria-label="رنگ" allowsCustomValue>
          <ComboBox.InputGroup>
            <Input />
            <ComboBox.Trigger />
          </ComboBox.InputGroup>
          <ComboBox.Popover>
            <ListBox>
              <ListBox.Item id="crimson">زرشکی</ListBox.Item>
              <ListBox.Item id="turquoise">فیروزه‌ای</ListBox.Item>
            </ListBox>
          </ComboBox.Popover>
        </ComboBox>
      </Card>
    )
    const pressed = render(<Colour />)
    await userEvent.click(pressed.container.querySelector('[data-slot="combo-box-trigger"]')!)
    await settled(300)
    await userEvent.click(
      [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
        (o) => o.textContent === 'فیروزه‌ای',
      )!,
    )
    await settled(200)
    expect(pressed.container.querySelector('input')!.value).toBe('فیروزه‌ای')
    pressed.unmount()

    const keys = render(<Colour />)
    await userEvent.click(keys.container.querySelector('input')!)
    await userEvent.keyboard('{ArrowDown}')
    await settled(200)
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await settled(200)
    expect(keys.container.querySelector('input')!.value).toBe('فیروزه‌ای')
  })

  it('a menu finds it by its first letter', async () => {
    const view = render(
      <Card>
        <Menu aria-label="میوه">
          <Menu.Item id="apple">Apple</Menu.Item>
          <Menu.Item id="orange">Orange</Menu.Item>
          <Menu.Item id="banana">Banana</Menu.Item>
        </Menu>
      </Card>,
    )
    await userEvent.click(view.getByText('Apple'))
    // The test browser's keyboard inserts a Persian letter without a key press, so a Latin one.
    await userEvent.keyboard('b')
    await settled(100)
    expect(document.activeElement?.textContent).toBe('Banana')
  })
})
