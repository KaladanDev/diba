import type { Meta, StoryObj } from '@storybook/react-vite'
import { useLayoutEffect, useRef, useState } from 'react'
import { useLocale } from 'react-aria-components'
import { Directions, Example, Grid, Stage, useT } from '../stories/kit'
import { Text, textOptions } from '../components/text/Text'
import { toLatinDigits } from '../utils/digits'
import { Mono } from './live'

// The type the components set, read from the page as the browser drew it. The docs page is
// Typography.mdx. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

/** What the browser drew a line in: its size on its line, its weight and its face. */
function Measured({
  children,
  show = 'size',
}: {
  children: React.ReactNode
  show?: 'size' | 'face'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [what, setWhat] = useState('')
  useLayoutEffect(() => {
    const el = ref.current?.firstElementChild as HTMLElement | null
    if (!el) return
    const s = getComputedStyle(el)
    setWhat(
      show === 'size'
        ? `${parseFloat(s.fontSize)} / ${parseFloat(s.lineHeight) || s.lineHeight} · ${s.fontWeight}`
        : s.fontFamily,
    )
  }, [show])
  return (
    <div style={{ display: 'grid', gap: 2, justifyItems: 'start' }}>
      <div ref={ref}>{children}</div>
      {what ? <Mono style={{ color: 'var(--muted)' }}>{what}</Mono> : null}
    </div>
  )
}

const sizes = textOptions.size as (
  'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
)[]

/** Each size, its line and what it is for. */
export const Scale: StoryObj = {
  name: 'The scale',
  render: function Render() {
    const t = useT()
    const use: Record<string, [string, string]> = {
      xs: ['زیرنویس، یادداشت زیر فیلد', 'Captions, a note under a field'],
      sm: ['متن فرم‌ها، جدول‌ها و دکمه‌ها', 'Forms, tables, buttons'],
      md: ['متن پیش‌فرض', 'The default, running text'],
      lg: ['عنوان کارت بزرگ', 'A large card’s title'],
      xl: ['عنوان بخش', 'A section’s title'],
      '2xl': ['عنوان صفحه', 'A page’s title'],
      '3xl': ['عدد اصلی داشبورد', 'A dashboard’s figure'],
      '4xl': ['عدد بزرگ ویترین', 'A storefront’s large figure'],
      '5xl': ['تیتر صفحهٔ نخست', 'A home page’s headline'],
    }
    return (
      <Stage width={760}>
        <div style={{ display: 'grid', gap: 16 }}>
          {sizes.map((size) => (
            <div
              key={size}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr',
                gap: 12,
                alignItems: 'baseline',
              }}
            >
              <Mono>{`size="${size}"`}</Mono>
              <Measured>
                <Text size={size}>
                  {t('فروش امروز ۱۲ سفارش بود', 'Twelve orders came in today')}
                </Text>
              </Measured>
              <span />
              <Text size="xs" tone="muted">
                {t(...use[size]!)}
              </Text>
            </div>
          ))}
        </div>
      </Stage>
    )
  },
}

/** Four weights. */
export const Weights: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={180}>
        {(['normal', 'medium', 'semibold', 'bold'] as const).map((weight) => (
          <Example key={weight} title={`weight="${weight}"`}>
            <Measured>
              <Text weight={weight}>{t('کالادان', 'Kaladan')}</Text>
            </Measured>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** The tones words take: the body's, a note's, the brand's ink and the statuses' inks. */
export const Tones: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={180}>
        {(
          textOptions.tone as (
            'default' | 'muted' | 'primary' | 'accent' | 'success' | 'warning' | 'danger'
          )[]
        ).map((tone) => (
          <Example key={tone} title={`tone="${tone}"`}>
            <Text tone={tone}>{t('موجودی کم است', 'Stock is low')}</Text>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** The face each language is drawn in on this page, as the browser resolved it. */
export const Faces: StoryObj = {
  render: function Render() {
    return (
      <Directions>
        <Face />
      </Directions>
    )
  },
}

function Face() {
  const t = useT()
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Measured show="face">
        <Text size="xl" weight="semibold">
          {t('چای لاهیجان، ۴۵۰ گرم', 'Lahijan tea, 450 g')}
        </Text>
      </Measured>
      <Measured show="face">
        <Text>
          {t(
            'نیم‌فاصله‌ها، «گیومه»ها و ارقام فارسی در همان قلم.',
            'Body text, and figures 0123456789 in the same face.',
          )}
        </Text>
      </Measured>
    </div>
  )
}

/** Figures in the reader's digits, toman, dates, and what goes back to the server. */
export const Numbers: StoryObj = {
  name: 'Numbers and digits',
  render: function Render() {
    return (
      <Directions>
        <Figures />
      </Directions>
    )
  },
}

function Figures() {
  const t = useT()
  const { locale } = useLocale()
  const num = new Intl.NumberFormat(locale)
  const typed = '۰۹۱۲ ۳۴۵ ۶۷۸۹'
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <Text>
        {t('مبلغ', 'Amount')}: {num.format(1_240_000)} {t('تومان', 'toman')}
      </Text>
      <Text>
        {t('تاریخ', 'Date')}:{' '}
        {new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(2026, 10, 6))}
      </Text>
      <Text style={{ fontVariantNumeric: 'tabular-nums' }}>
        {t('ستونی از عددها', 'A column of figures')}: {num.format(1_041)} · {num.format(98_000)}
      </Text>
      <Text size="sm" tone="muted">
        {t('آنچه نوشته شد', 'What was typed')}: <Mono>{typed}</Mono> → <Mono>toLatinDigits</Mono> →{' '}
        <Mono>{toLatinDigits(typed)}</Mono>
      </Text>
    </div>
  )
}

/** Latin inside Persian: a code, an address, a name, each kept in its own direction. */
export const MixedDirection: StoryObj = {
  name: 'Latin inside Persian',
  render: function Render() {
    return (
      <Stage width={560}>
        <div dir="rtl" lang="fa" style={{ display: 'grid', gap: 10 }}>
          <Text>
            کد پیگیری <bdi>DB-1041-8F2C</bdi> را در سایت پست بنویسید.
          </Text>
          <Text>
            نشانی <bdi>badam.kaladan.shop</bdi> را برای مشتری بفرستید.
          </Text>
          <Text>
            برنامهٔ <bdi>Torob (v2)</bdi> به فروشگاه وصل شد.
          </Text>
        </div>
      </Stage>
    )
  },
}
