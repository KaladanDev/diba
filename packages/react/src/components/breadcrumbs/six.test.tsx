import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Breadcrumbs,
  Button,
  ErrorMessage,
  Label,
  Menu,
  Separator,
  Switch,
  SwitchGroup,
  Tag,
  TagGroup,
  Toolbar,
} from '../../index'
import { DibaProvider } from '../../provider/DibaProvider'

/**
 * The last six upstream components worth having, copied so the apps need no other kit.
 * React Aria's behaviour as Diba exports it, and the classes the stylesheet keys on. Sheet's is in
 * `six.browser.test.tsx`: React Aria moves a sheet by scrolling, which jsdom cannot.
 */

describe('Breadcrumbs', () => {
  function Trail(props: Partial<React.ComponentProps<typeof Breadcrumbs>>) {
    return (
      <Breadcrumbs {...props}>
        <Breadcrumbs.Item href="/home">پیشخوان</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/orders">سفارش‌ها</Breadcrumbs.Item>
        <Breadcrumbs.Item>سفارش ۱۰۴۱</Breadcrumbs.Item>
      </Breadcrumbs>
    )
  }

  it('is a list of links to the way here, the page itself last: current, going nowhere', () => {
    render(<Trail />)
    const list = screen.getByRole('list')
    expect(list).toHaveClass('breadcrumbs')
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByRole('link', { name: 'پیشخوان' })).toHaveAttribute('href', '/home')
    expect(screen.getByRole('link', { name: 'سفارش‌ها' })).toHaveAttribute('href', '/orders')
    // React Aria's pattern: the page is a link marked current, with nowhere to go.
    const here = screen.getByRole('link', { name: 'سفارش ۱۰۴۱' })
    expect(here).toHaveAttribute('aria-current', 'page')
    expect(here).toHaveAttribute('aria-disabled', 'true')
    expect(here).not.toHaveAttribute('href')
    expect(screen.getByRole('link', { name: 'سفارش‌ها' })).not.toHaveAttribute('aria-current')
  })

  it('draws a separator between steps, none after the page; any element can be it', () => {
    const { container, unmount } = render(<Trail />)
    const chevrons = container.querySelectorAll('[data-slot="breadcrumbs-separator"]')
    expect(chevrons).toHaveLength(2)
    expect(chevrons[0]!.tagName.toLowerCase()).toBe('svg')
    unmount()
    const custom = render(<Trail separator={<span>/</span>} />)
    const slashes = custom.container.querySelectorAll('[data-slot="breadcrumbs-separator"]')
    expect(slashes).toHaveLength(2)
    expect(slashes[0]).toHaveTextContent('/')
    expect(slashes[0]).toHaveClass('breadcrumbs__separator')
  })

  it('disabled, no step can be followed', () => {
    render(<Trail isDisabled />)
    for (const name of ['پیشخوان', 'سفارش‌ها'])
      expect(screen.getByRole('link', { name })).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('Menu', () => {
  it('a menu on the page: a press runs the item’s action, a disabled one runs nothing', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <Menu aria-label="کارهای سفارش" onAction={onAction}>
        <Menu.Item id="print" textValue="چاپ فاکتور">
          چاپ فاکتور
        </Menu.Item>
        <Menu.Item id="archive" textValue="بایگانی" isDisabled>
          بایگانی
        </Menu.Item>
        <Separator />
        <Menu.Item id="cancel" textValue="لغو" variant="danger">
          لغو
        </Menu.Item>
      </Menu>,
    )
    const menu = screen.getByRole('menu', { name: 'کارهای سفارش' })
    expect(menu).toHaveClass('menu')
    expect(menu).toHaveAttribute('data-slot', 'menu')
    await user.click(screen.getByRole('menuitem', { name: 'چاپ فاکتور' }))
    expect(onAction.mock.lastCall![0]).toBe('print')
    await user.click(screen.getByRole('menuitem', { name: 'بایگانی' }))
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('menuitem', { name: 'لغو' })).toHaveClass('menu-item--danger')
  })

  it('a choice: the chosen item is checked, and the new choice is sent', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <Menu
        aria-label="ترتیب"
        selectionMode="single"
        defaultSelectedKeys={['newest']}
        onSelectionChange={onSelectionChange}
      >
        <Menu.Item id="newest" textValue="تازه‌ترین">
          <Menu.ItemIndicator />
          تازه‌ترین
        </Menu.Item>
        <Menu.Item id="cheapest" textValue="ارزان‌ترین">
          <Menu.ItemIndicator />
          ارزان‌ترین
        </Menu.Item>
      </Menu>,
    )
    expect(screen.getByRole('menuitemradio', { name: 'تازه‌ترین' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await user.click(screen.getByRole('menuitemradio', { name: 'ارزان‌ترین' }))
    expect([...onSelectionChange.mock.lastCall![0]]).toEqual(['cheapest'])
  })
})

describe('SwitchGroup', () => {
  function Group(props: Partial<React.ComponentProps<typeof SwitchGroup>>) {
    return (
      <SwitchGroup {...props}>
        {['اعلان سفارش', 'گزارش هفتگی'].map((label) => (
          <Switch key={label} name={label}>
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Label>{label}</Label>
            </Switch.Content>
          </Switch>
        ))}
      </SwitchGroup>
    )
  }

  it('lays its switches out down by default, or across; each is its own', async () => {
    const user = userEvent.setup()
    const { container, unmount } = render(<Group />)
    const group = container.querySelector('[data-slot="switch-group"]')!
    expect(group).toHaveClass('switch-group', 'switch-group--vertical')
    expect(group.querySelector('[data-slot="switch-group-items"]')).toHaveClass(
      'switch-group__items',
    )
    await user.click(screen.getByRole('switch', { name: 'اعلان سفارش' }))
    expect(screen.getByRole('switch', { name: 'اعلان سفارش' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'گزارش هفتگی' })).not.toBeChecked()
    unmount()
    const across = render(<Group orientation="horizontal" />)
    expect(across.container.querySelector('[data-slot="switch-group"]')).toHaveClass(
      'switch-group--horizontal',
    )
  })
})

describe('ErrorMessage', () => {
  it('under a tag group, the group is described by it', () => {
    render(
      <TagGroup selectionMode="multiple">
        <Label>دسته‌ها</Label>
        <TagGroup.List>
          <Tag id="scarf">شال</Tag>
          <Tag id="bag">کیف</Tag>
        </TagGroup.List>
        <ErrorMessage>دست‌کم یک دسته را برگزینید.</ErrorMessage>
      </TagGroup>,
    )
    const error = screen.getByText('دست‌کم یک دسته را برگزینید.')
    expect(error).toHaveClass('error-message')
    expect(error).toHaveAttribute('data-slot', 'error-message')
    expect(screen.getByRole('grid').getAttribute('aria-describedby')).toContain(error.id)
  })
})

describe('Toolbar', () => {
  it('one tab stop; the arrow keys move along it, backwards on a right-to-left page', async () => {
    const user = userEvent.setup()
    // React Aria reads the direction from the locale, which DibaProvider gives it.
    render(
      <DibaProvider locale="fa-IR" dir="rtl">
        <Toolbar aria-label="کارهای گروهی">
          <Button>چاپ</Button>
          <Separator />
          <Button>برچسب</Button>
          <Button>لغو</Button>
        </Toolbar>
      </DibaProvider>,
    )
    const toolbar = screen.getByRole('toolbar', { name: 'کارهای گروهی' })
    expect(toolbar).toHaveClass('toolbar', 'toolbar--horizontal')
    expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal')
    // Its separator stands across the row.
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
    await user.tab()
    expect(screen.getByRole('button', { name: 'چاپ' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'چاپ' })).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('button', { name: 'برچسب' })).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('button', { name: 'لغو' })).toHaveFocus()
    await user.tab()
    expect(toolbar).not.toContainElement(document.activeElement as HTMLElement)
  })

  it('attached, it is its own bar; down, the up and down arrows move', async () => {
    const user = userEvent.setup()
    render(
      <Toolbar aria-label="کارها" isAttached orientation="vertical">
        <Button>چاپ</Button>
        <Button>لغو</Button>
      </Toolbar>,
    )
    const toolbar = screen.getByRole('toolbar')
    expect(toolbar).toHaveClass('toolbar--attached', 'toolbar--vertical')
    await user.tab()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('button', { name: 'لغو' })).toHaveFocus()
  })
})
