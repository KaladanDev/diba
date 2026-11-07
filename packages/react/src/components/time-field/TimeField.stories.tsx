import type { Meta, StoryObj } from '@storybook/react-vite'
import { parseTime, type Time } from '@internationalized/date'
import { Clock } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Label } from '../label'
import { TimeField } from './index'

// The TimeField, every option it has and what it is built into. The docs page is TimeField.mdx. A
// line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
// Typed as a plain Meta: TimeField is generic.
const meta: Meta = {
  title: 'Components/Date and Time/TimeField',
  component: TimeField,
  parameters: { layout: 'fullscreen' },
}

export default meta

const HALF_TWO = parseTime('14:30')
const OPENS = parseTime('09:00')
const CLOSES = parseTime('21:00')

/** A time field's segments, the inside every example shares. */
function Segments() {
  return <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
}

/** Fields down the page, 20 apart, as wide as a form's column. */
function Column({ children, width = 320 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  granularity: 'hour' | 'minute' | 'second'
  hourCycle: 12 | 24
  variant: 'primary' | 'secondary'
  limits: boolean
  isRequired: boolean
  isDisabled: boolean
  isReadOnly: boolean
  isInvalid: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    granularity: 'minute',
    hourCycle: 24,
    variant: 'primary',
    limits: false,
    isRequired: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    granularity: {
      control: 'inline-radio',
      options: ['hour', 'minute', 'second'],
      description: 'The smallest part it asks.',
      table: { category: 'TimeField', defaultValue: { summary: 'minute' } },
    },
    hourCycle: {
      control: 'inline-radio',
      options: [12, 24],
      description: 'A 12-hour clock with AM and PM, or 24 hours.',
      table: { category: 'TimeField' },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'TimeField.Group’s: secondary for a field on a grey surface.',
      table: { category: 'TimeField.Group', defaultValue: { summary: 'primary' } },
    },
    limits: {
      description: 'minValue and maxValue: 09:00 to 21:00, shown at once.',
      table: { category: 'Example' },
    },
    isRequired: { table: { category: 'TimeField', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'TimeField', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'TimeField', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'TimeField', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render({
    granularity,
    hourCycle,
    variant,
    limits,
    isRequired,
    isDisabled,
    isReadOnly,
    isInvalid,
  }) {
    const t = useT()
    const [value, setValue] = useState<Time | null>(HALF_TWO)
    return (
      <Stage width={380} surface={variant === 'secondary'}>
        <Column>
          <TimeField
            value={value}
            onChange={setValue}
            granularity={granularity}
            hourCycle={hourCycle}
            minValue={limits ? OPENS : undefined}
            maxValue={limits ? CLOSES : undefined}
            validationBehavior="aria"
            isRequired={isRequired}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isInvalid={isInvalid || undefined}
          >
            <Label>{t('ساعت تحویل', 'Delivery time')}</Label>
            <TimeField.Group fullWidth variant={variant}>
              <Segments />
            </TimeField.Group>
            <Description>{t('میان ۹ تا ۲۱.', 'Between 9 and 21.')}</Description>
            <FieldError>
              {t('میان ۹ تا ۲۱ تحویل می‌دهیم.', 'We deliver between 9 and 21.')}
            </FieldError>
          </TimeField>
          <Value label="value" value={value?.toString() ?? null} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** To the hour, the minute or the second. */
export const Granularity: StoryObj = {
  render: function Render() {
    return (
      <Column>
        {(['hour', 'minute', 'second'] as const).map((granularity) => (
          <TimeField
            key={granularity}
            defaultValue={parseTime('14:30:15')}
            granularity={granularity}
          >
            <Label>{granularity}</Label>
            <TimeField.Group fullWidth>
              <Segments />
            </TimeField.Group>
          </TimeField>
        ))}
      </Column>
    )
  },
}

/** A 24-hour clock, or 12 hours with AM and PM. */
export const HourCycle: StoryObj = {
  name: 'Hour cycle',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <TimeField defaultValue={HALF_TWO} hourCycle={24}>
          <Label>{t('۲۴ ساعته', '24 hours')}</Label>
          <TimeField.Group fullWidth>
            <Segments />
          </TimeField.Group>
        </TimeField>
        <TimeField defaultValue={HALF_TWO} hourCycle={12}>
          <Label>{t('۱۲ ساعته', '12 hours')}</Label>
          <TimeField.Group fullWidth>
            <Segments />
          </TimeField.Group>
        </TimeField>
      </Column>
    )
  },
}

/** A time outside its earliest and latest is invalid. */
export const Limits: StoryObj = {
  name: 'Earliest and latest',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <TimeField
          defaultValue={parseTime('22:30')}
          minValue={OPENS}
          maxValue={CLOSES}
          validationBehavior="aria"
        >
          <Label>{t('ساعت تحویل', 'Delivery time')}</Label>
          <TimeField.Group fullWidth>
            <Segments />
          </TimeField.Group>
          <Description>{t('میان ۹ تا ۲۱.', 'Between 9 and 21.')}</Description>
          <FieldError>
            {t('میان ۹ تا ۲۱ تحویل می‌دهیم.', 'We deliver between 9 and 21.')}
          </FieldError>
        </TimeField>
      </Column>
    )
  },
}

/** An icon before the time. */
export const Prefix: StoryObj = {
  name: 'An icon before',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <TimeField defaultValue={HALF_TWO}>
          <Label>{t('ساعت تحویل', 'Delivery time')}</Label>
          <TimeField.Group fullWidth>
            <TimeField.Prefix>
              <Clock aria-hidden size={16} />
            </TimeField.Prefix>
            <Segments />
          </TimeField.Group>
        </TimeField>
      </Column>
    )
  },
}

