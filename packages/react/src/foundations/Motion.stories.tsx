import type { Meta, StoryObj } from '@storybook/react-vite'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Example, Grid, Stage, useT } from '../stories/kit'
import { Button, Checkbox, Image, Label, ProgressBar, Switch } from '../index'
import { goods } from '../stories/people'
import { Mono } from './live'

// How things move, read from the page as the browser resolved it. The docs page is Motion.mdx. A
// line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Foundations/Motion',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

/** Draws [children] and shows the transition of the first [selector] in them. */
function Transition({ selector, children }: { selector: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [what, setWhat] = useState('')
  useLayoutEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(selector)
    if (!el) return
    const s = getComputedStyle(el)
    const props = s.transitionProperty.split(',').map((x) => x.trim())
    const times = s.transitionDuration.split(',').map((x) => x.trim())
    setWhat(
      props
        .map((p, i) => `${p} ${times[i] ?? times[0]}`)
        .filter((x) => !x.endsWith(' 0s'))
        .slice(0, 4)
        .join(' · '),
    )
  }, [selector])
  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <div ref={ref}>{children}</div>
      {what ? <Mono style={{ color: 'var(--muted)' }}>{what}</Mono> : null}
    </div>
  )
}

/** What each control moves, and for how long, as its stylesheet says. */
export const Durations: StoryObj = {
  name: 'What moves, and how long',
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState(30)
    return (
      <Grid min={220}>
        <Example title="Button" note={t('فشرده می‌شود', 'Presses in')}>
          <Transition selector=".button">
            <Button>{t('ذخیره', 'Save')}</Button>
          </Transition>
        </Example>
        <Example title="Checkbox" note={t('رنگ و تیک', 'Its fill and tick')}>
          <Transition selector=".checkbox__control">
            <Checkbox aria-label={t('انتخاب', 'Choose')}>
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox.Content>
            </Checkbox>
          </Transition>
        </Example>
        <Example title="ProgressBar" note={t('پر می‌شود', 'Fills')}>
          <Transition selector=".progress-bar__fill">
            <div style={{ width: 200, display: 'grid', gap: 8 }}>
              <ProgressBar value={value}>
                <Label>{t('بارگذاری', 'Uploading')}</Label>
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
              <Button
                size="sm"
                variant="tertiary"
                onPress={() => setValue((v) => (v >= 90 ? 10 : v + 30))}
              >
                {t('جلوتر', 'Further')}
              </Button>
            </div>
          </Transition>
        </Example>
        <Example title="Image" note={t('پیدا می‌شود', 'Fades in')}>
          <Transition selector=".db-image__img">
            <Image src={goods.tea.photo} alt="" style={{ width: 96 }} />
          </Transition>
        </Example>
      </Grid>
    )
  },
}

/** The curves, side by side: press to run them again. */
export const Curves: StoryObj = {
  name: 'The curves',
  render: function Render() {
    const t = useT()
    const [on, setOn] = useState(false)
    const curves: [string, string][] = [
      [
        '--ease-out',
        t(
          'بیشتر چیزها: نوار پیشرفت، تیک، رنگ دکمه',
          'Most things: a bar’s fill, a tick, a button’s colour',
        ),
      ],
      ['--ease-out-quart', t('پنجره‌ها و منوها', 'Dialogs, drawers and menus')],
      ['--ease-out-fluid', t('زبانه و اعلان', 'A tab’s pill, a toast')],
      ['--ease-smooth', t('فشردن دکمه، فیلدها، پیوندها', 'A button’s press, fields, links')],
    ]
    return (
      <Stage width={640}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Button size="sm" variant="secondary" onPress={() => setOn((x) => !x)}>
            {t('اجرا', 'Run')}
          </Button>
          {curves.map(([curve, use]) => (
            <div key={curve} style={{ display: 'grid', gap: 4 }}>
              <div
                dir="ltr"
                style={{
                  position: 'relative',
                  height: 20,
                  background: 'var(--default)',
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    insetBlock: 2,
                    left: on ? 'calc(100% - 18px)' : 2,
                    width: 16,
                    borderRadius: 8,
                    background: 'var(--db-indicator-accent)',
                    transition: `left 600ms var(${curve})`,
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <Mono>{curve}</Mono>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{use}</span>
              </div>
            </div>
          ))}
        </div>
      </Stage>
    )
  },
}

/** Less motion, asked for by the reader's system or by the page. */
export const LessMotion: StoryObj = {
  name: 'Less motion',
  render: function Render() {
    const t = useT()
    const [still, setStill] = useState(true)
    const [value, setValue] = useState(30)
    return (
      <Stage width={480}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Switch isSelected={still} onChange={setStill}>
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Label>{t('حرکت کمتر', 'Less motion')}</Label>
            </Switch.Content>
          </Switch>
          <div key={String(still)} data-reduce-motion={still ? 'true' : undefined}>
            <Transition selector=".progress-bar__fill">
              <div style={{ width: 280, display: 'grid', gap: 8 }}>
                <ProgressBar value={value}>
                  <Label>{t('بارگذاری', 'Uploading')}</Label>
                  <ProgressBar.Track>
                    <ProgressBar.Fill />
                  </ProgressBar.Track>
                </ProgressBar>
                <Button
                  size="sm"
                  variant="tertiary"
                  onPress={() => setValue((v) => (v >= 90 ? 10 : v + 30))}
                >
                  {t('جلوتر', 'Further')}
                </Button>
              </div>
            </Transition>
          </div>
        </div>
      </Stage>
    )
  },
}
