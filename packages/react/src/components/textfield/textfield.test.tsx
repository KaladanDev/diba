import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Description, FieldError, Input, InputGroup, Label, TextArea, TextField } from '../../index'

/**
 * The copied TextField and the parts a field is composed of, as Diba exports them: Label,
 * Input, Description, FieldError, TextArea and InputGroup. React Aria wires them together through
 * its own contexts; this holds that wiring and the classes the stylesheet keys on.
 */
describe('TextField', () => {
  it('ties its label, input and description together', () => {
    render(
      <TextField>
        <Label>نام فروشگاه</Label>
        <Input />
        <Description>همان‌طور که در فروشگاه دیده می‌شود.</Description>
      </TextField>,
    )
    const input = screen.getByLabelText('نام فروشگاه')
    expect(input).toHaveClass('input', 'input--primary')
    const described = input.getAttribute('aria-describedby')!.split(' ')
    expect(described.map((id) => document.getElementById(id)?.textContent)).toContain(
      'همان‌طور که در فروشگاه دیده می‌شود.',
    )
    expect(screen.getByText('نام فروشگاه')).toHaveClass('label')
    expect(screen.getByText(/همان‌طور/)).toHaveClass('description')
  })

  it('reports what is typed', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TextField onChange={onChange}>
        <Label>نام</Label>
        <Input />
      </TextField>,
    )
    await user.type(screen.getByLabelText('نام'), 'شال')
    expect(onChange).toHaveBeenLastCalledWith('شال')
  })

  it('marks a required field, and shows its error once it is invalid', () => {
    render(
      <TextField isRequired isInvalid>
        <Label>ایمیل</Label>
        <Input />
        <FieldError>نشانی ایمیل درست نیست.</FieldError>
      </TextField>,
    )
    const input = screen.getByLabelText(/ایمیل/)
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('نشانی ایمیل درست نیست.')).toHaveClass('field-error')
  })

  it('hands its variant to its input', () => {
    render(
      <TextField variant="secondary">
        <Label>نام</Label>
        <Input />
      </TextField>,
    )
    expect(screen.getByLabelText('نام')).toHaveClass('input--secondary')
  })

  it('disables its input', () => {
    render(
      <TextField isDisabled>
        <Label>نام</Label>
        <Input />
      </TextField>,
    )
    expect(screen.getByLabelText('نام')).toBeDisabled()
  })
})

describe('TextArea', () => {
  it('is a labelled, multi-line field', () => {
    render(
      <TextField>
        <Label>توضیح</Label>
        <TextArea rows={4} />
      </TextField>,
    )
    const area = screen.getByLabelText('توضیح')
    expect(area.tagName).toBe('TEXTAREA')
    expect(area).toHaveClass('textarea')
    expect(area).toHaveAttribute('rows', '4')
  })
})

describe('InputGroup', () => {
  it('sets a prefix and a suffix around its input', () => {
    const { container } = render(
      <TextField>
        <Label>قیمت</Label>
        <InputGroup>
          <InputGroup.Prefix>از</InputGroup.Prefix>
          <InputGroup.Input />
          <InputGroup.Suffix>تومان</InputGroup.Suffix>
        </InputGroup>
      </TextField>,
    )
    expect(screen.getByLabelText('قیمت')).toHaveClass('input-group__input')
    expect(container.querySelector('.input-group')).not.toBeNull()
    expect(screen.getByText('از')).toHaveClass('input-group__prefix')
    expect(screen.getByText('تومان')).toHaveClass('input-group__suffix')
  })
})
