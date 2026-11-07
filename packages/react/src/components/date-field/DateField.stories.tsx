import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  parseDate,
  parseDateTime,
  parseZonedDateTime,
  type DateValue,
} from '@internationalized/date'
import { CalendarClock } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { DAY, InCalendar, iso } from '../../stories/dates'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Label } from '../label'
import { DateField } from './index'

// The DateField, every option it has and what it is built into. The docs page is DateField.mdx. A
// line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
// Typed as a plain Meta: DateField is generic.
const meta: Meta = {
  title: 'Components/Date and Time/DateField',
  component: DateField,
  parameters: { layout: 'fullscreen' },
}

export default meta

type System = 'auto' | 'persian' | 'gregorian'
type Granularity = 'day' | 'hour' | 'minute'

/** The fixed day at 14:00, as a date and time. */
const AT_TWO = parseDateTime('2026-10-17T14:00')

/** A date field's segments, the inside every example shares. */
function Segments() {
  return <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
}

/** Fields down the page, 20 apart, as wide as a form's column. */
function Column({ children, width = 360 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  granularity: Granularity
  calendar: System
  hourCycle: 12 | 24
  variant: 'primary' | 'secondary'
  description: boolean
  isRequired: boolean
  isDisabled: boolean
  isReadOnly: boolean
  isInvalid: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    label: '',
    granularity: 'day',
    calendar: 'auto',
    hourCycle: 24,
    variant: 'primary',
    description: true,
    isRequired: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    label: { control: 'text', description: 'The Label above it.', table: { category: 'Example' } },
    granularity: {
      control: 'inline-radio',
      options: ['day', 'hour', 'minute'],
      description: 'The smallest part it asks: the day, or the hour or minute too.',
      table: { category: 'DateField', defaultValue: { summary: 'day' } },
    },
    calendar: {
      control: 'inline-radio',
      options: ['auto', 'persian', 'gregorian'],
      description: 'The language’s own, or one whatever the language, through the locale.',
      table: { category: 'Example' },
    },
    hourCycle: {
      control: 'inline-radio',
      options: [12, 24],
      description: 'A 12-hour clock with AM and PM, or 24 hours.',
      table: { category: 'DateField' },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'DateField.Group’s: secondary for a field on a grey surface.',
      table: { category: 'DateField.Group', defaultValue: { summary: 'primary' } },
    },
    description: { description: 'A Description under it.', table: { category: 'Example' } },
    isRequired: { table: { category: 'DateField', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'DateField', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'DateField', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'DateField', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render({
    label,
    granularity,
    calendar,
    hourCycle,
    variant,
    description,
    isRequired,
    isDisabled,
    isReadOnly,
    isInvalid,
  }) {
    const t = useT()
    const [value, setValue] = useState<DateValue | null>(AT_TWO)
    return (
      <Stage width={420} surface={variant === 'secondary'}>
        <Column>
          <InCalendar system={calendar}>
            <DateField
              value={value}
              onChange={setValue}
              granularity={granularity}
              hourCycle={hourCycle}
              isRequired={isRequired}
              isDisabled={isDisabled}
              isReadOnly={isReadOnly}
              isInvalid={isInvalid}
            >
              <Label>{label || t('زمان ارسال', 'Delivery time')}</Label>
              <DateField.Group fullWidth variant={variant}>
                <Segments />
              </DateField.Group>
              {description ? (
                <Description>{t('به وقت تهران.', 'In Tehran time.')}</Description>
              ) : null}
              <FieldError>{t('زمانی دیگر برگزینید.', 'Pick another time.')}</FieldError>
            </DateField>
          </InCalendar>
          <Value label="value" value={iso(value)} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** At rest it reads as a date is written; in focus, its parts can be typed one by one. */
export const AtRest: StoryObj = {
  name: 'At rest and typing',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example
          title={t('در حال آرام', 'At rest')}
          note={t('روز، نام ماه و سال', 'The day, the month’s name and the year')}
        >
          <DateField defaultValue={DAY}>
            <Label>{t('تاریخ ارسال', 'Delivery date')}</Label>
            <DateField.Group fullWidth>
              <Segments />
            </DateField.Group>
          </DateField>
        </Example>
        <Example
          title={t('خالی', 'Empty')}
          note={t('بزنید و رقم‌ها را بنویسید', 'Press it and type the digits')}
        >
          <DateField>
            <Label>{t('تاریخ ارسال', 'Delivery date')}</Label>
            <DateField.Group fullWidth>
              <Segments />
            </DateField.Group>
          </DateField>
        </Example>
      </Grid>
    )
  },
}

/** A day alone, or a day and an hour, or a minute. */
export const Granularity: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Column>
        {(['day', 'hour', 'minute'] as const).map((granularity) => (
          <DateField
            key={granularity}
            defaultValue={granularity === 'day' ? DAY : parseDateTime('2026-10-17T14:30')}
            granularity={granularity}
          >
            <Label>{granularity}</Label>
            <DateField.Group fullWidth>
              <Segments />
            </DateField.Group>
          </DateField>
        ))}
        <DateField
          defaultValue={parseDateTime('2026-10-17T14:30')}
          granularity="minute"
          hourCycle={12}
        >
          <Label>{t('دقیقه، ساعت ۱۲تایی', 'minute, a 12-hour clock')}</Label>
          <DateField.Group fullWidth>
            <Segments />
          </DateField.Group>
        </DateField>
      </Column>
    )
  },
}

/** The same day in the Persian calendar and in the Gregorian. */
export const Calendars: StoryObj = {
  name: 'Persian and Gregorian',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        {(['persian', 'gregorian'] as const).map((system) => (
          <InCalendar key={system} system={system}>
            <DateField defaultValue={DAY}>
              <Label>
                {system === 'persian' ? t('خورشیدی', 'Persian') : t('میلادی', 'Gregorian')}
              </Label>
              <DateField.Group fullWidth>
                <Segments />
              </DateField.Group>
              <Description>{`value ${iso(DAY)}`}</Description>
            </DateField>
          </InCalendar>
        ))}
      </Column>
    )
  },
}

