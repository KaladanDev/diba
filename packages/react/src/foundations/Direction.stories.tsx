import type { Meta, StoryObj } from '@storybook/react-vite'
import { parseDate } from '@internationalized/date'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Directions, Stage, useT } from '../stories/kit'
import {
  Breadcrumbs,
  Calendar,
  Description,
  Input,
  Label,
  Link,
  Pagination,
  ProgressBar,
  Slider,
  Snippet,
  Stack,
  Text,
  TextField,
  dibaStrings,
} from '../index'
import { CalendarInsides } from '../stories/dates'
import { Mono } from './live'

// What turns with the page's direction, what never does, and the words Diba says in each language.
// The docs page is Direction.mdx. A line comment, not a doc comment: the docs plugin replaces a
// commented meta's parameters with one.
const meta = {
  title: 'Foundations/Direction and language',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

function Turning() {
  const t = useT()
  return (
    <Stack gap={4}>
      <Breadcrumbs>
        <Breadcrumbs.Item href="#">{t('خانه', 'Home')}</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#">{t('سفارش‌ها', 'Orders')}</Breadcrumbs.Item>
        <Breadcrumbs.Item>{t('سفارش ۱۰۴۱', 'Order 1041')}</Breadcrumbs.Item>
      </Breadcrumbs>
      <Pagination aria-label={t('صفحه‌ها', 'Pages')}>
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous aria-label={t('صفحهٔ قبل', 'Previous page')}>
              <Pagination.PreviousIcon />
            </Pagination.Previous>
          </Pagination.Item>
          {[1, 2, 3].map((p) => (
            <Pagination.Item key={p}>
              <Pagination.Link isActive={p === 2}>
                {p.toLocaleString(t('fa-IR', 'en-US'))}
              </Pagination.Link>
            </Pagination.Item>
          ))}
          <Pagination.Item>
            <Pagination.Next aria-label={t('صفحهٔ بعد', 'Next page')}>
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
      <ProgressBar value={40}>
        <Label>{t('بارگذاری', 'Uploading')}</Label>
        <ProgressBar.Output />
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
      <Slider defaultValue={30} aria-label={t('مقدار', 'Value')}>
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>
      <Link href="https://kaladan.shop" target="_blank">
        {t('راهنمای فروشندگان', 'The sellers’ guide')}
        <Link.Icon />
      </Link>
      <Stack direction="horizontal" gap={2} align="center">
        <ChevronLeft size={16} className="rtl:-scale-x-100" aria-hidden />
        <Text size="sm">
          {t('نماد خودتان، با ', 'Your own icon, with ')}
          <Mono>rtl:-scale-x-100</Mono>
        </Text>
        <ChevronRight size={16} className="rtl:-scale-x-100" aria-hidden />
      </Stack>
    </Stack>
  )
}

/** What turns: crumbs, pages, fills, a slider, an external link's arrow, your own arrows. */
export const Mirroring: StoryObj = {
  name: 'What turns',
  render: () => (
    <Directions>
      <Turning />
    </Directions>
  ),
}

function Steady() {
  const t = useT()
  return (
    <Stack gap={4}>
      <TextField defaultValue="0912 345 6789">
        <Label>{t('شمارهٔ همراه', 'Mobile number')}</Label>
        <Input dir="ltr" />
        <Description>{t('چپ به راست، روی هر صفحه', 'Left to right on either page')}</Description>
      </TextField>
      <TextField defaultValue="niloufar@badam.ir" type="email">
        <Label>{t('ایمیل', 'Email')}</Label>
        <Input dir="ltr" />
      </TextField>
      <Snippet>https://badam.kaladan.shop/hooks/orders</Snippet>
    </Stack>
  )
}

/** What never turns: numbers typed, addresses, keys. */
export const Steady_: StoryObj = {
  name: 'What never turns',
  render: () => (
    <Directions>
      <Steady />
    </Directions>
  ),
}

function Dates() {
  const t = useT()
  return (
    <Calendar aria-label={t('روز ارسال', 'Delivery day')} defaultValue={parseDate('2026-11-06')}>
      <CalendarInsides />
    </Calendar>
  )
}

/** A Persian page counts the solar year; an English one the Gregorian. */
export const Calendars: StoryObj = {
  render: () => (
    <Directions>
      <Dates />
    </Directions>
  ),
}

/** Every word Diba says itself, in both languages. */
export const Words: StoryObj = {
  name: 'Diba’s own words',
  render: function Render() {
    const keys = Object.keys(dibaStrings.en) as (keyof typeof dibaStrings.en)[]
    // What each worded string is given, as its component gives it.
    const sample: Record<string, [string, string]> = {
      chooseMonthYear: ['آبان ۱۴۰۵', 'November 2026'],
      notBefore: ['۱۵ آبان ۱۴۰۵', 'November 6, 2026'],
      notAfter: ['۱۵ آبان ۱۴۰۵', 'November 6, 2026'],
      tooShort: ['۳', '3'],
      tooLong: ['۲۰', '20'],
      enlarge: ['شال ابریشم', 'Silk scarf'],
    }
    const say = (k: string, v: unknown, persian: boolean) =>
      typeof v === 'function'
        ? (v as (x: string) => string)((sample[k] ?? ['…', '…'])[persian ? 0 : 1])
        : String(v)
    return (
      <Stage width={900}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['key', 'English', 'فارسی'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'start',
                    padding: '6px 8px',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--muted)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k}>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--separator)' }}>
                  <Mono>{k}</Mono>
                </td>
                <td
                  dir="ltr"
                  style={{
                    padding: '6px 8px',
                    borderBottom: '1px solid var(--separator)',
                    color: 'var(--foreground)',
                  }}
                >
                  {say(k, dibaStrings.en[k], false)}
                </td>
                <td
                  dir="rtl"
                  lang="fa"
                  style={{
                    padding: '6px 8px',
                    borderBottom: '1px solid var(--separator)',
                    color: 'var(--foreground)',
                  }}
                >
                  {say(k, dibaStrings.fa[k], true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Stage>
    )
  },
}
