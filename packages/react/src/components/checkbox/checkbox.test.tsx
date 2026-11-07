import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DibaProvider } from '../../provider/DibaProvider'
import {
  Checkbox,
  CheckboxGroup,
  Description,
  Label,
  Radio,
  RadioGroup,
  Slider,
  Switch,
} from '../../index'

/**
 * Group 4, the choices: the copied Checkbox, CheckboxGroup, Radio, RadioGroup, Switch and
 * Slider as Diba exports them, composed the way the admin composes them. React Aria does the
 * choosing; this holds the wiring, the state attributes the stylesheet keys on, and the two
 * things Diba's copy adds to the slider: a fill from the inline start, and step dots.
 */

function Box(props: Record<string, unknown> & { label: string; note?: string }) {
  const { label, note, ...rest } = props
  return (
    <Checkbox {...rest}>
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Label>{label}</Label>
      </Checkbox.Content>
      {note ? <Description>{note}</Description> : null}
    </Checkbox>
  )
}

describe('Checkbox', () => {
  it('is a labelled checkbox that reports being checked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<Box label="ارسال رایگان" onChange={onChange} />)
    const box = screen.getByRole('checkbox', { name: 'ارسال رایگان' })
    expect(container.querySelector('.checkbox')).not.toBeNull()
    expect(container.querySelector('.checkbox__control')).not.toBeNull()
    await user.click(screen.getByText('ارسال رایگان'))
    expect(onChange).toHaveBeenLastCalledWith(true)
    expect(box).toBeChecked()
    expect(container.querySelector('.checkbox')).toHaveAttribute('data-selected', 'true')
  })

  it('says “some” when indeterminate', () => {
    render(<Box label="همهٔ انبارها" isIndeterminate />)
    expect(screen.getByRole('checkbox')).toBePartiallyChecked()
  })

  it('is required, and invalid when told', () => {
    const { container } = render(<Box label="قوانین" isRequired isInvalid />)
    expect(screen.getByRole('checkbox')).toBeRequired()
    expect(container.querySelector('.checkbox')).toHaveAttribute('data-invalid', 'true')
  })
})

describe('CheckboxGroup', () => {
  it('reports the values checked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <CheckboxGroup defaultValue={['post']} onChange={onChange}>
        <Label>روش‌های ارسال</Label>
        <Box value="post" label="پست" />
        <Box value="courier" label="پیک" />
      </CheckboxGroup>,
    )
    expect(screen.getByRole('group', { name: 'روش‌های ارسال' })).toHaveClass('checkbox-group')
    await user.click(screen.getByText('پیک'))
    expect(onChange).toHaveBeenLastCalledWith(['post', 'courier'])
  })
})

describe('RadioGroup', () => {
  it('chooses one, and skips a disabled one', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const radio = (value: string, label: string, isDisabled = false) => (
      <Radio value={value} isDisabled={isDisabled}>
        <Radio.Content>
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Label>{label}</Label>
        </Radio.Content>
      </Radio>
    )
    render(
      <RadioGroup defaultValue="manual" onChange={onChange}>
        <Label>نوع مجموعه</Label>
        {radio('manual', 'دستی')}
        {radio('auto', 'خودکار')}
        {radio('off', 'خاموش', true)}
      </RadioGroup>,
    )
    expect(screen.getByRole('radiogroup', { name: 'نوع مجموعه' })).toHaveClass('radio-group')
    expect(screen.getByRole('radio', { name: 'دستی' })).toBeChecked()
    await user.click(screen.getByText('خودکار'))
    expect(onChange).toHaveBeenLastCalledWith('auto')
    expect(screen.getByRole('radio', { name: 'خاموش' })).toBeDisabled()
  })
})

describe('Switch', () => {
  it('is a labelled switch that reports being on', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(
      <Switch onChange={onChange} size="sm">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Label>ارسال لازم دارد</Label>
        </Switch.Content>
      </Switch>,
    )
    expect(container.querySelector('.switch')).toHaveClass('switch--sm')
    await user.click(screen.getByText('ارسال لازم دارد'))
    expect(onChange).toHaveBeenLastCalledWith(true)
    expect(screen.getByRole('switch', { name: 'ارسال لازم دارد' })).toBeChecked()
  })
})

describe('Slider', () => {
  function Price(props: Record<string, unknown>) {
    return (
      <DibaProvider locale="fa-IR" dir="rtl">
        <Slider minValue={0} maxValue={100} {...props}>
          <Label>شفافیت</Label>
          <Slider.Output />
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
      </DibaProvider>
    )
  }

  it('writes its value in Persian, and moves with the keys', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<Price defaultValue={30} onChange={onChange} />)
    expect(container.querySelector('.slider__output')).toHaveTextContent('۳۰')
    await user.tab()
    expect(screen.getByRole('slider', { name: 'شفافیت' })).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(onChange).toHaveBeenLastCalledWith(31)
  })

  it('starts its fill at the inline start, so it grows from the right in Persian', () => {
    const { container } = render(<Price defaultValue={30} />)
    const fill = container.querySelector<HTMLElement>('.slider__fill')!
    expect(fill.style.insetInlineStart).toBe('0%')
    expect(fill.style.left).toBe('')
    expect(fill.style.width).toBe('30%')
  })

  it('draws no step dots until its track has been measured', () => {
    const { container } = render(<Price defaultValue={30} step={10} />)
    expect(container.querySelector('.slider__steps')).toBeNull()
  })
})