/** A moment in a zone: shown in its own zone, the zone's name kept or hidden. */
export const TimeZones: StoryObj = {
  name: 'Time zones',
  render: function Render() {
    const t = useT()
    const moment = parseZonedDateTime('2026-10-17T14:00[Asia/Tehran]')
    return (
      <Column>
        <DateField defaultValue={moment} granularity="minute" hideTimeZone>
          <Label>{t('نام منطقه پنهان', 'Its zone hidden')}</Label>
          <DateField.Group fullWidth>
            <Segments />
          </DateField.Group>
        </DateField>
        <DateField defaultValue={moment} granularity="minute">
          <Label>{t('نام منطقه پیدا', 'Its zone shown')}</Label>
          <DateField.Group fullWidth>
            <Segments />
          </DateField.Group>
        </DateField>
      </Column>
    )
  },
}

/** A label above, help under it, and what is wrong in place of the help. */
export const LabelHelpError: StoryObj = {
  name: 'Label, help and error',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <DateField defaultValue={DAY} isRequired>
          <Label>{t('تاریخ ارسال', 'Delivery date')}</Label>
          <DateField.Group fullWidth>
            <Segments />
          </DateField.Group>
          <Description>
            {t('روزی که بسته از انبار بیرون می‌رود.', 'The day the parcel leaves the warehouse.')}
          </Description>
        </DateField>
        <DateField defaultValue={parseDate('2026-10-23')} isInvalid>
          <Label>{t('تاریخ ارسال', 'Delivery date')}</Label>
          <DateField.Group fullWidth>
            <Segments />
          </DateField.Group>
          <FieldError>{t('جمعه‌ها ارسال نداریم.', "We don't send on Fridays.")}</FieldError>
        </DateField>
      </Column>
    )
  },
}

