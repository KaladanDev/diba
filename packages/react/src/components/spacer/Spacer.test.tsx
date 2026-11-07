import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Spacer } from './Spacer'

const el = () => document.querySelector('[data-slot="spacer"]')!

describe('Spacer', () => {
  it('is a spacer of the default size on the block axis', () => {
    render(<Spacer />)
    expect(el()).toHaveClass('db-spacer', 'db-spacer--4', 'db-spacer--block')
  })

  it('carries its size and axis through to the classes', () => {
    render(<Spacer size={12} axis="inline" />)
    expect(el()).toHaveClass('db-spacer--12', 'db-spacer--inline')
  })

  /** It is not there. Announcing it would be announcing nothing. */
  it('is hidden from assistive technology', () => {
    render(
      <div>
        <p>یک</p>
        <Spacer />
        <p>دو</p>
      </div>,
    )
    expect(el()).toHaveAttribute('aria-hidden', 'true')
  })

  it('holds no text of its own', () => {
    render(<Spacer />)
    expect(el()).toBeEmptyDOMElement()
    expect(screen.queryByText(/\S/)).not.toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <p>یک</p>
        <Spacer size={8} />
        <p>دو</p>
      </div>,
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
