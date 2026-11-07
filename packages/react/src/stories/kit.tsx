import type { CSSProperties, ReactNode } from 'react'
import { useLocale } from 'react-aria-components'
import { DibaProvider, type DibaTheme } from '../provider/DibaProvider'

/**
 * What every component's stories are built with, so each page reads the same: a story's words in
 * the language Storybook's toolbar chose, a stage as wide as the component is used, captioned
 * examples side by side, and the two themes, the two directions and a phone's width next to each
 * other. Nothing here ships in the package.
 */

/** The Persian and the English of one string, by the locale the story is drawn in. */
export function useT() {
  const { locale } = useLocale()
  const persian = locale.toLowerCase().startsWith('fa')
  return (fa: string, en: string) => (persian ? fa : en)
}

/**
 * A stage as wide as the component is used at: [width] at most, the whole column on a narrower
 * one. On [surface] it lies on a card's paper, as it would in the admin.
 */
export function Stage({
  width = 640,
  surface = false,
  children,
  style,
}: {
  width?: number | '100%'
  surface?: boolean
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: width,
        ...(surface
          ? {
              background: 'var(--surface)',
              borderRadius: 24,
              padding: 16,
              boxShadow: 'var(--surface-shadow)',
            }
          : null),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Captioned examples, as many across as fit at [min] wide each. */
export function Grid({ min = 300, children }: { min?: number; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`,
        gap: 32,
        alignItems: 'start',
        width: '100%',
      }}
    >
      {children}
    </div>
  )
}

/** One example, named, with a line on what it shows. */
export function Example({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: ReactNode
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Each in its own direction, so `size="sm"` reads as written on a Persian page. */}
        <h3 className="text-foreground" style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
          <bdi>{title}</bdi>
        </h3>
        {note ? (
          <p className="text-muted" style={{ margin: 0, fontSize: 12, lineHeight: '18px' }}>
            <bdi>{note}</bdi>
          </p>
        ) : null}
      </header>
      {children}
    </section>
  )
}

/** A page of a story: a heading and a lead, then the examples. */
export function Page({
  title,
  lead,
  children,
}: {
  title?: string
  lead?: string
  children: ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {title || lead ? (
        <header style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 720 }}>
          {title ? (
            <h2 className="text-foreground" style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
              {title}
            </h2>
          ) : null}
          {lead ? (
            <p className="text-muted" style={{ margin: 0, fontSize: 14, lineHeight: '22px' }}>
              {lead}
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </div>
  )
}

/** A panel in its own theme and direction, whatever the toolbar says. */
function Pane({
  theme,
  locale,
  label,
  children,
}: {
  theme: DibaTheme
  locale: 'fa-IR' | 'en-US'
  label: string
  children: ReactNode
}) {
  return (
    <DibaProvider
      theme={theme}
      locale={locale}
      dir={locale === 'fa-IR' ? 'rtl' : 'ltr'}
      ownsDocument={false}
      className="rounded-3xl p-6"
      // Its own theme's page and ink, which nothing above it gives.
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <p
        className="text-muted"
        style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 600, letterSpacing: 0.4 }}
      >
        {label}
      </p>
      {children}
    </DibaProvider>
  )
}

/** The same example in the light theme and the dark, side by side. */
export function Themes({ children }: { children: ReactNode }) {
  const { locale } = useLocale()
  const fa = locale.toLowerCase().startsWith('fa') ? 'fa-IR' : 'en-US'
  return (
    <Grid min={320}>
      <Pane theme="light" locale={fa} label={fa === 'fa-IR' ? 'روشن' : 'LIGHT'}>
        {children}
      </Pane>
      <Pane theme="dark" locale={fa} label={fa === 'fa-IR' ? 'تیره' : 'DARK'}>
        {children}
      </Pane>
    </Grid>
  )
}

/** The same example on a Persian page and an English one, side by side. */
export function Directions({ children }: { children: ReactNode }) {
  return (
    <Grid min={320}>
      <Pane theme="light" locale="fa-IR" label="فارسی · راست به چپ">
        {children}
      </Pane>
      <Pane theme="light" locale="en-US" label="ENGLISH · LEFT TO RIGHT">
        {children}
      </Pane>
    </Grid>
  )
}

/** A device's width, framed: a phone's 375 by default. */
export function Device({ width = 375, children }: { width?: number; children: ReactNode }) {
  return (
    <div
      style={{
        width,
        maxWidth: '100%',
        border: '1px solid var(--border)',
        borderRadius: 32,
        padding: '24px 16px',
        background: 'var(--background)',
      }}
    >
      {children}
    </div>
  )
}

/** A value shown as the code that holds it, for controlled examples. */
export function Value({ label, value }: { label: string; value: unknown }) {
  return (
    <p className="text-muted" style={{ margin: 0, fontSize: 12 }}>
      {label}:{' '}
      <code
        dir="ltr"
        className="text-foreground"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          background: 'var(--default)',
          borderRadius: 6,
          padding: '1px 6px',
        }}
      >
        {JSON.stringify(value)}
      </code>
    </p>
  )
}
