import { useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link as LinkPrimitive, OverlayTriggerStateContext } from 'react-aria-components'
import { AlertDialog } from '../../components/alert-dialog'
import { Button } from '../../components/button'
import { Card } from '../../components/card'
import { Checkbox } from '../../components/checkbox'
import { Form } from '../../components/form'
import { Modal } from '../../components/modal'
import { Popover } from '../../components/popover'
import { Table } from '../../components/table'
import type { Block, Item, NodeContext } from '../node'
import { ErrorText, Icon, Nothing, placementOf, propsOf, useSay } from './common'

/**
 * An open overlay, registered with the surface for as long as it is open, so
 * `close` closes the innermost one this tree opened and nothing else.
 */
export function OverlayScope({
  node,
  close,
  children,
}: {
  node: NodeContext
  /** How it closes; without one, the trigger's own overlay state. */
  close?: () => void
  children: ReactNode
}) {
  const state = useContext(OverlayTriggerStateContext)
  // Registered once, for as long as it is mounted: re-registering on every
  // render would move an outer overlay after an inner one.
  const latest = useRef({ close: close ?? (() => state?.close()), overlay: node.overlay })
  latest.current.close = close ?? (() => state?.close())
  useEffect(() => latest.current.overlay(() => latest.current.close()), [])
  return <>{children}</>
}

/** Everything a merchant can press or type into: a card with an href holds none of it. */
const INTERACTIVE = new Set([
  // A trigger or a link in a slot, or links of its own; Drawer was missing too.
  'Breadcrumbs',
  'Menu',
  'Sheet',
  'Drawer',
  'Button',
  'LinkButton',
  'Link',
  'ToggleButtonGroup',
  'TextField',
  'TextArea',
  'SearchField',
  'NumberField',
  'DateField',
  'Select',
  'ComboBox',
  'ListBox',
  'Dropdown',
  'Checkbox',
  'CheckboxGroup',
  'RadioGroup',
  'Switch',
  'Slider',
  'TagGroup',
  'Table',
  'Modal',
  'AlertDialog',
  'Popover',
  'Form',
])
const interactive = (items: Item[]): boolean =>
  items.some((item) => INTERACTIVE.has(item.type) || interactive(item.items))

/**
 * A card that opens something is a link around the card. A link inside a link
 * is broken for keyboards and screen readers, so an href over interactive
 * content — or beside an action — is refused and the content kept.
 */
const CardBlock: Block = ({ node }) => {
  const p = propsOf(node)
  let href = p.href as string | undefined
  if (href && (node.slots.action || interactive(node.items))) {
    node.refuse('href over interactive content')
    href = undefined
  }
  const card = (
    <Card variant={p.variant} style={p.isFlush ? { padding: 0, overflow: 'hidden' } : undefined}>
      {p.title || p.description || node.slots.action ? (
        <Card.Header>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {p.title ? <Card.Title>{p.title}</Card.Title> : null}
              {p.description ? <Card.Description>{p.description}</Card.Description> : null}
            </div>
            {node.slots.action}
          </div>
        </Card.Header>
      ) : null}
      {/* Only with something in it: an empty content is still a flex item, 12 more under the
          header. */}
      {node.items.length ? <Card.Content>{node.children}</Card.Content> : null}
      {node.slots.footer ? <Card.Footer>{node.slots.footer}</Card.Footer> : null}
    </Card>
  )
  if (!href) return card
  return (
    <LinkPrimitive
      href={href}
      style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
    >
      {card}
    </LinkPrimitive>
  )
}

const ALIGN: Record<string, 'start' | 'center' | 'end'> = {
  start: 'start',
  center: 'center',
  end: 'end',
}

/**
 * The selection box React Aria needs in a table that selects. React Aria names it in the page's
 * language: "select all" in the head, and in a row "select" and the row's name, from its row header.
 */
function SelectionBox() {
  return (
    <Checkbox slot="selection">
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox.Content>
    </Checkbox>
  )
}

