import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { Example, Stage, Themes, useT } from '../stories/kit'
import { Button, Checkbox, Label, ProgressBar, Slider, Switch } from '../index'
import { Mono, Ratio, contrastOf, hexOf, palette, rgbaOf, useResolved, useStepNames } from './live'

// The colours the components draw with, by role, read from the page as the browser resolved them.
// The docs page is Colors.mdx. A line comment, not a doc comment: the docs plugin replaces a
// commented meta's parameters with one.
const meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

type Role = { v: string; fa: string; en: string }

/** A role's tile: its colour, its name, its variable, and what it resolved to. */
function RoleTiles({ roles }: { roles: Role[] }) {
  const t = useT()
  const [values, probe] = useResolved(roles.map((r) => r.v))
  const [stepOf, steps] = useStepNames()
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12,
        position: 'relative',
      }}
    >
      {probe}
      {steps}
      {roles.map((r) => (
        <div
          key={r.v}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
            background: 'var(--surface)',
          }}
        >
          <div style={{ height: 48, background: `var(${r.v})` }} />
          <div style={{ padding: 8, display: 'grid', gap: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
              {t(r.fa, r.en)}
            </span>
            <Mono style={{ color: 'var(--muted)' }}>{r.v}</Mono>
            <Mono style={{ color: 'var(--muted)' }}>
              {[stepOf(values[r.v] ?? ''), hexOf(values[r.v] ?? '')].filter(Boolean).join(' · ')}
            </Mono>
          </div>
        </div>
      ))}
    </div>
  )
}

/** A paper and the words on it, each with its contrast. */
function Paper({
  paper,
  ink,
  muted,
  name,
  children,
}: {
  paper: string
  ink: string
  muted: string
  name: string
  children?: ReactNode
}) {
  const t = useT()
  const [values, probe] = useResolved([paper, ink, muted])
  const [stepOf, steps] = useStepNames()
  const p = values[paper] ?? ''
  return (
    <div
      style={{
        position: 'relative',
        background: `var(${paper})`,
        borderRadius: 16,
        padding: 16,
        display: 'grid',
        gap: 6,
        boxShadow: paper === '--overlay' ? 'var(--overlay-shadow)' : undefined,
        border: '1px solid var(--border)',
      }}
    >
      {probe}
      {steps}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ color: `var(${ink})`, fontSize: 14, fontWeight: 600 }}>{name}</span>
        <Mono style={{ color: `var(${muted})` }}>
          {paper} · {stepOf(p)}
        </Mono>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ color: `var(${ink})`, fontSize: 14 }}>
          {t('متن اصلی', 'Body text')} <Mono>{ink}</Mono>
        </span>
        <Ratio value={contrastOf(values[ink] ?? '', p)} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ color: `var(${muted})`, fontSize: 14 }}>
          {t('یادداشت کم‌رنگ', 'A muted note')} <Mono>{muted}</Mono>
        </span>
        <Ratio value={contrastOf(values[muted] ?? '', p)} />
      </div>
      {children}
    </div>
  )
}

// ---- the papers ----------------------------------------------------------------------------------

/** The page, the cards on it, the two greys and an overlay, each with its words. */
export const Surfaces: StoryObj = {
  name: 'Surfaces and their words',
  render: function Render() {
    const t = useT()
    const ladder = (
      <div style={{ display: 'grid', gap: 12 }}>
        <Paper
          paper="--background"
          ink="--foreground"
          muted="--muted"
          name={t('صفحه', 'The page')}
        />
        <Paper
          paper="--surface"
          ink="--surface-foreground"
          muted="--muted"
          name={t('کارت', 'A card')}
        />
        <Paper
          paper="--surface-secondary"
          ink="--surface-secondary-foreground"
          muted="--db-muted-secondary"
          name={t('سطح دوم', 'The second surface')}
        />
        <Paper
          paper="--surface-tertiary"
          ink="--foreground"
          muted="--db-muted-tertiary"
          name={t('سطح سوم', 'The third surface')}
        />
        <Paper
          paper="--overlay"
          ink="--overlay-foreground"
          muted="--muted"
          name={t('روی صفحه', 'An overlay')}
        />
      </div>
    )
    return <Themes>{ladder}</Themes>
  },
}

// ---- words, brand and status ---------------------------------------------------------------------