/** Disabled, read-only, and on a grey surface. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        <Example title={t('غیرفعال', 'Disabled')}>
          <TimeField defaultValue={HALF_TWO} isDisabled>
            <Label>{t('ساعت تحویل', 'Delivery time')}</Label>
            <TimeField.Group fullWidth>
              <Segments />
            </TimeField.Group>
          </TimeField>
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <TimeField defaultValue={HALF_TWO} isReadOnly>
            <Label>{t('ساعت تحویل', 'Delivery time')}</Label>
            <TimeField.Group fullWidth>
              <Segments />
            </TimeField.Group>
          </TimeField>
        </Example>
        <Example title={t('روی زمینهٔ خاکستری', 'On a grey surface')} note='variant="secondary"'>
          <Stage width="100%" surface>
            <TimeField defaultValue={HALF_TWO}>
              <Label>{t('ساعت تحویل', 'Delivery time')}</Label>
              <TimeField.Group fullWidth variant="secondary">
                <Segments />
              </TimeField.Group>
            </TimeField>
          </Stage>
        </Example>
      </Grid>
    )
  },
}

/** In a form: its name sends the time, ISO 8601. */
export const InAForm: StoryObj = {
  name: 'In a form',
  render: function Render() {
    const t = useT()
    const [sent, setSent] = useState<string | null>(null)
    return (
      <Stage width={380} surface>
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}
          onSubmit={(event) => {
            event.preventDefault()
            setSent(String(new FormData(event.currentTarget).get('at')))
          }}
        >
          <TimeField name="at" defaultValue={HALF_TWO} isRequired>
            <Label>{t('ساعت تحویل', 'Delivery time')}</Label>
            <TimeField.Group fullWidth>
              <Segments />
            </TimeField.Group>
          </TimeField>
          <div>
            <Button type="submit" variant="primary">
              {t('ذخیره', 'Save')}
            </Button>
          </div>
          <Value label={t('فرستاده شد', 'Sent')} value={sent} />
        </form>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A shop's opening hours: opens, and closes after it. */
export const OpeningHours: StoryObj = {
  name: 'Example: opening hours',
  render: function Render() {
    const t = useT()
    const [opens, setOpens] = useState<Time | null>(OPENS)
    const [closes, setCloses] = useState<Time | null>(CLOSES)
    return (
      <Stage width={480} surface>
        <div style={{ display: 'flex', gap: 16, padding: 8, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <TimeField
              value={opens}
              onChange={setOpens}
              maxValue={closes ?? undefined}
              validationBehavior="aria"
            >
              <Label>{t('باز می‌شود', 'Opens')}</Label>
              <TimeField.Group fullWidth>
                <Segments />
              </TimeField.Group>
            </TimeField>
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <TimeField
              value={closes}
              onChange={setCloses}
              minValue={opens ?? undefined}
              validationBehavior="aria"
            >
              <Label>{t('بسته می‌شود', 'Closes')}</Label>
              <TimeField.Group fullWidth>
                <Segments />
              </TimeField.Group>
              <FieldError>{t('پس از ساعت باز شدن.', 'After it opens.')}</FieldError>
            </TimeField>
          </div>
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <Column width={280}>
      <TimeField defaultValue={HALF_TWO}>
        <Label>{t('ساعت تحویل', 'Delivery time')}</Label>
        <TimeField.Group fullWidth>
          <Segments />
        </TimeField.Group>
      </TimeField>
      <TimeField defaultValue={HALF_TWO} hourCycle={12}>
        <Label>{t('۱۲ ساعته', '12 hours')}</Label>
        <TimeField.Group fullWidth>
          <Segments />
        </TimeField.Group>
      </TimeField>
      <TimeField>
        <Label>{t('ساعت یادآوری', 'Reminder at')}</Label>
        <TimeField.Group fullWidth>
          <Segments />
        </TimeField.Group>
      </TimeField>
    </Column>
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

/** A Persian page and an English one: the hour before the minute in both. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Sample />
    </Directions>
  ),
}

/** On a phone's width. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Sample />
    </Device>
  ),
}

/** The block a tree sends for a time: a field whose press opens the time picker. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'TimeField',
      props: {
        label: t('ساعت تحویل', 'Delivery time'),
        defaultValue: '14:30',
        description: t('میان ۹ تا ۲۱.', 'Between 9 and 21.'),
      },
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
