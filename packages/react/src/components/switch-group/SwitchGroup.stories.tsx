import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Description } from '../description'
import { Fieldset } from '../fieldset'
import { Label } from '../label'
import { Switch } from '../switch'
import { SwitchGroup } from './index'

// The SwitchGroup, every option it has and what it is built into. The docs page is
// SwitchGroup.mdx. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta: Meta = {
  title: 'Components/Controls/SwitchGroup',
  component: SwitchGroup,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** A switch and its words, and help under them. */
function Toggle({
  label,
  help,
  ...props
}: Omit<React.ComponentProps<typeof Switch>, 'children'> & { label: ReactNode; help?: ReactNode }) {
  return (
    <Switch {...props}>
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Label>{label}</Label>
      </Switch.Content>
      {help ? <Description>{help}</Description> : null}
    </Switch>
  )
}

const ALERTS = [
  { id: 'order', fa: 'سفارش تازه', en: 'A new order', on: true },
  { id: 'stock', fa: 'موجودی رو به پایان', en: 'Stock running low', on: true },
  { id: 'review', fa: 'نظر تازه', en: 'A new review', on: false },
]

function Alerts({ help = false }: { help?: boolean }) {
  const t = useT()
  return ALERTS.map((a) => (
    <Toggle
      key={a.id}
      name={a.id}
      defaultSelected={a.on}
      label={t(a.fa, a.en)}
      help={
        help && a.id === 'stock' ? t('وقتی به پنج برسد.', 'When it is down to five.') : undefined
      }
    />
  ))
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { orientation: 'vertical' | 'horizontal' }

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { orientation: 'vertical' },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: '24 apart down the page, or 16 across it.',
      table: { category: 'SwitchGroup', defaultValue: { summary: 'vertical' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    const [on, setOn] = useState<Record<string, boolean>>({
      order: true,
      stock: true,
      review: false,
    })
    return (
      <Stage width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SwitchGroup orientation={args.orientation} aria-label={t('اعلان‌ها', 'Alerts')}>
            {ALERTS.map((a) => (
              <Toggle
                key={a.id}
                label={t(a.fa, a.en)}
                isSelected={on[a.id]}
                onChange={(value) => setOn((now) => ({ ...now, [a.id]: value }))}
              />
            ))}
          </SwitchGroup>
          <Value label="on" value={on} />
        </div>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** One under another, 24 apart; or side by side, 16 apart. */
export const Orientation: StoryObj = {
  name: 'Down and across',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example title={t('زیر هم', 'Down')} note='orientation="vertical"'>
          <SwitchGroup aria-label={t('اعلان‌ها', 'Alerts')}>
            <Alerts />
          </SwitchGroup>
        </Example>
        <Example title={t('کنار هم', 'Across')} note='orientation="horizontal"'>
          <SwitchGroup orientation="horizontal" aria-label={t('اعلان‌ها', 'Alerts')}>
            <Toggle defaultSelected label={t('پیامک', 'Text')} />
            <Toggle label={t('ایمیل', 'Email')} />
          </SwitchGroup>
        </Example>
      </Grid>
    )
  },
}

/** Named by a Fieldset's legend, with help under the group. */
export const Named: StoryObj = {
  name: 'With a name',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <Fieldset>
          <Fieldset.Legend>{t('به من خبر بده از', 'Tell me about')}</Fieldset.Legend>
          <SwitchGroup>
            <Alerts help />
          </SwitchGroup>
          <Description>
            {t('با پیامک به شمارهٔ صاحب فروشگاه.', 'By text, to the shop owner’s number.')}
          </Description>
        </Fieldset>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** The shop's notification settings: each switch applies as it is turned. */
export const Notifications: StoryObj = {
  name: 'Example: notification settings',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={520} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 8 }}>
          <Fieldset>
            <Fieldset.Legend>{t('به فروشنده', 'To the seller')}</Fieldset.Legend>
            <SwitchGroup>
              <Alerts help />
            </SwitchGroup>
          </Fieldset>
          <Fieldset>
            <Fieldset.Legend>{t('به خریدار', 'To the buyer')}</Fieldset.Legend>
            <SwitchGroup>
              <Toggle defaultSelected label={t('سفارش ثبت شد', 'Order placed')} />
              <Toggle defaultSelected label={t('بسته فرستاده شد', 'Parcel sent')} />
              <Toggle label={t('یادآوری سبد رهاشده', 'Abandoned cart reminder')} />
            </SwitchGroup>
          </Fieldset>
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <div style={{ width: 300, maxWidth: '100%' }}>
      <SwitchGroup aria-label={t('اعلان‌ها', 'Alerts')}>
        <Alerts help />
      </SwitchGroup>
    </div>
  )
}

/** The light theme and the dark, side by side, whatever the toolbar says. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Sample />
    </Themes>
  ),
}

/** A Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Sample />
    </Directions>
  ),
}

/** On a phone's width, down and across. */
export const OnAPhone: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Device>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <Sample />
          <SwitchGroup orientation="horizontal" aria-label={t('راه‌های خبر', 'Ways to tell')}>
            <Toggle defaultSelected label={t('پیامک به صاحب فروشگاه', 'Text the shop owner')} />
            <Toggle label={t('ایمیل به همهٔ کارکنان', 'Email all the staff')} />
          </SwitchGroup>
        </div>
      </Device>
    )
  },
}

/** The same group as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'SwitchGroup',
      children: ALERTS.map((a) => ({
        type: 'Switch',
        props: { label: t(a.fa, a.en), defaultSelected: a.on },
      })),
    }
    return (
      <Grid min={320}>
        <Example
          title={t('آنچه کشیده می‌شود', 'What is drawn')}
          note={t('در وب و در Flutter', 'On the web and in Flutter')}
        >
          <DibaSurface tree={tree as never} />
        </Example>
        <Example title={t('درخت', 'The tree')}>
          <pre
            dir="ltr"
            className="text-foreground"
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: '18px',
              background: 'var(--default)',
              borderRadius: 16,
              padding: 16,
              overflow: 'auto',
            }}
          >
            {JSON.stringify(tree, null, 2)}
          </pre>
        </Example>
      </Grid>
    )
  },
}