/** The words: body, secondary, notes, links and placeholders, each on a card. */
export const Words: StoryObj = {
  render: function Render() {
    const t = useT()
    const words = [
      { v: '--foreground', fa: 'متن اصلی', en: 'Body text' },
      { v: '--default-foreground', fa: 'متن دوم', en: 'Secondary text' },
      { v: '--muted', fa: 'یادداشت', en: 'A note' },
      { v: '--link', fa: 'پیوند', en: 'A link' },
      { v: '--field-placeholder', fa: 'جای‌نگهدار', en: 'A placeholder' },
    ]
    function List() {
      const [values, probe] = useResolved([...words.map((w) => w.v), '--surface'])
      return (
        <div style={{ position: 'relative', display: 'grid', gap: 8 }}>
          {probe}
          {words.map((w) => (
            <div
              key={w.v}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 8,
                background: 'var(--surface)',
                borderRadius: 12,
                padding: '8px 12px',
              }}
            >
              <span style={{ color: `var(${w.v})`, fontSize: 14 }}>
                {t(w.fa, w.en)} <Mono>{w.v}</Mono>
              </span>
              <Ratio value={contrastOf(values[w.v] ?? '', values['--surface'] ?? '')} />
            </div>
          ))}
        </div>
      )
    }
    return (
      <Themes>
        <List />
      </Themes>
    )
  },
}

