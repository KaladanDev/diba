import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { DibaProvider } from '../provider/DibaProvider'
import { AlertDialog, CloseButton, Modal, SearchField, Spinner, Tag, TagGroup } from '../index'

/**
 * The copied components hard-coded three English names: CloseButton's "Close", Spinner's
 * "Loading" and a tag's "Remove tag". A Persian screen-reader user heard all three, because the copies look
 * fine to anyone who only sees them. Diba's copies take them from its strings instead.
 *
 * CloseButton is also the toast's close button; the toast reads matchMedia, which jsdom lacks,
 * so it is covered here by the bare CloseButton and the parts that wrap it.
 */
const locales = [
  {
    locale: 'fa-IR',
    close: 'بستن',
    clear: 'پاک کردن',
    loading: 'در حال بارگذاری',
    removeTag: 'حذف برچسب',
  },
  { locale: 'en-US', close: 'Close', clear: 'Clear', loading: 'Loading', removeTag: 'Remove tag' },
] as const

/** A dialog also holds React Aria's hidden dismiss button, so its close trigger is found by slot. */
const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`)

function Tags({ children }: { children?: ReactNode }) {
  return (
    <TagGroup aria-label="برچسب‌ها" onRemove={() => {}}>
      <TagGroup.List>
        <Tag id="cotton">
          نخی
          {children}
        </Tag>
      </TagGroup.List>
    </TagGroup>
  )
}

describe.each(locales)('under $locale', ({ locale, close, clear, loading, removeTag }) => {
  const show = (ui: ReactNode) => render(<DibaProvider locale={locale}>{ui}</DibaProvider>)

  it('names a CloseButton', () => {
    show(<CloseButton />)
    expect(screen.getByRole('button')).toHaveAccessibleName(close)
  })

  // Clear, not the close button's Close it is drawn with.
  it("names a search field's clear button", () => {
    show(
      <SearchField aria-label="جستجو" defaultValue="شال">
        <SearchField.Group>
          <SearchField.Input />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>,
    )
    expect(screen.getByRole('button')).toHaveAccessibleName(clear)
  })

  it("names a modal's close trigger", () => {
    show(
      <Modal.Backdrop isOpen>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>انتخاب محصول</Modal.Heading>
            </Modal.Header>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>,
    )
    expect(slot('modal-close-trigger')).toHaveAccessibleName(close)
  })

  it("names an alert dialog's close trigger", () => {
    show(
      <AlertDialog.Backdrop isOpen>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Heading>حذف این محصول؟</AlertDialog.Heading>
            </AlertDialog.Header>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>,
    )
    expect(slot('alert-dialog-close-trigger')).toHaveAccessibleName(close)
  })

  it('names an unnamed Spinner', () => {
    show(<Spinner />)
    expect(screen.getByRole('status')).toHaveAccessibleName(loading)
  })

  it("names a tag's remove button, and React Aria adds the tag's name", () => {
    show(<Tags />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', removeTag)
    expect(button).toHaveAccessibleName(new RegExp(`^${removeTag} نخی`))
  })
})

describe("a caller's own name", () => {
  const show = (ui: ReactNode) => render(<DibaProvider locale="fa-IR">{ui}</DibaProvider>)

  it('beats the CloseButton default', () => {
    show(<CloseButton aria-label="بستن پیام" />)
    expect(screen.getByRole('button')).toHaveAccessibleName('بستن پیام')
  })

  it('beats the Spinner default', () => {
    show(<Spinner aria-label="در حال بارگذاری سفارش‌ها" />)
    expect(screen.getByRole('status')).toHaveAccessibleName('در حال بارگذاری سفارش‌ها')
  })

  it('beats the tag remove button default', () => {
    show(
      <Tags>
        <Tag.RemoveButton aria-label="حذف نخی" />
      </Tags>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'حذف نخی')
  })

  it("and a merchant's strings beat Diba's", () => {
    render(
      <DibaProvider locale="fa-IR" strings={{ close: 'بستن پنجره', removeTag: 'برداشتن' }}>
        <CloseButton />
        <Tags />
      </DibaProvider>,
    )
    const [close, remove] = screen.getAllByRole('button')
    expect(close).toHaveAccessibleName('بستن پنجره')
    expect(remove).toHaveAttribute('aria-label', 'برداشتن')
  })
})
