import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link } from '../../index'

/** The copied Link as Diba exports it. */
describe('Link', () => {
  it('is a link to its href, with the class the stylesheet keys on', () => {
    render(<Link href="/orders">سفارش‌ها</Link>)
    const link = screen.getByRole('link', { name: 'سفارش‌ها' })
    expect(link).toHaveAttribute('href', '/orders')
    expect(link).toHaveClass('link')
  })

  it('draws the external-link icon when Link.Icon has no children of its own', () => {
    const { container } = render(
      <Link href="https://kaladan.shop" target="_blank">
        کالادان
        <Link.Icon />
      </Link>,
    )
    const icon = container.querySelector('[data-slot="link-icon"]')
    expect(icon).toHaveClass('link__icon')
    expect(icon).toHaveAttribute('data-default-icon', 'true')
    expect(icon?.querySelector('[data-slot="link-default-icon"]')).not.toBeNull()
  })

  it('draws its own icon when Link.Icon is given one', () => {
    const { container } = render(
      <Link href="/help">
        راهنما
        <Link.Icon>
          <svg data-testid="own" />
        </Link.Icon>
      </Link>,
    )
    expect(screen.getByTestId('own')).toBeInTheDocument()
    expect(container.querySelector('[data-default-icon]')).toBeNull()
  })

  it('does not fire onPress when disabled', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()
    render(
      <Link onPress={onPress} isDisabled>
        حذف
      </Link>,
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-disabled', 'true')
    await user.click(link)
    expect(onPress).not.toHaveBeenCalled()
  })
})