/** The brand's gilt and the three statuses: a fill with its words, and the ink on a card. */
export const BrandAndStatus: StoryObj = {
  name: 'Brand and status',
  render: function Render() {
    const t = useT()
    const tones = [
      {
        name: t('برند', 'Brand'),
        fill: '--accent',
        on: '--accent-foreground',
        ink: '--db-primary-emphasis',
        soft: '--accent-soft',
      },
      {
        name: t('موفق', 'Success'),
        fill: '--success',
        on: '--success-foreground',
        ink: '--db-success-emphasis',
        soft: '',
      },
      {
        name: t('هشدار', 'Warning'),
        fill: '--warning',
        on: '--warning-foreground',
        ink: '--db-warning-emphasis',
        soft: '',
      },
      {
        name: t('خطر', 'Danger'),
        fill: '--danger',
        on: '--danger-foreground',
        ink: '--db-danger-emphasis',
        soft: '',
      },
    ]
    function Tones() {
      const [values, probe] = useResolved([
        ...tones.flatMap((x) => [x.fill, x.on, x.ink, x.soft].filter(Boolean)),
        '--surface',
      ])
      return (
        <div style={{ position: 'relative', display: 'grid', gap: 12 }}>
          {probe}
          {tones.map((x) => (
            <div key={x.fill} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div
                style={{
                  background: `var(${x.fill})`,
                  color: `var(${x.on})`,
                  borderRadius: 12,
                  padding: '8px 12px',
                  display: 'grid',
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{x.name}</span>
                <Mono>{x.fill}</Mono>
                <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Mono>{x.on}</Mono>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {(contrastOf(values[x.on] ?? '', values[x.fill] ?? '') ?? 0).toFixed(1)}:1
                  </span>
                </span>
              </div>
              <div
                style={{
                  background: x.soft ? `var(${x.soft})` : 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '8px 12px',
                  display: 'grid',
                  gap: 2,
                }}
              >
                <span style={{ color: `var(${x.ink})`, fontSize: 14, fontWeight: 600 }}>
                  {t('جوهر روی کارت', 'Its ink on a card')}
                </span>
                <Mono style={{ color: `var(${x.ink})` }}>{x.ink}</Mono>
                <Ratio
                  value={contrastOf(
                    values[x.ink] ?? '',
                    values[x.soft || '--surface'] ?? values['--surface'] ?? '',
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )
    }
    return (
      <Themes>
        <Tones />
      </Themes>
    )
  },
}

// ---- lines, fills and controls -------------------------------------------------------------------

/** The edges and the neutral fills: borders, separators, a field's edge, the fill and the ring. */
export const LinesAndFills: StoryObj = {
  name: 'Lines and fills',
  render: () => (
    <Themes>
      <RoleTiles
        roles={[
          { v: '--border', fa: 'لبه', en: 'Border' },
          { v: '--separator', fa: 'جداکننده', en: 'Separator' },
          { v: '--field-border', fa: 'لبهٔ فیلد', en: 'Field edge' },
          { v: '--field-background', fa: 'زمینهٔ فیلد', en: 'Field' },
          { v: '--db-field-secondary', fa: 'فیلد دوم', en: 'Secondary field' },
          { v: '--default', fa: 'پرکنندهٔ خنثی', en: 'Neutral fill' },
          { v: '--default-hover', fa: 'زیر نشانگر', en: 'Under the pointer' },
          { v: '--segment', fa: 'گزینهٔ انتخاب‌شده', en: 'Chosen segment' },
          { v: '--focus', fa: 'حلقهٔ تمرکز', en: 'Focus ring' },
          { v: '--backdrop', fa: 'پشت پنجره', en: 'Backdrop' },
        ]}
      />
    </Themes>
  ),
}

/** What a choice is drawn in: the gilt on, slate-700 on it, the track off, and the indicators. */
export const Controls: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Themes>
        <div style={{ display: 'grid', gap: 16 }}>
          <RoleTiles
            roles={[
              { v: '--db-control-fill', fa: 'روشن', en: 'On' },
              { v: '--db-control-on-fill', fa: 'روی روشن', en: 'On the fill' },
              { v: '--db-control-track', fa: 'خاموش', en: 'Off track' },
              { v: '--db-control-thumb-off', fa: 'دستهٔ خاموش', en: 'Off thumb' },
              { v: '--db-indicator-accent', fa: 'نشانگر برند', en: 'Brand indicator' },
              { v: '--db-indicator-warning', fa: 'نشانگر هشدار', en: 'Warning indicator' },
            ]}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <Switch defaultSelected aria-label={t('روشن', 'On')}>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
            <Switch aria-label={t('خاموش', 'Off')}>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
            <Checkbox defaultSelected aria-label={t('انتخاب‌شده', 'Chosen')}>
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox.Content>
            </Checkbox>
            <div style={{ width: 160 }}>
              <Slider defaultValue={40} aria-label={t('مقدار', 'Value')}>
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb />
                </Slider.Track>
              </Slider>
            </div>
          </div>
          <ProgressBar value={60}>
            <Label>{t('بارگذاری', 'Uploading')}</Label>
            <ProgressBar.Output />
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </div>
      </Themes>
    )
  },
}

// ---- the palette ---------------------------------------------------------------------------------

/** Whether a resolved colour is light enough for dark words on it. */
function light(colour: string | undefined) {
  const rgba = rgbaOf(colour ?? '')
  if (!rgba) return true
  const [r, g, b] = rgba
  return (r * 299 + g * 587 + b * 114) / 1000 > 140
}

/** The scales the theme draws from, step by step. */
export const Palette: StoryObj = {
  name: 'The palette',
  render: function Render() {
    const names = Object.entries(palette)
    function Scale({ scale, steps }: { scale: string; steps: (string | number)[] }) {
      const vars = steps.map((s) => `--db-${scale}-${s}`)
      const [values, probe] = useResolved(vars)
      return (
        <div style={{ position: 'relative' }}>
          {probe}
          <div
            dir="ltr"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}
          >
            {vars.map((v, i) => (
              <div key={v} style={{ background: `var(${v})`, padding: '28px 4px 6px' }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: light(values[v]) ? 'var(--db-slate-900)' : 'var(--db-paper-0)',
                  }}
                >
                  {steps[i]}
                </div>
                <Mono
                  style={{
                    fontSize: 10,
                    color: light(values[v]) ? 'var(--db-slate-700)' : 'var(--db-slate-200)',
                  }}
                >
                  {hexOf(values[v] ?? '')}
                </Mono>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return (
      <Stage width={1100}>
        <div style={{ display: 'grid', gap: 20 }}>
          {names.map(([scale, steps]) => (
            <Example
              key={scale}
              title={scale}
              note={`--db-${scale}-${steps[0]} … --db-${scale}-${steps.at(-1)}`}
            >
              <Scale scale={scale} steps={steps} />
            </Example>
          ))}
        </div>
      </Stage>
    )
  },
}

/** A card of the admin in both themes: what the roles look like together. */
export const Together: StoryObj = {
  name: 'Together, on a card',
  render: function Render() {
    const t = useT()
    return (
      <Themes>
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            padding: 16,
            boxShadow: 'var(--surface-shadow)',
            display: 'grid',
            gap: 12,
          }}
        >
          <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>
            {t('سفارش ۱۰۴۱', 'Order 1041')}
          </span>
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>
            {t('دیروز، ۲ کالا', 'Yesterday, 2 items')}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm">{t('ارسال', 'Ship it')}</Button>
            <Button size="sm" variant="secondary">
              {t('چاپ برچسب', 'Print label')}
            </Button>
          </div>
        </div>
      </Themes>
    )
  },
}
