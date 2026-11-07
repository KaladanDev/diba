import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, ButtonGroup } from '../../index'

/**
 * The copied Button as Diba exports it. The look is in the browser suite; this holds the
 * behaviour and the class names the stylesheet keys on, which admin-web's own CSS also targets
 * (`.button--secondary`, `.button`).
 */
describe('Button', () => {
  it('is a button, primary and md by default', () => {
    render(<Button>ذخیره</Button>)
    const button = screen.getByRole('button', { name: 'ذخیره' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('button', 'button--primary', 'button--md')
  })

  it('takes every variant and size as a modifier class', () => {
    const variants = [
      'primary',
      'secondary',
      'tertiary',
      'outline',
      'ghost',
      'danger',
      'danger-soft',
    ] as const
    for (const variant of variants) {
      for (const size of ['sm', 'md', 'lg'] as const) {
        const { unmount } = render(
          <Button variant={variant} size={size}>
            x
          </Button>,
        )
        expect(screen.getByRole('button')).toHaveClass(`button--${variant}`, `button--${size}`)
        unmount()
      }
    }
  })

  it('marks icon-only and full-width buttons', () => {
    render(
      <>
        <Button isIconOnly aria-label="حذف">
          ×
        </Button>
        <Button fullWidth>ادامه</Button>
      </>,
    )
    expect(screen.getByRole('button', { name: 'حذف' })).toHaveClass('button--icon-only')
    expect(screen.getByRole('button', { name: 'ادامه' })).toHaveClass('button--full-width')
  })

  it('calls onPress, and a disabled button does not', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()
    const { rerender } = render(<Button onPress={onPress}>ذخیره</Button>)
    await user.click(screen.getByRole('button'))
    expect(onPress).toHaveBeenCalledTimes(1)

    rerender(
      <Button onPress={onPress} isDisabled>
        ذخیره
      </Button>,
    )
    await user.click(screen.getByRole('button'))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('ignores presses while pending, and says so', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()
    render(
      <Button onPress={onPress} isPending>
        ذخیره
      </Button>,
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-pending', 'true')
    await user.click(button)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('submits its form when its type is submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">ارسال</Button>
      </form>,
    )
    await user.click(screen.getByRole('button'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})

describe('ButtonGroup', () => {
  it('hands its size, variant and isDisabled to the buttons directly inside it', () => {
    render(
      <ButtonGroup size="sm" variant="secondary" isDisabled>
        <Button>اول</Button>
        <Button>دوم</Button>
      </ButtonGroup>,
    )
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveClass('button--sm', 'button--secondary')
      expect(button).toBeDisabled()
    }
  })

  it('lets a button’s own props win over the group’s', () => {
    render(
      <ButtonGroup size="sm" variant="secondary">
        <Button variant="danger">حذف</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('button')).toHaveClass('button--sm', 'button--danger')
  })

  it('gives its props only to direct children, not to a button nested deeper', () => {
    render(
      <ButtonGroup size="lg">
        <span>
          <Button>درون</Button>
        </span>
      </ButtonGroup>,
    )
    expect(screen.getByRole('button')).toHaveClass('button--md')
  })

  it('is a group, horizontal unless told otherwise', () => {
    const { rerender } = render(
      <ButtonGroup aria-label="کارها">
        <Button>اول</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group', { name: 'کارها' })).toHaveClass(
      'button-group',
      'button-group--horizontal',
    )
    rerender(
      <ButtonGroup aria-label="کارها" orientation="vertical">
        <Button>اول</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group')).toHaveClass('button-group--vertical')
  })
})
