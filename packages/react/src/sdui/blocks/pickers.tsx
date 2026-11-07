import type { ReactNode } from 'react'
import type { Key } from 'react-aria-components'
import { ComboBox } from '../../components/combo-box'
import { Description } from '../../components/description'
import { Dropdown } from '../../components/dropdown'
import { Header } from '../../components/header'
import { Input } from '../../components/input'
import { Label } from '../../components/label'
import { ListBox } from '../../components/list-box'
import { Menu } from '../../components/menu'
import { Select } from '../../components/select'
import type { Block, Item } from '../node'
import { FieldParts, Icon, Nothing, errorOf, hiddenLabel, placementOf, propsOf } from './common'

const keyOf = (key: Key | null | undefined) =>
  key === null || key === undefined ? null : String(key)

/**
 * An option's own text, icon or picture, and second line. Its props are read
 * where the option is built, not inside it: a closed menu draws no options.
 */
function optionContent(item: Item) {
  const { icon, image, description } = item.props as Record<string, any>
  return (
    <>
      {icon ? <Icon name={icon} /> : null}
      {image ? (
        <img
          src={image}
          alt=""
          width={24}
          height={24}
          style={{ borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
        />
      ) : null}
      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Label>{item.text}</Label>
        {description ? <Description>{description}</Description> : null}
      </span>
    </>
  )
}

/**
 * A list's options and titled sections. On a page a list marks its choices
 * with Flutter's radio or checkbox at the start; a menu highlights them
 * instead, with no mark.
 */
function listItems(items: Item[], mark: 'choice' | 'none') {
  return items.map((item) => {
    const q = item.props as Record<string, any>
    if (item.type === 'ListBoxSection') {
      return (
        <ListBox.Section key={item.path}>
          {q.title ? <Header>{q.title}</Header> : null}
          {listItems(item.items, mark)}
        </ListBox.Section>
      )
    }
    if (item.type !== 'ListBoxItem') return null
    return (
      <ListBox.Item
        key={item.path}
        id={q.id}
        textValue={item.text ?? String(q.id)}
        variant={q.variant}
        isDisabled={q.isDisabled}
      >
        {mark === 'choice' ? <ListBox.ItemIndicator kind="choice" /> : null}
        {optionContent(item)}
      </ListBox.Item>
    )
  })
}

/** The option a key names, inside its section or not. */
function itemOf(items: Item[], key: Key | undefined): Item | undefined {
  for (const item of items) {
    if (item.type === 'ListBoxSection') {
      const found = itemOf(item.items, key)
      if (found) return found
    } else if (
      key !== undefined &&
      String((item.props as Record<string, unknown>).id) === String(key)
    ) {
      return item
    }
  }
  return undefined
}

/**
 * What a closed select shows: the choice's icon or picture and its text, on
 * one line. React Aria's default reuses the option's whole content, so its
 * second line and its tick stacked up inside the trigger, and several choices
 * ("New and Sale") broke one word to a line.
 */
function ChosenValue({ text, item }: { text: string; item: Item | undefined }) {
  const { icon, image } = (item?.props ?? {}) as Record<string, any>
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        maxWidth: '100%',
        verticalAlign: 'middle',
      }}
    >
      {icon ? <Icon name={icon} /> : null}
      {image ? (
        <img
          src={image}
          alt=""
          width={20}
          height={20}
          style={{ borderRadius: 5, objectFit: 'cover', flexShrink: 0 }}
        />
      ) : null}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {text}
      </span>
    </span>
  )
}

const SelectBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const multiple = p.selectionMode === 'multiple'
  const current = node.current as string | string[] | null | undefined
  return (
    <Select
      selectionMode={multiple ? 'multiple' : 'single'}
      value={(multiple ? (current ?? []) : (current ?? null)) as any}
      onChange={(value: any) =>
        void node.setValue(
          'onSelectionChange',
          multiple ? [...(value ?? [])].map(String) : keyOf(value),
        )
      }
      // React Aria's Select has no read-only state: its menu stays shut instead.
      isOpen={p.isReadOnly ? false : undefined}
      placeholder={p.placeholder}
      isRequired={p.isRequired}
      isDisabled={p.isDisabled}
      isInvalid={Boolean(errorOf(node))}
      validationBehavior="aria"
      name={p.name}
      variant={p.variant}
      fullWidth={p.fullWidth}
      aria-label={hiddenLabel(node)}
    >
      <FieldParts node={node}>
        <Select.Trigger>
          <Select.Value>
            {({ isPlaceholder, selectedText, state, defaultChildren }) =>
              isPlaceholder ? (
                defaultChildren
              ) : (
                <ChosenValue
                  text={selectedText}
                  item={multiple ? undefined : itemOf(node.items, state.selectedItems[0]?.key)}
                />
              )
            }
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox selectionMode={multiple ? 'multiple' : 'single'}>
            {listItems(node.items, 'none')}
          </ListBox>
        </Select.Popover>
      </FieldParts>
    </Select>
  )
}

const ComboBoxBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const {
    inputValue: input,
    defaultInputValue,
    emptyMessage,
  } = p as Record<string, string | undefined>
  return (
    <ComboBox
      selectedKey={(node.current as string | null | undefined) ?? null}
      onSelectionChange={(key) => void node.setValue('onSelectionChange', keyOf(key))}
      {...(input !== undefined ? { inputValue: input } : { defaultInputValue })}
      onInputChange={(text: string) => void node.setValue('onInputChange', text, 'input')}
      menuTrigger={p.menuTrigger}
      allowsCustomValue={p.allowsCustomValue}
      allowsEmptyCollection
      isRequired={p.isRequired}
      isReadOnly={p.isReadOnly}
      isDisabled={p.isDisabled}
      isInvalid={Boolean(errorOf(node))}
      validationBehavior="aria"
      name={p.name}
      fullWidth={p.fullWidth}
      aria-label={hiddenLabel(node)}
    >
      <FieldParts node={node}>
        <ComboBox.InputGroup>
          <Input placeholder={p.placeholder} variant={p.variant} />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover>
          <ListBox renderEmptyState={() => <EmptyText>{emptyMessage}</EmptyText>}>
            {listItems(node.items, 'none')}
          </ListBox>
        </ComboBox.Popover>
      </FieldParts>
    </ComboBox>
  )
}

function EmptyText({ children }: { children?: string }) {
  if (!children) return null
  return <div style={{ padding: '8px 12px', opacity: 0.7 }}>{children}</div>
}

/** A list on the page. Its label is never drawn: a heading is a Text block. */
const ListBoxBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const { emptyMessage } = p
  const mode = p.selectionMode as 'none' | 'single' | 'multiple'
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', maxWidth: '100%' }}>
      <ListBox
        aria-label={p.label}
        selectionMode={mode}
        selectedKeys={(node.current as string[] | undefined) ?? []}
        onSelectionChange={(keys) =>
          void node.setValue(
            'onSelectionChange',
            keys === 'all' ? node.items.map((i) => String(i.props.id)) : [...keys].map(String),
          )
        }
        onAction={node.on.onAction ? (key) => void node.fire('onAction', String(key)) : undefined}
        renderEmptyState={() => <EmptyText>{emptyMessage}</EmptyText>}
      >
        {listItems(node.items, mode === 'none' ? 'none' : 'choice')}
      </ListBox>
    </div>
  )
}

/** A menu opened by its trigger, and only by it. */
const DropdownBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const trigger = node.slots.trigger
  if (!trigger) {
    node.refuse('no trigger')
    return null
  }
  const menu = (items: Item[]): ReactNode =>
    items.map((item) => {
      const q = item.props as Record<string, any>
      if (item.type === 'DropdownSection') {
        return (
          <Dropdown.Section key={item.path}>
            {q.title ? <Header>{q.title}</Header> : null}
            {menu(item.items)}
          </Dropdown.Section>
        )
      }
      if (item.type !== 'DropdownItem') return null
      return (
        <Dropdown.Item
          key={item.path}
          id={q.id}
          textValue={item.text ?? String(q.id)}
          variant={q.variant}
          isDisabled={q.isDisabled}
        >
          {optionContent(item)}
        </Dropdown.Item>
      )
    })
  return (
    <Dropdown>
      {trigger}
      <Dropdown.Popover placement={placementOf(p.placement)}>
        <Dropdown.Menu
          selectionMode={p.selectionMode}
          selectedKeys={(node.current as string[] | undefined) ?? []}
          onSelectionChange={(keys) =>
            void node.setValue('onSelectionChange', keys === 'all' ? [] : [...keys].map(String))
          }
          onAction={node.on.onAction ? (key) => void node.fire('onAction', String(key)) : undefined}
        >
          {menu(node.items)}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}

/**
 * A Dropdown's menu standing on the page, with the dropdown's items and sections. A
 * choice is marked with the copied tick at the item's start, as the Menu's look was picked; in a
 * dropdown's menu it is the neutral fill.
 */
const MenuBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const mode = p.selectionMode as 'none' | 'single' | 'multiple'
  const menu = (items: Item[]): ReactNode =>
    items.map((item) => {
      const q = item.props as Record<string, any>
      if (item.type === 'DropdownSection') {
        return (
          <Menu.Section key={item.path}>
            {q.title ? <Header>{q.title}</Header> : null}
            {menu(item.items)}
          </Menu.Section>
        )
      }
      if (item.type !== 'DropdownItem') return null
      return (
        <Menu.Item
          key={item.path}
          id={q.id}
          textValue={item.text ?? String(q.id)}
          variant={q.variant}
          isDisabled={q.isDisabled}
        >
          {mode === 'none' ? null : <Menu.ItemIndicator />}
          {optionContent(item)}
        </Menu.Item>
      )
    })
  return (
    <Menu
      aria-label={p.label}
      selectionMode={mode}
      selectedKeys={(node.current as string[] | undefined) ?? []}
      onSelectionChange={(keys) =>
        void node.setValue('onSelectionChange', keys === 'all' ? [] : [...keys].map(String))
      }
      onAction={node.on.onAction ? (key) => void node.fire('onAction', String(key)) : undefined}
    >
      {menu(node.items)}
    </Menu>
  )
}

export const pickerBlocks: Record<string, Block> = {
  Select: SelectBlock,
  ComboBox: ComboBoxBlock,
  ListBox: ListBoxBlock,
  ListBoxItem: Nothing,
  ListBoxSection: Nothing,
  Dropdown: DropdownBlock,
  Menu: MenuBlock,
  DropdownItem: Nothing,
  DropdownSection: Nothing,
}
