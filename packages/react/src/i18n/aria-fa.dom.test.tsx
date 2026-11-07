import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DibaProvider } from '../provider/DibaProvider'
import { Label } from '../components/label'
import { NumberField } from '../components/number-field'
import { DibaSurface } from '../sdui'

/**
 * The strings React Aria writes, read back out of the DOM.
 *
 * The parity test next door proves the map is complete; this proves it is
 * actually reaching React Aria — the two failures it guards against are
 * different. A wrong package name passes one and fails the other.
 */
const fa = (node: React.ReactNode) =>
  render(
    <DibaProvider locale="fa-IR" dir="rtl">
      {node}
    </DibaProvider>,
  )

describe('React Aria speaks Persian', () => {
  it('names the calendar’s own step buttons', () => {
    fa(
      <DibaSurface
        tree={{ type: 'Calendar', props: { label: 'تاریخ', defaultValue: '2025-10-15' } } as never}
      />,
    )
    // By slot, not by role and name: React Aria labels the month heading's
    // announcer with the same words, so two elements answer to each.
    const [previous, next] = document.querySelectorAll('[data-slot="calendar-nav-button"]')
    expect(previous).toHaveAttribute('aria-label', 'قبلی')
    expect(next).toHaveAttribute('aria-label', 'بعدی')
  })

  it('describes a number field in Persian rather than as a "Number field"', () => {
    fa(
      <NumberField defaultValue={3}>
        <Label>تعداد</Label>
        <NumberField.Group>
          <NumberField.Input />
        </NumberField.Group>
      </NumberField>,
    )
    expect(screen.getByRole('textbox', { name: 'تعداد' })).toHaveAttribute(
      'aria-roledescription',
      'فیلد عددی',
    )
  })

  it('names each date segment', () => {
    fa(
      <DibaSurface
        tree={{ type: 'DateField', props: { label: 'تاریخ', defaultValue: '2025-10-15' } } as never}
      />,
    )
    const labels = [...document.querySelectorAll('[data-slot="date-input-group-segment"]')].map(
      (s) => s.getAttribute('aria-label'),
    )
    // React Aria appends its own separator to the segment name.
    expect(labels.filter(Boolean).map((l) => l!.replace(/[,\s]+$/, ''))).toEqual(
      expect.arrayContaining(['سال', 'ماه', 'روز']),
    )
  })

  /**
   * The collision the translation created and had to undo: React Aria injects
   * a hidden dismiss button into every overlay, and the natural Persian for it
   * is the same word Diba's own close button uses.
   */
  it('keeps its dismiss distinct from Diba’s own close', async () => {
    const { Modal } = await import('../components/modal')
    fa(
      <Modal.Backdrop isOpen>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>عنوان</Modal.Heading>
            </Modal.Header>
            <Modal.Body>متن</Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>,
    )
    const dismiss = screen.queryAllByRole('button', { name: 'رد کردن' })
    const close = screen.queryAllByRole('button', { name: 'بستن' })
    expect(close).toHaveLength(1)
    expect(dismiss.length).toBeLessThanOrEqual(1)
  })
})
