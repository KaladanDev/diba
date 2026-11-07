import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { page, userEvent } from '@vitest/browser/context'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { settled } from '../../test/visual'
import { DibaSurface } from '../../sdui'
import {
  Button,
  Checkbox,
  CheckboxGroup,
  FieldError,
  Form,
  Label,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  SwitchGroup,
} from '../../index'

/**
 * The choices' own words and look: what a required checkbox, switch or group says left empty, in
 * the page's language and not the browser's; options straight in a group 24 apart, as a tree's;
 * a secondary box or ring filled with the surface, as Flutter's; a SwitchGroup a named group;
 * a range's thumbs named apart. The test browser's language is English, so a Persian page here is
 * one in an English browser.
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
          width: 420,
        }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

/** A form holding [children] and a send button: what it sent, and what its fields said. */
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

function Box(props: React.ComponentProps<typeof Checkbox> & { words?: string }) {
  const { words = 'option', ...rest } = props
  return (
    <Checkbox {...rest}>
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Label>{words}</Label>
      </Checkbox.Content>
      <FieldError />
    </Checkbox>
  )
}

function Ring({ value }: { value: string }) {
  return (
    <Radio value={value}>
      <Radio.Content>
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Label>{value}</Label>
      </Radio.Content>
    </Radio>
  )
}

function Toggle(props: React.ComponentProps<typeof Switch>) {
  return (
    <Switch {...props}>
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Label>switch</Label>
      </Switch.Content>
      <FieldError />
    </Switch>
  )
}

describe("a required choice left empty speaks the page's language", () => {
  it('a checkbox, a switch and a radio group say it is required, and the form waits', async () => {
    await page.viewport(1280, 800)
    const box = sendable(<Box isRequired />)
    await box.send()
    expect(box.error()).toBe('این فیلد الزامی است.')
    expect(box.onSubmit).not.toHaveBeenCalled()
    box.unmount()

    const on = sendable(<Toggle isRequired />)
    await on.send()
    expect(on.error()).toBe('این فیلد الزامی است.')
    on.unmount()

    const radios = sendable(
      <RadioGroup isRequired name="ship">
        <Label>ship</Label>
        <Ring value="post" />
        <Ring value="tipax" />
        <FieldError />
      </RadioGroup>,
    )
    await radios.send()
    expect(radios.error()).toBe('این فیلد الزامی است.')
    expect(radios.onSubmit).not.toHaveBeenCalled()
  })

  it('a checkbox group asks for one at least, as a tree does', async () => {
    const group = sendable(
      <CheckboxGroup isRequired name="ways">
        <Label>ways</Label>
        <Box value="a" words="a" />
        <Box value="b" words="b" />
        <FieldError />
      </CheckboxGroup>,
    )
    await group.send()
    expect(group.error()).toBe('دست‌کم یکی را انتخاب کنید.')
  })

  it("an English page in English; a caller's own words, and a check shown at once, untouched", async () => {
    const en = sendable(
      <RadioGroup isRequired>
        <Label>ship</Label>
        <Ring value="post" />
        <FieldError />
      </RadioGroup>,
      'en-US',
    )
    await en.send()
    expect(en.error()).toBe('This field is required.')
    en.unmount()

    const own = sendable(
      <Box isRequired validate={(on) => (on ? null : 'Tick it, please.')} />,
      'en-US',
    )
    await own.send()
    expect(own.error()).toBe('Tick it, please.')
    own.unmount()

    const words = sendable(
      <RadioGroup isRequired>
        <Label>ship</Label>
        <Ring value="post" />
        <FieldError>Choose how it goes.</FieldError>
      </RadioGroup>,
      'en-US',
    )
    await words.send()
    expect(words.error()).toBe('Choose how it goes.')
    words.unmount()

    const aria = sendable(
      <>
        <Box isRequired />
        <CheckboxGroup isRequired>
          <Label>ways</Label>
          <Box value="a" />
          <FieldError />
        </CheckboxGroup>
      </>,
      'fa-IR',
      'aria',
    )
    await aria.send()
    expect(aria.error()).toBe('')
    expect(aria.onSubmit).toHaveBeenCalledTimes(1)
  })
})

