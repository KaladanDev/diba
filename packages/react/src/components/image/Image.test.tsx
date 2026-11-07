import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { DibaProvider } from '../../provider/DibaProvider'
import { Image } from './Image'

describe('Image', () => {
  it('holds its shape before the picture arrives', () => {
    render(<Image src="/a.png" alt="روسری" ratio="4 / 3" />)
    expect(document.querySelector<HTMLElement>('[data-slot="image"]')!.style.aspectRatio).toBe(
      '4 / 3',
    )
  })

  it('shows a skeleton underneath while it loads', () => {
    render(<Image src="/a.png" alt="روسری" />)
    expect(document.querySelector('.db-image__placeholder')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="image"]')).toHaveAttribute('data-state', 'loading')
  })

  it('marks the picture loaded once it is', () => {
    render(<Image src="/a.png" alt="روسری" />)
    fireEvent.load(screen.getByRole('img'))
    expect(screen.getByRole('img')).toHaveAttribute('data-loaded')
    expect(document.querySelector('.db-image__placeholder')).not.toBeInTheDocument()
  })

  /**
   * A broken-image glyph is the browser telling the reader about a file. The
   * fallback tells them about the thing that was meant to be there.
   */
  it('says something was meant to be here when it fails', () => {
    render(<Image src="/nope.png" alt="روسری ابریشم" />)
    fireEvent.error(screen.getByRole('img'))
    expect(document.querySelector('[data-slot="image"]')).toHaveAttribute('data-state', 'failed')
    expect(screen.getByText('روسری ابریشم')).toBeInTheDocument()
  })

  /** The broken picture is still named by its alt; its words are not said a second time. */
  it('says its words once when it fails', () => {
    render(<Image src="/nope.png" alt="روسری ابریشم" />)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByRole('img', { name: 'روسری ابریشم' })).toBeInTheDocument()
    expect(document.querySelector('.db-image__fallback')).toHaveAttribute('aria-hidden', 'true')
  })

  it('says them, with no picture to name, when there is no src', () => {
    render(<Image alt="روسری ابریشم" />)
    expect(document.querySelector('.db-image__fallback')).not.toHaveAttribute('aria-hidden')
  })

  it('takes a fallback of its own', () => {
    render(<Image src="/nope.png" alt="روسری" fallback={<span data-testid="mine" />} />)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByTestId('mine')).toBeInTheDocument()
  })

  it('falls back with no src at all', () => {
    render(<Image alt="روسری" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(document.querySelector('.db-image__fallback')).toBeInTheDocument()
  })

  /** A picture that adds nothing the text already says should say nothing. */
  it('is decorative when its alt is empty', () => {
    render(<Image alt="" />)
    expect(document.querySelector('.db-image__fallback')).toHaveAttribute('aria-hidden', 'true')
  })

  it('is lazy unless told otherwise', () => {
    render(<Image src="/a.png" alt="x" />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy')
  })

  it('carries its fit and radius through to the classes, 12 round unless told', () => {
    const { unmount } = render(<Image src="/a.png" alt="x" />)
    expect(document.querySelector('[data-slot="image"]')).toHaveClass('db-image--radius-md')
    unmount()
    render(<Image src="/a.png" alt="x" fit="contain" radius="lg" />)
    expect(document.querySelector('[data-slot="image"]')).toHaveClass(
      'db-image',
      'db-image--contain',
      'db-image--radius-lg',
    )
  })

  it('takes the picture’s own shape when its ratio is auto', () => {
    render(<Image src="/a.png" alt="x" ratio="auto" />)
    expect(document.querySelector('[data-slot="image"]')).toHaveAttribute('data-ratio', 'auto')
  })

  /** Zoomable, as Flutter's and the block's: a press opens it larger, over the page. */
  describe('zoomable', () => {
    const show = (props: Partial<React.ComponentProps<typeof Image>> = {}) =>
      render(
        <DibaProvider locale="fa-IR" dir="rtl">
          <Image src="/scarf.png" alt="شال ابریشم" isZoomable {...props} />
        </DibaProvider>,
      )

    it('is a button named after what it shows', () => {
      show()
      expect(screen.getByRole('button', { name: 'بزرگ‌نمایی شال ابریشم' })).toBeInTheDocument()
    })

    it('opens the whole picture in a dialog named after it', async () => {
      show()
      await userEvent.click(screen.getByRole('button', { name: 'بزرگ‌نمایی شال ابریشم' }))
      const dialog = await screen.findByRole('dialog', { name: 'شال ابریشم' })
      expect(dialog.querySelector('img.db-image__enlarged')).toHaveAttribute('src', '/scarf.png')
    })

    it('a decorative one is named for what pressing does', () => {
      show({ alt: '' })
      expect(screen.getByRole('button', { name: 'بزرگ‌نمایی' })).toBeInTheDocument()
    })

    it('has nothing to press once the picture has failed', () => {
      show()
      fireEvent.error(document.querySelector('img')!)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  it('has no axe violations', async () => {
    const { container } = render(<Image src="/a.png" alt="روسری ابریشمی دیبا" />)
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
