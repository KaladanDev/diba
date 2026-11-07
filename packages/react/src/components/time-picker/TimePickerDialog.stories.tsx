import type { Meta, StoryObj } from '@storybook/react-vite'
import { Clock } from 'lucide-react'
import { useState } from 'react'
import { useLocale } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Example, Grid, Stage, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { TimePickerDialog, type TimeOfDay } from './index'

// The TimePickerDialog, every option it has and what it is built into. The docs page is
// TimePickerDialog.mdx. A line comment, not a doc comment: the docs plugin replaces a commented
// meta's parameters with one. Each story is its own frame in the docs: a modal covers the page.
const meta: Meta<typeof TimePickerDialog> = {
  title: 'Components/Date and Time/TimePickerDialog',
  component: TimePickerDialog,
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '640px' } },
  },
}

export default meta

const two = (n: number) => String(n).padStart(2, '0')

/** A time of day as the reader's clock reads it: «۱۴:۳۰», "2:30 PM". */
function useClock() {
  const { locale } = useLocale()
  return (time: TimeOfDay | null, twelve = false) =>
    time
      ? new Intl.DateTimeFormat(locale, {
          hour: twelve ? 'numeric' : '2-digit',
          minute: '2-digit',
          hour12: twelve,
        }).format(new Date(2000, 0, 1, time.hour, time.minute))
      : null
}

/**
 * A button reading the time, which opens the picker on it: what a time field is, as the block
 * draws one.
 */
function Opener({
  label,
  value,
  twelve,
  onPress,
}: {
  label: string
  value: TimeOfDay | null
  twelve?: boolean
  onPress: () => void
}) {
  const clock = useClock()
  const t = useT()
  return (
    <Button
      variant="secondary"
      onPress={onPress}
      aria-label={`${label}، ${clock(value, twelve) ?? t('خالی', 'empty')}`}
    >
      <Clock aria-hidden />
      {clock(value, twelve) ?? label}
    </Button>
  )
}

