import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Button,
  ComboBox,
  Description,
  Dropdown,
  Header,
  Input,
  Label,
  ListBox,
  Select,
  Separator,
} from '../../index'

/**
 * Group 3, the pickers: the copied Select, ComboBox, ListBox and Dropdown as Diba exports them,
 * composed the way the admin composes them. React Aria does the choosing; this holds that the
 * parts reach each other through its contexts, and carry the classes the stylesheet keys on.
 */

const cities = [
  { id: 'tehran', name: 'تهران' },
  { id: 'shiraz', name: 'شیراز' },
  { id: 'tabriz', name: 'تبریز' },
]

describe('Select', () => {
  function City(props: { onSelectionChange?: (key: unknown) => void; isDisabled?: boolean }) {
    return (
      <Select placeholder="انتخاب کنید" {...props}>
        <Label>شهر</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Description>شهر انبار.</Description>
        <Select.Popover>
          <ListBox>
            {cities.map((city) => (
              <ListBox.Item key={city.id} id={city.id} textValue={city.name}>
                {city.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    )
  }

  it('shows its placeholder, and carries the classes its stylesheet keys on', () => {
    const { container } = render(<City />)
    expect(container.querySelector('.select')).toHaveClass('select--primary')
    const trigger = container.querySelector('.select__trigger')!
    expect(trigger).not.toBeNull()
    expect(within(trigger as HTMLElement).getByText('انتخاب کنید')).toHaveClass('select__value')
    expect(container.querySelector('.select__indicator')).not.toBeNull()
  })

  it('opens, and reports the city chosen', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    const { container } = render(<City onSelectionChange={onSelectionChange} />)
    await user.click(container.querySelector('.select__trigger')!)
    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveClass('list-box')
    expect(document.querySelector('.select__popover')).not.toBeNull()
    const option = within(listbox).getByRole('option', { name: 'شیراز' })
    expect(option).toHaveClass('list-box-item')
    await user.click(option)
    expect(onSelectionChange).toHaveBeenCalledWith('shiraz')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(container.querySelector('.select__value')).toHaveTextContent('شیراز')
  })

  it('is labelled and described', () => {
    render(<City />)
    const trigger = screen.getByRole('button', { name: /شهر/ })
    const described = trigger.getAttribute('aria-describedby') ?? ''
    expect(described.split(' ').map((id) => document.getElementById(id)?.textContent)).toContain(
      'شهر انبار.',
    )
  })

  it('will not open while disabled', async () => {
    const user = userEvent.setup()
    const { container } = render(<City isDisabled />)
    await user.click(container.querySelector('.select__trigger')!)
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('ComboBox', () => {
  function Category({ onSelectionChange }: { onSelectionChange?: (key: unknown) => void }) {
    return (
      <ComboBox defaultItems={cities} menuTrigger="input" onSelectionChange={onSelectionChange}>
        <Label>شهر</Label>
        <ComboBox.InputGroup>
          <Input placeholder="جست‌وجو" />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover>
          <ListBox>
            {(city: (typeof cities)[number]) => (
              <ListBox.Item id={city.id} textValue={city.name}>
                {city.name}
              </ListBox.Item>
            )}
          </ListBox>
        </ComboBox.Popover>
      </ComboBox>
    )
  }

  it('filters what is typed in Persian, and reports the choice', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    const { container } = render(<Category onSelectionChange={onSelectionChange} />)
    expect(container.querySelector('.combo-box')).not.toBeNull()
    expect(container.querySelector('.combo-box__input-group')).not.toBeNull()
    const input = screen.getByRole('combobox', { name: 'شهر' })
    await user.type(input, 'ش')
    const options = within(screen.getByRole('listbox')).getAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual(['شیراز'])
    await user.click(options[0]!)
    expect(onSelectionChange).toHaveBeenCalledWith('shiraz')
    expect(input).toHaveValue('شیراز')
  })

  it('opens from its trigger with everything in it', async () => {
    const user = userEvent.setup()
    const { container } = render(<Category />)
    await user.click(container.querySelector('.combo-box__trigger')!)
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(3)
    expect(document.querySelector('.combo-box__popover')).not.toBeNull()
  })
})

describe('ListBox', () => {
  it('chooses several, and marks them chosen', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <ListBox aria-label="شهرها" selectionMode="multiple" onSelectionChange={onSelectionChange}>
        {cities.map((city) => (
          <ListBox.Item key={city.id} id={city.id} textValue={city.name}>
            {city.name}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        ))}
      </ListBox>,
    )
    await user.click(screen.getByRole('option', { name: 'تهران' }))
    await user.click(screen.getByRole('option', { name: 'تبریز' }))
    const chosen = onSelectionChange.mock.calls.at(-1)![0] as Set<string>
    expect([...chosen].sort()).toEqual(['tabriz', 'tehran'])
    expect(screen.getByRole('option', { name: 'تهران' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: 'شیراز' })).toHaveAttribute('aria-selected', 'false')
  })

  it('draws a danger item as one', () => {
    render(
      <ListBox aria-label="کارها">
        <ListBox.Item id="delete" textValue="حذف" variant="danger">
          حذف
        </ListBox.Item>
      </ListBox>,
    )
    expect(screen.getByRole('option', { name: 'حذف' })).toHaveClass('list-box-item--danger')
  })
})

describe('Dropdown', () => {
  it('opens from its button and reports the action', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <Dropdown>
        <Button isIconOnly size="sm" variant="ghost" aria-label="کارها">
          …
        </Button>
        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu onAction={onAction}>
            <Dropdown.Item id="role" textValue="تغییر نقش">
              تغییر نقش
            </Dropdown.Item>
            <Dropdown.Item id="remove" textValue="حذف" variant="danger">
              حذف
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>,
    )
    await user.click(screen.getByRole('button', { name: 'کارها' }))
    const menu = screen.getByRole('menu')
    expect(menu).toHaveClass('dropdown__menu')
    expect(document.querySelector('.dropdown__popover')).not.toBeNull()
    const remove = within(menu).getByRole('menuitem', { name: 'حذف' })
    expect(remove).toHaveClass('menu-item', 'menu-item--danger')
    await user.click(remove)
    expect(onAction.mock.calls.map((call) => call[0])).toEqual(['remove'])
    expect(screen.queryByRole('menu')).toBeNull()
  })
})

describe('sections', () => {
  it('titles a list box section with a Header', () => {
    render(
      <ListBox aria-label="شهرها">
        <ListBox.Section>
          <Header>استان فارس</Header>
          <ListBox.Item id="shiraz" textValue="شیراز">
            شیراز
          </ListBox.Item>
        </ListBox.Section>
      </ListBox>,
    )
    const group = screen.getByRole('group', { name: 'استان فارس' })
    expect(group).toHaveClass('list-box-section')
    expect(screen.getByText('استان فارس')).toHaveClass('header')
    expect(within(group).getByRole('option', { name: 'شیراز' })).toBeInTheDocument()
  })

  it('separates a menu’s sections', async () => {
    const user = userEvent.setup()
    render(
      <Dropdown>
        <Button aria-label="کارها">…</Button>
        <Dropdown.Popover>
          <Dropdown.Menu>
            <Dropdown.Section>
              <Header>سفارش</Header>
              <Dropdown.Item id="print" textValue="چاپ">
                <Label>چاپ</Label>
              </Dropdown.Item>
            </Dropdown.Section>
            <Separator />
            <Dropdown.Item id="cancel" textValue="لغو" variant="danger">
              <Label>لغو</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>,
    )
    await user.click(screen.getByRole('button', { name: 'کارها' }))
    const menu = screen.getByRole('menu')
    expect(within(menu).getByRole('group', { name: 'سفارش' })).toHaveClass('menu-section')
    expect(within(menu).getByRole('separator')).toHaveClass('separator')
  })
})