/** An icon before the date, or a button after it. */
export const PrefixAndSuffix: StoryObj = {
  name: 'Before and after',
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState<DateValue | null>(AT_TWO)
    return (
      <Column>
        <DateField defaultValue={AT_TWO} granularity="minute">
          <Label>{t('زمان انتشار', 'Publish at')}</Label>
          <DateField.Group fullWidth>
            <DateField.Prefix>
              <CalendarClock aria-hidden size={16} />
            </DateField.Prefix>
            <Segments />
          </DateField.Group>
        </DateField>
        <DateField value={value} onChange={setValue} granularity="minute">
          <Label>{t('زمان انتشار', 'Publish at')}</Label>
          <DateField.Group fullWidth>
            <Segments />
            <DateField.Suffix>
              <Button size="sm" variant="ghost" onPress={() => setValue(null)}>
                {t('پاک کردن', 'Clear')}
              </Button>
            </DateField.Suffix>
          </DateField.Group>
        </DateField>
      </Column>
    )
  },
}

/** Disabled, read-only, and on a grey surface. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example title={t('غیرفعال', 'Disabled')}>
          <DateField defaultValue={DAY} isDisabled>
            <Label>{t('تاریخ ارسال', 'Delivery date')}</Label>
            <DateField.Group fullWidth>
              <Segments />
            </DateField.Group>
          </DateField>
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <DateField defaultValue={DAY} isReadOnly>
            <Label>{t('تاریخ ارسال', 'Delivery date')}</Label>
            <DateField.Group fullWidth>
              <Segments />
            </DateField.Group>
          </DateField>
        </Example>
        <Example title={t('روی زمینهٔ خاکستری', 'On a grey surface')} note='variant="secondary"'>
          <Stage width="100%" surface>
            <DateField defaultValue={DAY}>
              <Label>{t('تاریخ ارسال', 'Delivery date')}</Label>
              <DateField.Group fullWidth variant="secondary">
                <Segments />
              </DateField.Group>
            </DateField>
          </Stage>
        </Example>
      </Grid>
    )
  },
}

/** Outside its first and last day, the field is invalid: it says so at once. */
export const Limits: StoryObj = {
  name: 'First and last day',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <DateField
          defaultValue={parseDate('2026-11-20')}
          minValue={DAY}
          maxValue={DAY.add({ days: 30 })}
          validationBehavior="aria"
        >
          <Label>{t('تاریخ ارسال', 'Delivery date')}</Label>
          <DateField.Group fullWidth>
            <Segments />
          </DateField.Group>
          <Description>{t('تا ۳۰ روز دیگر.', 'Within the next 30 days.')}</Description>
          <FieldError />
        </DateField>
      </Column>
    )
  },
}

/** In a form: its name sends the value, Gregorian ISO 8601. */
export const InAForm: StoryObj = {
  name: 'In a form',
  render: function Render() {
    const t = useT()
    const [sent, setSent] = useState<string | null>(null)
    return (
      <Stage width={420} surface>
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}
          onSubmit={(event) => {
            event.preventDefault()
            setSent(String(new FormData(event.currentTarget).get('ships')))
          }}
        >
          <DateField name="ships" defaultValue={DAY} isRequired>
            <Label>{t('تاریخ ارسال', 'Delivery date')}</Label>
            <DateField.Group fullWidth>
              <Segments />
            </DateField.Group>
          </DateField>
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

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <Column width={320}>
      <DateField defaultValue={DAY}>
        <Label>{t('تاریخ ارسال', 'Delivery date')}</Label>
        <DateField.Group fullWidth>
          <Segments />
        </DateField.Group>
      </DateField>
      <DateField defaultValue={AT_TWO} granularity="minute">
        <Label>{t('زمان انتشار', 'Publish at')}</Label>
        <DateField.Group fullWidth>
          <Segments />
        </DateField.Group>
        <Description>{t('به وقت تهران.', 'In Tehran time.')}</Description>
      </DateField>
      <DateField>
        <Label>{t('تاریخ تولد', 'Birthday')}</Label>
        <DateField.Group fullWidth>
          <Segments />
        </DateField.Group>
      </DateField>
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

/** A Persian page and an English one: a Persian date reads from the right, as it is written. */
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

/** The block a tree sends for a date: this field, with a calendar behind its icon. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'DateField',
      props: {
        label: t('تاریخ ارسال', 'Delivery date'),
        defaultValue: '2026-10-17',
        description: t(
          'روزی که بسته از انبار بیرون می‌رود.',
          'The day the parcel leaves the warehouse.',
        ),
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
