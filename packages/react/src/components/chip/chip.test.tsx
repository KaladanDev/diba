import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Chip } from './index'

/** A chip is soft unless it is told otherwise, as the Chip block is. */
describe('Chip', () => {
  it('is soft and default by default, as its block', () => {
    const { container } = render(<Chip>ارسال‌شده</Chip>)
    expect(container.querySelector('.chip')).toHaveClass('chip--soft', 'chip--default')
  })

  it('takes the look it is told', () => {
    const { container } = render(<Chip variant="secondary">ارسال‌شده</Chip>)
    expect(container.querySelector('.chip')).toHaveClass('chip--secondary')
    expect(container.querySelector('.chip')).not.toHaveClass('chip--soft')
  })
})