/** Rows of records under named columns, chosen, sorted and opened as the server says. */
const TableBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const say = useSay()
  const part = (type: string) => node.items.find((item) => item.type === type)
  const columns = (part('TableHeader')?.items ?? []).filter((c) => c.type === 'Column')
  const rows = (part('TableBody')?.items ?? []).filter((r) => r.type === 'Row')
  const totals = (part('TableFooter')?.items ?? []).filter((r) => r.type === 'Row')
  const selecting = p.selectionMode === 'single' || p.selectionMode === 'multiple'
  const align = columns.map((c) => ALIGN[c.props.align as string] ?? 'start')

  // Sorting is two flat props, each a value pair; the local value is the
  // last sort the merchant asked for.
  const { sortColumn, sortDirection, defaultSortColumn, defaultSortDirection, emptyMessage } = p
  const local = node.local('sort') as { column?: string; direction?: string } | undefined
  const column: string | undefined = sortColumn ?? local?.column ?? defaultSortColumn
  const direction: string = sortDirection ?? local?.direction ?? defaultSortDirection ?? 'ascending'

  const cells = (row: Item) =>
    row.items
      .filter((c) => c.type === 'Cell')
      .map((cell, i) => (
        <Table.Cell key={cell.path} align={align[i]}>
          {cell.text ?? cell.items.map((item) => item.element)}
        </Table.Cell>
      ))

  return (
    <Table variant={p.variant}>
      <Table.ScrollContainer>
        <Table.Content
          aria-label={p.label}
          selectionMode={p.selectionMode}
          selectedKeys={(node.current as string[] | undefined) ?? []}
          onSelectionChange={(keys) =>
            void node.setValue(
              'onSelectionChange',
              keys === 'all' ? rows.map((r) => String(r.props.id)) : [...keys].map(String),
            )
          }
          sortDescriptor={
            column ? { column, direction: direction as 'ascending' | 'descending' } : undefined
          }
          onSortChange={(sort) =>
            void node.setValue(
              'onSortChange',
              { column: String(sort.column), direction: sort.direction },
              'sort',
            )
          }
          onRowAction={
            node.on.onRowAction ? (key) => void node.fire('onRowAction', String(key)) : undefined
          }
        >
          <Table.Header>
            {selecting ? (
              <Table.Column id="__select">
                {p.selectionMode === 'multiple' ? <SelectionBox /> : null}
              </Table.Column>
            ) : null}
            {columns.map((c, i) => {
              const q = c.props as Record<string, any>
              return (
                <Table.Column
                  key={c.path}
                  id={q.id}
                  isRowHeader={q.isRowHeader}
                  allowsSorting={q.allowsSorting}
                  align={align[i]}
                >
                  {q.allowsSorting
                    ? ({ sortDirection }: any) => (
                        <Table.SortableColumnHeader sortDirection={sortDirection}>
                          {c.text}
                        </Table.SortableColumnHeader>
                      )
                    : c.text}
                </Table.Column>
              )
            })}
          </Table.Header>
          <Table.Body
            renderEmptyState={() =>
              emptyMessage ? <div className="table__empty">{emptyMessage}</div> : null
            }
          >
            {rows.map((r) => (
              <Table.Row
                key={r.path}
                id={r.props.id as string}
                href={r.props.href as string | undefined}
                isDisabled={r.props.isDisabled as boolean | undefined}
              >
                {selecting ? (
                  <Table.Cell>
                    <SelectionBox />
                  </Table.Cell>
                ) : null}
                {cells(r)}
              </Table.Row>
            ))}
          </Table.Body>
          {totals.length ? (
            // Totals inside the table, under their columns. A table that
            // selects skips them.
            <Table.Foot>
              {totals.map((r) => (
                <Table.Row
                  key={r.path}
                  id={(r.props.id as string) ?? r.path}
                  isDisabled={selecting}
                >
                  {selecting ? <Table.Cell>{''}</Table.Cell> : null}
                  {cells(r)}
                </Table.Row>
              ))}
            </Table.Foot>
          ) : null}
        </Table.Content>
      </Table.ScrollContainer>
      {node.on.onLoadMore ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
          <Button
            variant="ghost"
            size="sm"
            isPending={p.isLoadingMore}
            onPress={() => void node.fire('onLoadMore')}
          >
            {say('loadMore')}
          </Button>
        </div>
      ) : null}
    </Table>
  )
}

