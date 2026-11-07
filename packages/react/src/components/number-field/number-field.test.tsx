import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DibaProvider } from '../../provider/DibaProvider'
import { Label, NumberField } from '../../index'

/**
 * The copied NumberField as Diba exports it, composed as admin-web's order editor composes it:
 * a group holding the decrement button, the input and the increment button. Under a Persian
 * locale React Aria writes the number in Persian digits.
 */
function Quantity(props: Partial<React.ComponentProps<typeof NumberField>>) {
  return (
    <DibaProvider locale="fa-IR" dir="rtl" ownsDocument={false}>
      <NumberField minValue={0} {...props}>
        <Label>تعداد</Label>
        <NumberField.Group>
          <NumberField.DecrementButton />
          <NumberField.Input />
          <NumberField.IncrementButton />
        </NumberField.Group>
      </NumberField>
    </DibaProvider>
  )
}

describe('NumberField', () => {
  it('writes its value in Persian digits, with the classes the stylesheet keys on', () => {
    const { container } = render(<Quantity defaultValue={12} />)
    const input = screen.getByRole('textbox', { name: 'تعداد' })
    expect(input).toHaveValue('۱۲')
    expect(input).toHaveClass('number-field__input')
    expect(container.querySelector('.number-field__group')).not.toBeNull()
  })

  it('steps up and down by its step, and stops at its minimum', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Quantity defaultValue={1} step={1} onChange={onChange} />)
    const [decrement, increment] = screen.getAllByRole('button')
    await user.click(increment!)
    expect(onChange).toHaveBeenLastCalledWith(2)
    await user.click(decrement!)
    await user.click(decrement!)
    expect(onChange).toHaveBeenLastCalledWith(0)
    expect(decrement).toBeDisabled()
  })
})
