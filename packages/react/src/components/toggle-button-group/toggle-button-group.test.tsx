import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToggleButton, ToggleButtonGroup } from '../../index'

/**
 * The copied ToggleButton and ToggleButtonGroup as Diba exports them: React Aria's selection
 * rules, and the classes the stylesheet keys on.
 */
function Days(props: Partial<React.ComponentProps<typeof ToggleButtonGroup>>) {
  return (
    <ToggleButtonGroup aria-label="روزها" {...props}>
      <ToggleButton id="sat">شنبه</ToggleButton>
      <ToggleButton id="sun">یکشنبه</ToggleButton>
      <ToggleButton id="mon">دوشنبه</ToggleButton>
    </ToggleButtonGroup>
  )
}

describe('ToggleButtonGroup', () => {
  it('selects one at a time by default, and reports the selection', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(<Days onSelectionChange={onSelectionChange} />)

    await user.click(screen.getByRole('radio', { name: 'شنبه' }))
    await user.click(screen.getByRole('radio', { name: 'یکشنبه' }))

    expect(screen.getByRole('radio', { name: 'شنبه' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'یکشنبه' })).toBeChecked()
    expect([...onSelectionChange.mock.lastCall![0]]).toEqual(['sun'])
  })

  it('selects several when selectionMode is multiple', async () => {
    const user = userEvent.setup()
    render(<Days selectionMode="multiple" />)
    await user.click(screen.getByRole('button', { name: 'شنبه' }))
    await user.click(screen.getByRole('button', { name: 'دوشنبه' }))
    expect(screen.getByRole('button', { name: 'شنبه' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'دوشنبه' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'یکشنبه' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('keeps the last selection when an empty one is not allowed', async () => {
    const user = userEvent.setup()
    render(<Days defaultSelectedKeys={['sat']} disallowEmptySelection />)
    await user.click(screen.getByRole('radio', { name: 'شنبه' }))
    expect(screen.getByRole('radio', { name: 'شنبه' })).toBeChecked()
  })

  it('hands its size to its buttons', () => {
    render(<Days size="sm" />)
    for (const button of screen.getAllByRole('radio')) {
      expect(button).toHaveClass('toggle-button', 'toggle-button--sm')
    }
  })

  it('marks detached, full-width and vertical groups', () => {
    render(<Days isDetached fullWidth orientation="vertical" />)
    expect(screen.getByRole('radiogroup')).toHaveClass(
      'toggle-button-group',
      'toggle-button-group--detached',
      'toggle-button-group--full-width',
      'toggle-button-group--vertical',
    )
  })

  it('disables every button when the group is disabled', () => {
    render(<Days isDisabled />)
    for (const button of screen.getAllByRole('radio')) expect(button).toBeDisabled()
  })
})

describe('ToggleButton', () => {
  it('toggles on its own, outside a group', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ToggleButton onChange={onChange}>پررنگ</ToggleButton>)
    const button = screen.getByRole('button', { name: 'پررنگ' })
    await user.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(button).toHaveAttribute('data-selected', 'true')
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('takes the ghost variant and icon-only modifier', () => {
    render(
      <ToggleButton variant="ghost" isIconOnly aria-label="پررنگ">
        B
      </ToggleButton>,
    )
    expect(screen.getByRole('button')).toHaveClass(
      'toggle-button--ghost',
      'toggle-button--icon-only',
    )
  })
})
