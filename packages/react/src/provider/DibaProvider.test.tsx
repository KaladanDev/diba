import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { DibaProvider, resetDocumentOwner } from './DibaProvider'
import { Modal } from '../components/modal'
import { ListBox } from '../components/list-box'
import { Select } from '../components/select'

const root = (container: HTMLElement) => container.querySelector('.db-root') as HTMLElement

describe('DibaProvider', () => {
  it('applies theme and RTL direction for a Persian locale', () => {
    const { container } = render(
      <DibaProvider theme="dark" locale="fa-IR">
        <span>x</span>
      </DibaProvider>,
    )
    const el = root(container)
    expect(el).toHaveAttribute('data-theme', 'dark')
    expect(el).toHaveAttribute('dir', 'rtl')
    expect(el).toHaveAttribute('lang', 'fa-IR')
  })

  it('uses LTR for an English locale', () => {
    const { container } = render(
      <DibaProvider locale="en-US">
        <span>x</span>
      </DibaProvider>,
    )
    const el = root(container)
    expect(el).toHaveAttribute('dir', 'ltr')
  })

  /** The faces are the app's; a class the stylesheet defines nothing for promised one. */
  it('leaves the faces to the app', () => {
    const { container } = render(
      <DibaProvider locale="fa-IR" className="mine">
        <span>x</span>
      </DibaProvider>,
    )
    expect(root(container).className).toBe('db-root mine')
  })

  it('honors an explicit dir override', () => {
    const { container } = render(
      <DibaProvider locale="fa-IR" dir="ltr">
        <span>x</span>
      </DibaProvider>,
    )
    expect(root(container)).toHaveAttribute('dir', 'ltr')
  })
})

/**
 * Who is allowed to write on `<html>`.
 *
 * The provider reflects theme, direction and locale onto the document so that
 * portaled overlays match the tree they came from. That is right for the one
 * provider at the root of an app and wrong for every other one — a second
 * provider used to re-theme the whole page on mount and leave it that way on
 * unmount, which is the difference between a component library and a component
 * library you can let a third party render inside.
 */
describe('DibaProvider and the document', () => {
  const html = () => document.documentElement

  beforeEach(() => {
    resetDocumentOwner()
    for (const a of ['dir', 'data-theme', 'lang']) html().removeAttribute(a)
  })

  it('claims an unclaimed document', () => {
    const view = render(
      <DibaProvider theme="dark" locale="fa-IR">
        <span>x</span>
      </DibaProvider>,
    )
    expect(html().getAttribute('data-theme')).toBe('dark')
    expect(html().getAttribute('dir')).toBe('rtl')
    expect(html().classList.length).toBe(0)
    view.unmount()
  })

  it('puts back what it found when it unmounts', () => {
    html().setAttribute('data-theme', 'light')
    html().setAttribute('dir', 'ltr')

    const view = render(
      <DibaProvider theme="dark" locale="fa-IR">
        <span>x</span>
      </DibaProvider>,
    )
    expect(html().getAttribute('data-theme')).toBe('dark')

    view.unmount()
    expect(html().getAttribute('data-theme')).toBe('light')
    expect(html().getAttribute('dir')).toBe('ltr')
  })

  it('removes an attribute that was not there to begin with', () => {
    const view = render(
      <DibaProvider locale="en-US">
        <span>x</span>
      </DibaProvider>,
    )
    expect(html().hasAttribute('lang')).toBe(true)
    view.unmount()
    expect(html().hasAttribute('lang')).toBe(false)
  })

  it('leaves the document alone once someone else holds it', () => {
    const host = render(
      <DibaProvider theme="light" locale="fa-IR">
        <span>host</span>
      </DibaProvider>,
    )
    const guest = render(
      <DibaProvider theme="dark" locale="en-US" dir="ltr">
        <span>guest</span>
      </DibaProvider>,
    )

    expect(html().getAttribute('data-theme')).toBe('light')
    expect(html().getAttribute('dir')).toBe('rtl')
    expect(html().getAttribute('lang')).toBe('fa-IR')

    // And unmounting the guest does not undo the host's claim either.
    guest.unmount()
    expect(html().getAttribute('data-theme')).toBe('light')
    host.unmount()
  })

  it('never touches the document with ownsDocument={false}', () => {
    const view = render(
      <DibaProvider theme="dark" locale="fa-IR" ownsDocument={false}>
        <span>x</span>
      </DibaProvider>,
    )
    expect(html().hasAttribute('data-theme')).toBe(false)
    expect(html().hasAttribute('dir')).toBe(false)
    expect(html().classList.contains('font-fa')).toBe(false)
    view.unmount()
  })

  it('takes the document with ownsDocument even when it is claimed', () => {
    const host = render(
      <DibaProvider theme="light" locale="fa-IR">
        <span>host</span>
      </DibaProvider>,
    )
    const taker = render(
      <DibaProvider theme="dark" locale="fa-IR" ownsDocument>
        <span>taker</span>
      </DibaProvider>,
    )
    expect(html().getAttribute('data-theme')).toBe('dark')
    taker.unmount()
    host.unmount()
  })

  it('still scopes the wrapper regardless of who owns the document', () => {
    const { container } = render(
      <DibaProvider theme="dark" locale="fa-IR" ownsDocument={false}>
        <span>x</span>
      </DibaProvider>,
    )
    const el = container.querySelector('.db-root') as HTMLElement
    expect(el.getAttribute('data-theme')).toBe('dark')
    expect(el.getAttribute('dir')).toBe('rtl')
  })
})

/**
 * Where an overlay lands.
 *
 * React Aria portals to `document.body`, so an overlay opened inside a panel
 * ends up over the whole page. That is fine for an app that owns its document
 * and wrong for a host rendering something it did not write — the point of a
 * contained overlay is that it cannot cover the host's own chrome.
 *
 * Both halves are asserted, because "it is inside the container" proves nothing
 * unless the default really was outside it.
 */
describe('DibaProvider and where overlays go', () => {
  const modal = () => document.querySelector('[data-slot="modal-dialog"]')

  it('sends a dialog to the body by default', () => {
    const view = render(
      <DibaProvider ownsDocument={false}>
        <Modal.Backdrop isOpen>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Heading>عنوان</Modal.Heading>
              <Modal.Body>متن</Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </DibaProvider>,
    )
    const el = modal()
    expect(el, 'the dialog rendered at all').not.toBeNull()
    expect(el!.closest('.db-root')).toBeNull()
    view.unmount()
  })

  it('keeps a dialog inside the provider when asked to contain it', () => {
    const view = render(
      <DibaProvider ownsDocument={false} portalContainer="self">
        <Modal.Backdrop isOpen>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Heading>عنوان</Modal.Heading>
              <Modal.Body>متن</Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </DibaProvider>,
    )
    const el = modal()
    expect(el, 'the dialog rendered at all').not.toBeNull()
    expect(el!.closest('.db-root')).not.toBeNull()
    expect(el!.closest('.db-portal')).not.toBeNull()
    view.unmount()
  })

  /** Popover is the other portal root, and it carries six of the eight overlays. */
  it('contains a popover too, not just a modal', () => {
    const view = render(
      <DibaProvider ownsDocument={false} portalContainer="self">
        <Select aria-label="دسته" defaultOpen>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="a" textValue="شال">
                شال
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </DibaProvider>,
    )
    const list = document.querySelector('[role="listbox"]')
    expect(list, 'the listbox rendered at all').not.toBeNull()
    expect(list!.closest('.db-portal')).not.toBeNull()
    view.unmount()
  })
})