/** What lies under an open picker: the page, a line saying what it asks. */
function Under({ children }: { children: string }) {
  return (
    <p className="text-muted" style={{ margin: 24, fontSize: 14 }}>
      {children}
    </p>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  hourCycle: 12 | 24
  helpText: string
  startOpen: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { hourCycle: 24, helpText: '', startOpen: true },
  argTypes: {
    hourCycle: {
      control: 'inline-radio',
      options: [12, 24],
      description: '12 asks the half of the day too; 24 takes the hours on two rings.',
      table: { category: 'TimePickerDialog', defaultValue: { summary: '24' } },
    },
    helpText: {
      control: 'text',
      description: 'The words over the clock; empty, «انتخاب ساعت».',
      table: { category: 'TimePickerDialog' },
    },
    startOpen: { description: 'Open when the story draws.', table: { category: 'Example' } },
  },
  render: function Render({ hourCycle, helpText, startOpen }) {
    const t = useT()
    const [open, setOpen] = useState(startOpen)
    const [value, setValue] = useState<TimeOfDay | null>({ hour: 14, minute: 30 })
    return (
      <Stage width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24 }}>
          <div>
            <Opener
              label={t('ساعت تحویل', 'Delivery time')}
              value={value}
              twelve={hourCycle === 12}
              onPress={() => setOpen(true)}
            />
          </div>
          <Value label="value" value={value ? `${two(value.hour)}:${two(value.minute)}` : null} />
          <TimePickerDialog
            isOpen={open}
            onOpenChange={setOpen}
            value={value}
            hourCycle={hourCycle}
            helpText={helpText || undefined}
            onConfirm={(time) => {
              setValue(time)
              setOpen(false)
            }}
          />
        </div>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** A window wider than tall lays it on its side: the hour and minute at the start, the dial at the end. */
export const Lying: StoryObj = {
  name: 'Lying',
  render: function Render() {
    const t = useT()
    const [open, setOpen] = useState(true)
    return (
      <>
        <Under>
          {t('پنجره پهن‌تر از بلند: برگهٔ خوابیده.', 'A window wider than tall: the picker lying.')}
        </Under>
        <TimePickerDialog
          isOpen={open}
          onOpenChange={setOpen}
          value={{ hour: 9, minute: 30 }}
          onConfirm={() => setOpen(false)}
        />
      </>
    )
  },
}

/** A window taller than wide, a phone's, stands it up: the hour and minute over the dial. */
export const Standing: StoryObj = {
  name: 'Standing, on a phone',
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  render: function Render() {
    const t = useT()
    const [open, setOpen] = useState(true)
    return (
      <>
        <Under>{t('پنجرهٔ گوشی: برگهٔ ایستاده.', 'A phone’s window: the picker standing.')}</Under>
        <TimePickerDialog
          isOpen={open}
          onOpenChange={setOpen}
          value={{ hour: 9, minute: 30 }}
          onConfirm={() => setOpen(false)}
        />
      </>
    )
  },
}

/** A 12-hour clock: AM and PM beside the hour and minute, the dial's twelve hours. */
export const TwelveHours: StoryObj = {
  name: 'A 12-hour clock',
  render: function Render() {
    const t = useT()
    const [open, setOpen] = useState(true)
    return (
      <>
        <Under>{t('ساعت ۱۲تایی: ق.ظ. و ب.ظ.', 'A 12-hour clock: AM and PM.')}</Under>
        <TimePickerDialog
          isOpen={open}
          onOpenChange={setOpen}
          value={{ hour: 14, minute: 30 }}
          hourCycle={12}
          onConfirm={() => setOpen(false)}
        />
      </>
    )
  },
}

/** A range's two times, asked one after the other: the first's words, then the last's. */
export const TwoTimes: StoryObj = {
  name: 'Two times, one after the other',
  render: function Render() {
    const t = useT()
    const clock = useClock()
    const [asking, setAsking] = useState<'start' | 'end' | null>(null)
    const [start, setStart] = useState<TimeOfDay | null>({ hour: 9, minute: 0 })
    const [end, setEnd] = useState<TimeOfDay | null>({ hour: 21, minute: 0 })
    return (
      <Stage width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24 }}>
          <div>
            <Button variant="secondary" onPress={() => setAsking('start')}>
              <Clock aria-hidden />
              {t(`${clock(start)} تا ${clock(end)}`, `${clock(start)} to ${clock(end)}`)}
            </Button>
          </div>
          <TimePickerDialog
            isOpen={asking === 'start'}
            onOpenChange={(isOpen) => isOpen || setAsking(null)}
            helpText={t('ساعت آغاز', 'Start time')}
            value={start}
            onConfirm={(time) => {
              setStart(time)
              setAsking('end')
            }}
          />
          <TimePickerDialog
            isOpen={asking === 'end'}
            onOpenChange={(isOpen) => isOpen || setAsking(null)}
            helpText={t('ساعت پایان', 'End time')}
            value={end}
            onConfirm={(time) => {
              setEnd(time)
              setAsking(null)
            }}
          />
        </div>
      </Stage>
    )
  },
}

/** Dark, whatever the toolbar says. */
export const Dark: StoryObj = {
  globals: { theme: 'dark' },
  render: Lying.render,
}

/** In English, left to right, whatever the toolbar says. */
export const LeftToRight: StoryObj = {
  name: 'English, left to right',
  globals: { locale: 'en-US', dir: 'ltr' },
  render: TwelveHours.render,
}

// ---- what it builds ------------------------------------------------------------------------------

/** A time field, as a tree draws one: it reads «۱۴:۳۰» and opens the picker when pressed. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  parameters: { docs: { story: { inline: true } } },
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'TimeField',
      props: { label: t('ساعت تحویل', 'Delivery time'), defaultValue: '14:30' },
    }
    return (
      <Stage width={760}>
        <div style={{ padding: 24 }}>
          <Grid min={320}>
            <Example
              title={t('آنچه کشیده می‌شود', 'What is drawn')}
              note={t('بزنید تا باز شود', 'Press it to open the picker')}
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
        </div>
      </Stage>
    )
  },
}