describe("a group's options are 24 apart down the page, as a tree's", () => {
  const gaps = (root: ParentNode, slot: string) => {
    const rows = [...root.querySelectorAll(`[data-slot="${slot}"]`)].map((o) =>
      o.getBoundingClientRect(),
    )
    return rows.slice(1).map((r, i) => Math.round(r.top - rows[i]!.bottom))
  }
  const firstUnderLabel = (root: ParentNode, group: string, slot: string) => {
    const label = root.querySelector(`[data-slot="${group}"] > .label`)!.getBoundingClientRect()
    return Math.round(
      root.querySelector(`[data-slot="${slot}"]`)!.getBoundingClientRect().top - label.bottom,
    )
  }

  it('composed straight in a CheckboxGroup or a RadioGroup, and in their blocks', async () => {
    const view = render(
      <Card>
        <CheckboxGroup>
          <Label>ways</Label>
          <Box value="a" />
          <Box value="b" />
          <Box value="c" />
        </CheckboxGroup>
      </Card>,
    )
    await settled(40)
    expect(firstUnderLabel(view.container, 'checkbox-group', 'checkbox')).toBe(16)
    expect(gaps(view.container, 'checkbox')).toEqual([24, 24])
    view.unmount()

    const radios = render(
      <Card>
        <RadioGroup>
          <Label>ship</Label>
          <Ring value="a" />
          <Ring value="b" />
          <Ring value="c" />
        </RadioGroup>
      </Card>,
    )
    await settled(40)
    expect(firstUnderLabel(radios.container, 'radio-group', 'radio')).toBe(16)
    expect(gaps(radios.container, 'radio')).toEqual([24, 24])
    radios.unmount()

    const block = render(
      <Card>
        <DibaSurface
          tree={
            {
              type: 'CheckboxGroup',
              props: { label: 'ways' },
              children: ['a', 'b', 'c'].map((v) => ({
                type: 'Checkbox',
                props: { value: v, label: v },
              })),
            } as never
          }
        />
      </Card>,
    )
    await settled(40)
    expect(gaps(block.container, 'checkbox')).toEqual([24, 24])
  })

  it('across, a radio group keeps 16 between its options', async () => {
    const view = render(
      <Card>
        <RadioGroup orientation="horizontal">
          <Label>ship</Label>
          <Ring value="a" />
          <Ring value="b" />
        </RadioGroup>
      </Card>,
    )
    await settled(40)
    const [a, b] = [...view.container.querySelectorAll('[data-slot="radio"]')].map((o) =>
      o.getBoundingClientRect(),
    )
    expect(Math.round(a!.left - b!.right)).toBe(16)
  })
})

describe('a secondary box or ring is filled with the surface, as Flutter’s', () => {
  it('empty or chosen, on a grey card; a primary one is not', async () => {
    const view = render(
      <Card>
        <Box variant="secondary" />
        <Box variant="secondary" defaultSelected />
        <Box />
        <RadioGroup variant="secondary" aria-label="ship">
          <Ring value="a" />
        </RadioGroup>
        <RadioGroup aria-label="ship">
          <Ring value="b" />
        </RadioGroup>
      </Card>,
    )
    await settled(40)
    const probe = document.createElement('div')
    probe.style.background = 'var(--surface)'
    view.container.firstElementChild!.append(probe)
    const surface = getComputedStyle(probe).backgroundColor
    const fills = [
      ...view.container.querySelectorAll('.checkbox__indicator > svg, .radio__indicator > svg'),
    ].map((svg) => getComputedStyle(svg).backgroundColor)
    expect(fills).toEqual([surface, surface, 'rgba(0, 0, 0, 0)', surface, 'rgba(0, 0, 0, 0)'])
  })
})

describe('named apart', () => {
  it('a SwitchGroup is a group, read by the name it is given', async () => {
    const view = render(
      <Card>
        <SwitchGroup aria-label="alerts">
          <Toggle />
        </SwitchGroup>
      </Card>,
    )
    expect(view.getByRole('group', { name: 'alerts' })).toBeTruthy()
  })

  it("a range's two thumbs are its least and its most; one thumb is the label alone", async () => {
    const slider = (value: number | number[], locale = 'fa-IR', own?: string) =>
      render(
        <Card locale={locale}>
          <Slider defaultValue={value} maxValue={100}>
            <Label>price</Label>
            <Slider.Track>
              {({ state }) =>
                state.values.map((_, i) => <Slider.Thumb key={i} index={i} aria-label={own} />)
              }
            </Slider.Track>
          </Slider>
        </Card>,
      )
    // The first thumb, the lower value, is the least.
    const range = slider([20, 60])
    const [low, high] = range.getAllByRole('slider')
    expect(range.getByRole('slider', { name: 'کمترین price' })).toBe(low)
    expect(range.getByRole('slider', { name: 'بیشترین price' })).toBe(high)
    range.unmount()
    const en = slider([20, 60], 'en-US')
    const [from, to] = en.getAllByRole('slider')
    expect(en.getByRole('slider', { name: 'Minimum price' })).toBe(from)
    expect(en.getByRole('slider', { name: 'Maximum price' })).toBe(to)
    en.unmount()
    const one = slider(40)
    expect(one.getByRole('slider', { name: 'price' })).toBeTruthy()
    one.unmount()
    const own = slider([20, 60], 'en-US', 'From')
    expect(own.getAllByRole('slider', { name: 'From price' })).toHaveLength(2)
  })
})
