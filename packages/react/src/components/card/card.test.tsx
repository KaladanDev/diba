import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import {
  AlertDialog,
  Button,
  Card,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  Popover,
  Table,
  TextField,
} from '../../index'

/**
 * Group 6, containers: the copied Card, Table, Modal, AlertDialog, Popover and Form as Diba
 * exports them, composed the way the admin composes them.
 */

describe('Card', () => {
  it('lays out its parts', () => {
    const { container } = render(
      <Card variant="secondary">
        <Card.Header>
          <Card.Title>ارسال</Card.Title>
          <Card.Description>روش‌های ارسال</Card.Description>
        </Card.Header>
        <Card.Content>پست پیشتاز فعال است.</Card.Content>
        <Card.Footer>پانویس</Card.Footer>
      </Card>,
    )
    expect(container.querySelector('.card')).toHaveClass('card--secondary')
    expect(screen.getByText('ارسال')).toHaveClass('card__title')
    expect(screen.getByText('روش‌های ارسال')).toHaveClass('card__description')
    expect(screen.getByText('پست پیشتاز فعال است.')).toHaveClass('card__content')
    expect(screen.getByText('پانویس')).toHaveClass('card__footer')
  })
})

describe('Table', () => {
  it('is a labelled grid with a row header in each row', () => {
    render(
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="سفارش‌ها">
            <Table.Header>
              <Table.Column isRowHeader>سفارش</Table.Column>
              <Table.Column>مبلغ</Table.Column>
            </Table.Header>
            <Table.Body>
              <Table.Row id="1041">
                <Table.Cell>#1041</Table.Cell>
                <Table.Cell>۱٬۲۵۰٬۰۰۰</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>,
    )
    const table = screen.getByRole('grid', { name: 'سفارش‌ها' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['سفارش', 'مبلغ'])
    expect(within(table).getByRole('rowheader')).toHaveTextContent('#1041')
  })
})

describe('Form', () => {
  it('checks a required field before it submits', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: { preventDefault(): void }) => event.preventDefault())
    render(
      <Form onSubmit={onSubmit}>
        <TextField name="title" isRequired>
          <Label>عنوان</Label>
          <Input />
          <FieldError />
        </TextField>
        <Button type="submit">ذخیره</Button>
      </Form>,
    )
    await user.click(screen.getByRole('button', { name: 'ذخیره' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/عنوان/)).toHaveAttribute('aria-invalid', 'true')
    await user.type(screen.getByLabelText(/عنوان/), 'شال')
    await user.click(screen.getByRole('button', { name: 'ذخیره' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})

function Picker({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <Modal.Backdrop
      isOpen={open}
      onOpenChange={(next: boolean) => {
        setOpen(next)
        onOpenChange?.(next)
      }}
    >
      <Modal.Container>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>انتخاب محصول</Modal.Heading>
          </Modal.Header>
          <Modal.Body>محصولات مجموعه</Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              انصراف
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

describe('Modal', () => {
  it('is a dialog named by its heading, and a close-slot button closes it', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Picker onOpenChange={onOpenChange} />)
    const dialog = screen.getByRole('dialog', { name: 'انتخاب محصول' })
    expect(dialog).toHaveClass('modal__dialog')
    await user.click(within(dialog).getByRole('button', { name: 'انصراف' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Picker onOpenChange={onOpenChange} />)
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })
})

describe('AlertDialog', () => {
  it('is an alert dialog named by its heading', () => {
    render(
      <AlertDialog.Backdrop isOpen>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Heading>حذف این محصول؟</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>برگشت‌پذیر نیست.</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="danger">حذف</Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>,
    )
    expect(screen.getByRole('alertdialog', { name: 'حذف این محصول؟' })).toHaveClass(
      'alert-dialog__dialog',
    )
  })
})

describe('Popover', () => {
  // A Button is the trigger itself. Popover.Trigger is a role="button" wrapper for content that
  // is not a button; wrapped around a Button, as the admin's Gallery and StorePicker do, it nests
  // one button in another.
  it('opens from its trigger, as a dialog named by its heading', async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <Button size="sm" variant="ghost">
          متن جایگزین
        </Button>
        <Popover.Content placement="bottom">
          <Popover.Dialog>
            <Popover.Heading>متن جایگزین تصویر</Popover.Heading>
            <p>برای کسی که تصویر را نمی‌بیند.</p>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'متن جایگزین' }))
    expect(screen.getByRole('dialog', { name: 'متن جایگزین تصویر' })).toBeInTheDocument()
    expect(document.querySelector('.popover')).not.toBeNull()
  })
})
