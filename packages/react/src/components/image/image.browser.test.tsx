import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Image } from './Image'
import { box, settled } from '../../test/visual'

const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const frame = () => document.querySelector<HTMLElement>('[data-slot="image"]')!

describe('image appearance', () => {
  /**
   * The whole point of the component. The box is the shape it will be before
   * the picture has said anything about itself, so a grid of these does not
   * reflow as they land.
   */
  it('holds the shape it was given before anything loads', async () => {
    render(
      <div style={{ width: 240 }}>
        <Image src="/never-arrives.png" alt="x" ratio="4 / 3" />
      </div>,
    )
    await settled(60)
    const b = box(frame())
    expect(b.width).toBe(240)
    expect(b.height).toBe(180)
  })

  it('and still does once it has', async () => {
    render(
      <div style={{ width: 240 }}>
        <Image src={PIXEL} alt="x" ratio="4 / 3" />
      </div>,
    )
    await settled(200)
    expect(frame()).toHaveAttribute('data-state', 'loaded')
    expect(box(frame()).height).toBe(180)
  })

  it('fades the picture in over what was already there', async () => {
    render(
      <div style={{ width: 200 }}>
        <Image src={PIXEL} alt="x" />
      </div>,
    )
    // Polled rather than waited out. A fixed sleep races the transition, and
    // the frame it loses reads 0.999 — a fade that finished, reported as one
    // that did not.
    await vi.waitFor(
      () => expect(Number(getComputedStyle(screen.getByRole('img')).opacity)).toBe(1),
      { timeout: 2000 },
    )
  })

  it('leaves a picture that never arrives invisible rather than torn', async () => {
    render(
      <div style={{ width: 200 }}>
        <Image src="/definitely-not-here.png" alt="روسری" />
      </div>,
    )
    await settled(300)
    expect(getComputedStyle(screen.getByRole('img')).opacity).toBe('0')
    expect(box(document.querySelector('.db-image__fallback')!).height).toBeGreaterThan(0)
  })

  it('clips the picture to its own box', async () => {
    render(
      <div style={{ width: 200 }}>
        <Image src={PIXEL} alt="x" ratio="2 / 1" />
      </div>,
    )
    await settled(200)
    expect(getComputedStyle(frame()).overflow).toBe('hidden')
    const img = box(screen.getByRole('img'))
    const b = box(frame())
    expect(img.width).toBe(b.width)
    expect(img.height).toBe(b.height)
  })

  it('covers by default and fits inside on request', async () => {
    const cover = render(<Image src={PIXEL} alt="x" />)
    await settled(200)
    expect(getComputedStyle(screen.getByRole('img')).objectFit).toBe('cover')
    cover.unmount()

    render(<Image src={PIXEL} alt="x" fit="contain" />)
    await settled(200)
    expect(getComputedStyle(screen.getByRole('img')).objectFit).toBe('contain')
  })

  it('rounds its corners 12 unless told, as the block does', async () => {
    const md = render(<Image src={PIXEL} alt="x" />)
    await settled(60)
    expect(getComputedStyle(frame()).borderRadius).toBe('12px')
    md.unmount()
    render(<Image src={PIXEL} alt="x" radius="none" />)
    await settled(60)
    expect(getComputedStyle(frame()).borderRadius).toBe('0px')
  })

  /** No ratio in a tree is the picture's own shape, as Flutter's; failed, its words still show. */
  it('auto: its own shape, and its words in the flow when it fails', async () => {
    const wide =
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"><rect width="300" height="100"/></svg>',
      )
    const { unmount } = render(
      <div style={{ width: 240 }}>
        <Image src={wide} alt="x" ratio="auto" />
      </div>,
    )
    await settled(300)
    expect(box(frame()).height).toBeCloseTo(80, 0)
    unmount()
    render(
      <div style={{ width: 240 }}>
        <Image src="data:image/png;base64,AAAA" alt="گلدان سفالی" ratio="auto" />
      </div>,
    )
    await settled(300)
    expect(box(document.querySelector('.db-image__fallback')!).height).toBeGreaterThan(20)
  })

  it('zoomable: a button the keyboard reaches, opening the picture larger', async () => {
    const { userEvent } = await import('@vitest/browser/context')
    render(<Image src={PIXEL} alt="شال" isZoomable />)
    await settled(100)
    await userEvent.tab()
    const trigger = document.activeElement as HTMLElement
    expect(trigger).toHaveAttribute('role', 'button')
    expect(getComputedStyle(trigger).cursor).toBe('zoom-in')
    await userEvent.keyboard('{Enter}')
    await settled(400)
    const dialog = screen.getByRole('dialog')
    expect(dialog.querySelector('.db-image__enlarged')).not.toBeNull()
  })
})