/** A dialog opened by its trigger, and only by it, on the overlay's paper. */
const ModalBlock: Block = ({ node }) => {
  const p = propsOf(node)
  // Read here, not inside the dialog, which draws only while it is open.
  const { title, icon } = p
  const say = useSay()
  const trigger = node.slots.trigger
  if (!trigger) {
    node.refuse('no trigger')
    return null
  }
  return (
    <Modal
      onOpenChange={
        node.on.onOpenChange ? (open: boolean) => void node.fire('onOpenChange', open) : undefined
      }
    >
      {trigger}
      <Modal.Backdrop variant={p.backdrop} isDismissable={p.isDismissable}>
        <Modal.Container size={p.size} scroll={p.scroll} placement={p.placement}>
          <Modal.Dialog>
            {({ close }: { close: () => void }) => (
              <OverlayScope node={node} close={close}>
                <Modal.CloseTrigger aria-label={say('close')} />
                <Modal.Header>
                  {icon ? (
                    <Modal.Icon>
                      <Icon name={icon} />
                    </Modal.Icon>
                  ) : null}
                  <Modal.Heading>{title}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {node.children}
                  </div>
                </Modal.Body>
                {node.slots.footer ? <Modal.Footer>{node.slots.footer}</Modal.Footer> : null}
              </OverlayScope>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}

/** The confirm button shows pending until onConfirm's call resolves. */
function ConfirmFooter({
  node,
  close,
  status,
  confirmLabel,
  cancelLabel,
}: {
  node: NodeContext
  close: () => void
  status: string
  confirmLabel: string
  cancelLabel?: string
}) {
  const say = useSay()
  const [pending, setPending] = useState(false)
  return (
    <AlertDialog.Footer>
      <Button
        variant="tertiary"
        isDisabled={pending}
        onPress={() => {
          void node.fire('onCancel')
          close()
        }}
      >
        {cancelLabel ?? say('cancel')}
      </Button>
      <Button
        variant={status === 'danger' ? 'danger' : 'primary'}
        isPending={pending}
        onPress={async () => {
          setPending(true)
          const done = await node.fire('onConfirm')
          setPending(false)
          if (done) close()
        }}
      >
        {confirmLabel}
      </Button>
    </AlertDialog.Footer>
  )
}

/** A confirmation, the admin's ConfirmDialog. */
const AlertDialogBlock: Block = ({ node }) => {
  const p = propsOf(node)
  // Read here, not inside the dialog, which draws only while it is open.
  const { status, title, description, confirmLabel, cancelLabel } = p
  const trigger = node.slots.trigger
  if (!trigger) {
    node.refuse('no trigger')
    return null
  }
  return (
    <AlertDialog>
      {trigger}
      <AlertDialog.Backdrop variant={p.backdrop}>
        <AlertDialog.Container size={p.size}>
          <AlertDialog.Dialog>
            {({ close }: { close: () => void }) => (
              <OverlayScope node={node} close={close}>
                <AlertDialog.Header>
                  <AlertDialog.Icon status={status} />
                  <AlertDialog.Heading>{title}</AlertDialog.Heading>
                </AlertDialog.Header>
                {description ? <AlertDialog.Body>{description}</AlertDialog.Body> : null}
                <ConfirmFooter
                  node={node}
                  close={close}
                  status={status}
                  confirmLabel={confirmLabel}
                  cancelLabel={cancelLabel}
                />
              </OverlayScope>
            )}
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}

/** A panel opened by its trigger, and only by it. */
const PopoverBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const trigger = node.slots.trigger
  if (!trigger) {
    node.refuse('no trigger')
    return null
  }
  return (
    <Popover
      onOpenChange={
        node.on.onOpenChange ? (open: boolean) => void node.fire('onOpenChange', open) : undefined
      }
    >
      {trigger}
      <Popover.Content
        placement={placementOf(p.placement)}
        offset={p.offset}
        isNonModal={p.isNonModal}
      >
        <Popover.Dialog>
          <OverlayScope node={node}>
            {p.showArrow ? <Popover.Arrow /> : null}
            {p.title ? <Popover.Heading>{p.title}</Popover.Heading> : null}
            {node.children}
          </OverlayScope>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}

/**
 * Fields that submit together. The checks run first, in Diba's own words;
 * then onSubmit hands its action the named fields.
 */
const FormBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const gap = typeof p.gap === 'number' ? p.gap * 4 : 16
  return (
    <Form
      validationBehavior="aria"
      onSubmit={(event) => {
        event.preventDefault()
        void node.form?.submit()
      }}
      onReset={(event) => {
        event.preventDefault()
        node.form?.reset()
      }}
      style={{ display: 'flex', flexDirection: 'column', gap }}
    >
      {node.children}
      <ErrorText>{p.errorMessage}</ErrorText>
    </Form>
  )
}

export const containerBlocks: Record<string, Block> = {
  Card: CardBlock,
  Table: TableBlock,
  TableHeader: Nothing,
  TableBody: Nothing,
  TableFooter: Nothing,
  Column: Nothing,
  Row: Nothing,
  Cell: Nothing,
  Modal: ModalBlock,
  AlertDialog: AlertDialogBlock,
  Popover: PopoverBlock,
  Form: FormBlock,
}
