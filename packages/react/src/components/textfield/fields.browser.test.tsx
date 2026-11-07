import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { page, userEvent } from '@vitest/browser/context'
import { useState, type ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { settled } from '../../test/visual'
import {
  Button,
  FieldError,
  Form,
  Input,
  InputOTP,
  Label,
  NumberField,
  SearchField,
  TextArea,
  TextField,
} from '../../index'

/**
 * The text fields' own words and digits: what a field's built-in checks say, in the page's
 * language and not the browser's; a number's digits, the page's whichever were typed; the search
 * field's clear button's name; and a one-time code held in Latin digits and shown in the page's.
 * The test browser's language is English, so a Persian page here is one in an English browser.
 */

function Card({ locale = 'fa-IR', children }: { locale?: string; children: ReactNode }) {
  return (
    <DibaProvider theme="light" locale={locale} dir={locale.startsWith('fa') ? 'rtl' : 'ltr'}>
      <div
        data-reduce-motion="true"
        style={{
          background: 'var(--surface)',
          color: 'var(--foreground)',
          padding: 16,
          width: 360,
        }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

/** A form holding [children] and a send button; what it sent, if it did. */
function sendable(children: ReactNode, locale = 'fa-IR', behaviour?: 'aria') {
  const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => e.preventDefault())
  const view = render(
    <Card locale={locale}>
      <Form onSubmit={onSubmit} validationBehavior={behaviour}>
        {children}
        <Button type="submit">send</Button>
      </Form>
    </Card>,
  )
  const send = async () => {
    await userEvent.click(view.getByText('send'))
    await settled(60)
  }
  const error = () => view.container.querySelector('[data-slot="field-error"]')?.textContent ?? ''
  return { onSubmit, send, error, ...view }
}

function Text(props: React.ComponentProps<typeof TextField>) {
  return (
    <TextField {...props}>
      <Label>field</Label>
      <Input />
      <FieldError />
    </TextField>
  )
}

describe("a field's own checks speak the page's language", () => {
  it('a required field left empty, on a Persian page in an English browser, and the form waits', async () => {
    await page.viewport(1280, 800)
    const { onSubmit, send, error } = sendable(<Text isRequired />)
    await send()
    expect(error()).toBe('این فیلد الزامی است.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('an email, a web address, the fewest letters and a pattern', async () => {
    const email = sendable(<Text type="email" defaultValue="niloufar@" />)
    await email.send()
    expect(email.error()).toBe('نشانی ایمیل درست نیست.')
    email.unmount()

    const url = sendable(<Text type="url" defaultValue="kaladan.shop" />)
    await url.send()
    expect(url.error()).toBe('نشانی وب درست نیست.')
    url.unmount()

    // The count in the page's digits; a Persian letter with its mark counts once, as a reader
    // counts it, where the browser counted two.
    const short = sendable(<Text minLength={3} defaultValue="شب" />)
    await short.send()
    expect(short.error()).toBe('دست‌کم ۳ نویسه بنویسید.')
    short.unmount()
    const marked = sendable(<Text minLength={2} defaultValue="شَ" />)
    await marked.send()
    expect(marked.error()).toBe('دست‌کم ۲ نویسه بنویسید.')
    marked.unmount()
    const enough = sendable(<Text minLength={2} defaultValue="شب" />)
    await enough.send()
    expect(enough.error()).toBe('')
    enough.unmount()

    const pattern = sendable(<Text pattern="[A-Z]{2}-\d{3}" defaultValue="sh-104" />)
    await pattern.send()
    expect(pattern.error()).toBe('به قالب خواسته‌شده بنویسید.')
    pattern.unmount()

    const fine = sendable(<Text pattern="[A-Z]{2}-\d{3}" defaultValue="SH-104" type="text" />)
    await fine.send()
    expect(fine.error()).toBe('')
    expect(fine.onSubmit).toHaveBeenCalledTimes(1)
  })

  it("an English page in English; a caller's own check still goes first", async () => {
    const en = sendable(<Text isRequired />, 'en-US')
    await en.send()
    expect(en.error()).toBe('This field is required.')
    en.unmount()

    const own = sendable(<Text isRequired validate={() => 'Not this one.'} />, 'en-US')
    await own.send()
    expect(own.error()).toBe('Not this one.')
  })

  it('a field that shows what is wrong at once checks nothing built in', async () => {
    const { onSubmit, send, error, container } = sendable(<Text isRequired />, 'fa-IR', 'aria')
    await send()
    expect(error()).toBe('')
    expect(container.querySelector('[data-slot="textfield"]')!.hasAttribute('data-invalid')).toBe(
      false,
    )
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('a text area, a search field and a number field say it too', async () => {
    const area = sendable(
      <TextField isRequired>
        <Label>note</Label>
        <TextArea />
        <FieldError />
      </TextField>,
    )
    await area.send()
    expect(area.error()).toBe('این فیلد الزامی است.')
    area.unmount()

    const search = sendable(
      <SearchField isRequired aria-label="search">
        <SearchField.Group>
          <SearchField.Input />
        </SearchField.Group>
        <FieldError />
      </SearchField>,
    )
    await search.send()
    expect(search.error()).toBe('این فیلد الزامی است.')
    search.unmount()

    const number = sendable(
      <NumberField isRequired>
        <Label>price</Label>
        <NumberField.Group>
          <NumberField.Input />
        </NumberField.Group>
        <FieldError />
      </NumberField>,
    )
    await number.send()
    expect(number.error()).toBe('این فیلد الزامی است.')
  })
})

describe("a number's digits are the page's", () => {
  function Price({ locale = 'fa-IR', step }: { locale?: string; step?: number }) {
    const [value, setValue] = useState(Number.NaN)
    return (
      <Card locale={locale}>
        <NumberField
          value={value}
          onChange={setValue}
          step={step}
          formatOptions={step ? { maximumFractionDigits: 1 } : undefined}
        >
          <Label>price</Label>
          <NumberField.Group>
            <NumberField.Input />
          </NumberField.Group>
        </NumberField>
        <output>{String(value)}</output>
        <button type="button">away</button>
      </Card>
    )
  }

  it('Latin digits typed on a Persian page are Persian as typed, and once the field is left', async () => {
    const view = render(<Price />)
    const input = view.container.querySelector<HTMLInputElement>('input')!
    await userEvent.click(input)
    await userEvent.keyboard('1250')
    expect(input.value).toBe('۱۲۵۰')
    await userEvent.click(view.getByText('away'))
    await settled(40)
    expect(input.value).toBe('۱٬۲۵۰')
    expect(view.container.querySelector('output')!.textContent).toBe('1250')
  })

  it('a decimal mark typed becomes the page’s, and the caret stays where it was', async () => {
    const view = render(<Price step={0.5} />)
    const input = view.container.querySelector<HTMLInputElement>('input')!
    await userEvent.click(input)
    await userEvent.keyboard('12.5')
    expect(input.value).toBe('۱۲٫۵')
    // Back to between the 1 and the 2: what is typed there goes there.
    input.setSelectionRange(1, 1)
    await userEvent.keyboard('9')
    expect(input.value).toBe('۱۹۲٫۵')
    expect(input.selectionStart).toBe(2)
    await userEvent.click(view.getByText('away'))
    await settled(40)
    expect(view.container.querySelector('output')!.textContent).toBe('192.5')
  })

  it('a value that arrives without typing, as an autofill does, is turned too', async () => {
    const view = render(<Price />)
    const input = view.container.querySelector<HTMLInputElement>('input')!
    input.focus()
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, '480')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settled(20)
    expect(input.value).toBe('۴۸۰')
  })

  it('Persian digits typed on an English page are Latin', async () => {
    const view = render(<Price locale="en-US" />)
    const input = view.container.querySelector<HTMLInputElement>('input')!
    await userEvent.click(input)
    await userEvent.keyboard('۱۲۵۰')
    await userEvent.click(view.getByText('away'))
    await settled(40)
    expect(input.value).toBe('1,250')
    expect(view.container.querySelector('output')!.textContent).toBe('1250')
  })
})

describe("the search field's clear button", () => {
  const field = (locale: string, label?: string) =>
    render(
      <Card locale={locale}>
        <SearchField aria-label="search" defaultValue="termeh">
          <SearchField.Group>
            <SearchField.Input />
            <SearchField.ClearButton aria-label={label} />
          </SearchField.Group>
        </SearchField>
      </Card>,
    )
  const name = (view: ReturnType<typeof field>) =>
    view.container
      .querySelector('[data-slot="search-field-clear-button"]')!
      .getAttribute('aria-label')

  it('is named Clear in the page’s language, not Close; its caller’s name still wins', async () => {
    const fa = field('fa-IR')
    expect(name(fa)).toBe('پاک کردن')
    fa.unmount()
    const en = field('en-US')
    expect(name(en)).toBe('Clear')
    en.unmount()
    expect(name(field('en-US', 'Clear the search'))).toBe('Clear the search')
  })
})

describe('a one-time code', () => {
  function Code(
    props: Partial<React.ComponentProps<typeof InputOTP>> & { locale?: string; length?: number },
  ) {
    const { locale = 'fa-IR', length = 4, ...rest } = props
    return (
      <Card locale={locale}>
        <InputOTP maxLength={length} aria-label="code" {...rest}>
          <InputOTP.Group>
            {Array.from({ length }, (_, i) => (
              <InputOTP.Slot key={i} index={i} />
            ))}
          </InputOTP.Group>
        </InputOTP>
      </Card>
    )
  }
  const boxes = (root: ParentNode) =>
    [...root.querySelectorAll('[data-slot="input-otp-slot"]')].map((s) => s.textContent).join('')

  // First of the codes with a default value: React says a warning once a page, so a later one
  // would hide behind an earlier.
  it('a default value draws no warning; an invalid code is read as invalid', async () => {
    const warn = vi.spyOn(console, 'error').mockImplementation(() => {})
    const view = render(<Code defaultValue="1234" isInvalid />)
    await settled(40)
    expect(warn.mock.calls.map((c) => String(c[0]).slice(0, 80))).toEqual([])
    warn.mockRestore()
    expect(view.container.querySelector('input')!.getAttribute('aria-invalid')).toBe('true')
  })

  it('is held in Latin digits and shown in the page’s, however it was typed', async () => {
    const onChange = vi.fn()
    const onComplete = vi.fn()
    const view = render(<Code onChange={onChange} onComplete={onComplete} pattern="^\d+$" />)
    const input = view.container.querySelector<HTMLInputElement>('input')!
    await userEvent.click(input)
    await userEvent.keyboard('48')
    await userEvent.keyboard('۲۹')
    await settled(40)
    expect(boxes(view.container)).toBe('۴۸۲۹')
    expect(onChange).toHaveBeenLastCalledWith('4829')
    expect(onComplete).toHaveBeenLastCalledWith('4829')
  })

  it('its pattern is matched against the Latin code: letters are refused', async () => {
    const onChange = vi.fn()
    const view = render(<Code onChange={onChange} pattern="^\d+$" defaultValue="12" />)
    const input = view.container.querySelector<HTMLInputElement>('input')!
    await userEvent.click(input)
    await userEvent.keyboard('a')
    await settled(40)
    expect(boxes(view.container)).toBe('۱۲')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('an English page shows Latin digits; a form is sent the Latin code', async () => {
    const en = render(<Code locale="en-US" defaultValue="۴۸" />)
    expect(boxes(en.container)).toBe('48')
    en.unmount()
    const view = render(
      <Card>
        <form>
          <InputOTP maxLength={4} aria-label="code" name="code" defaultValue="4829">
            <InputOTP.Group>
              {[0, 1, 2, 3].map((i) => (
                <InputOTP.Slot key={i} index={i} />
              ))}
            </InputOTP.Group>
          </InputOTP>
        </form>
      </Card>,
    )
    expect(boxes(view.container)).toBe('۴۸۲۹')
    expect(new FormData(view.container.querySelector('form')!).get('code')).toBe('4829')
  })

  it('on a grey surface its boxes are fields: the edge, and the second surface', async () => {
    const view = render(<Code variant="secondary" defaultValue="12" />)
    await settled(40)
    const [filled, , , empty] = view.container.querySelectorAll<HTMLElement>(
      '[data-slot="input-otp-slot"]',
    )
    const probe = document.createElement('div')
    probe.style.background = 'var(--db-field-secondary)'
    view.container.querySelector('.input-otp')!.append(probe)
    const second = getComputedStyle(probe).backgroundColor
    // A box with a digit and one without, as each takes its own fill.
    expect(getComputedStyle(filled!).backgroundColor).toBe(second)
    expect(getComputedStyle(empty!).backgroundColor).toBe(second)
    // The field's 1px edge is its shadow, as every field's is.
    expect(getComputedStyle(empty!).boxShadow).toMatch(/0px 0px 0px 1px$/)
  })
})
