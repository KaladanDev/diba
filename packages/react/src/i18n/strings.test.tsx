import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DibaProvider } from '../provider/DibaProvider'
import { Spinner } from '../components/spinner'
import { Modal } from '../components/modal'
import { dibaStrings, useDibaStrings, type DibaStrings } from './strings'

function Probe() {
  const t = useDibaStrings()
  return <span data-testid="probe">{t.close}</span>
}

describe('strings', () => {
  it('follows the provider locale', () => {
    const { rerender } = render(
      <DibaProvider locale="fa-IR">
        <Probe />
      </DibaProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('بستن')

    rerender(
      <DibaProvider locale="en-US">
        <Probe />
      </DibaProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('Close')
  })

  it('treats any fa-* locale as Persian', () => {
    render(
      <DibaProvider locale="fa">
        <Probe />
      </DibaProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('بستن')
  })

  it('falls back to English for a locale Diba does not carry', () => {
    render(
      <DibaProvider locale="de-DE">
        <Probe />
      </DibaProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('Close')
  })

  it('lets a merchant override individual strings', () => {
    render(
      <DibaProvider locale="en-US" strings={{ close: 'Dismiss' }}>
        <Probe />
      </DibaProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('Dismiss')
  })

  it('keeps the rest of the dictionary when overriding one string', () => {
    function All() {
      const t = useDibaStrings()
      return <span data-testid="all">{`${t.close}|${t.loading}`}</span>
    }
    render(
      <DibaProvider locale="en-US" strings={{ close: 'Dismiss' }}>
        <All />
      </DibaProvider>,
    )
    expect(screen.getByTestId('all')).toHaveTextContent('Dismiss|Loading')
  })

  it('carries the same keys in every locale', () => {
    const en = Object.keys(dibaStrings.en).sort()
    const fa = Object.keys(dibaStrings.fa).sort()
    expect(fa).toEqual(en)
  })

  /**
   * The bug this dictionary exists for: labels used to be hardcoded Persian, so
   * an English storefront announced "بستن" to a screen reader.
   */
  describe('component labels, in English', () => {
    it("Spinner's accessible name", () => {
      render(
        <DibaProvider locale="en-US">
          <Spinner />
        </DibaProvider>,
      )
      expect(screen.getByRole('status')).toHaveAccessibleName('Loading')
    })

    it("a modal's close button", async () => {
      render(
        <DibaProvider locale="en-US">
          <Modal.Backdrop isOpen>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Delete</Modal.Heading>
                </Modal.Header>
                <Modal.Body>body</Modal.Body>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </DibaProvider>,
      )
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('and still Persian under fa-IR', () => {
      render(
        <DibaProvider locale="fa-IR">
          <Spinner />
        </DibaProvider>,
      )
      expect(screen.getByRole('status')).toHaveAccessibleName('در حال بارگذاری')
    })
  })

  it('an explicit prop still beats the dictionary', () => {
    render(
      <DibaProvider locale="en-US">
        <Spinner aria-label="Fetching orders" />
      </DibaProvider>,
    )
    expect(screen.getByRole('status')).toHaveAccessibleName('Fetching orders')
  })

  it('exposes the dictionary type for consumer locales', () => {
    const custom: Partial<DibaStrings> = { close: 'Fermer' }
    expect(custom.close).toBe('Fermer')
  })
})
