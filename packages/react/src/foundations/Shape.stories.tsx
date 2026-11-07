import type { Meta, StoryObj } from '@storybook/react-vite'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Example, Grid, Stage, Themes, useT } from '../stories/kit'
import { Alert, Avatar, Button, Card, Chip, Input, Label, Stack, TextField } from '../index'
import { Mono } from './live'

// Space, corners, edges, shadows and the focus ring, read from the page as the browser drew them.
// The docs page is Shape.mdx. A line comment, not a doc comment: the docs plugin replaces a
// commented meta's parameters with one.
const meta = {
  title: 'Foundations/Spacing and shape',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

/** Draws [children] and reads [property] off the first element matching [selector] in them. */
function Measure({
  selector,
  property,
  children,
}: {
  selector: string
  property: 'borderRadius' | 'boxShadow' | 'rowGap' | 'paddingInlineStart' | 'height'
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState('')
  useLayoutEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(selector)
    if (el) setValue(getComputedStyle(el)[property])
  }, [selector, property])
  return (
    <div style={{ display: 'grid', gap: 6, justifyItems: 'start' }}>
      <div ref={ref}>{children}</div>
      {value ? <Mono style={{ color: 'var(--muted)' }}>{value}</Mono> : null}
    </div>
  )
}

/** A block to see the room between. */
function Block() {
  return (
    <div style={{ width: 48, height: 24, borderRadius: 6, background: 'var(--db-saffron-300)' }} />
  )
}

/** A Stack's gaps: a step of 4. */
export const Space: StoryObj = {
  name: 'Space',
  render: function Render() {
    return (
      <Stage width={760}>
        <div style={{ display: 'grid', gap: 12 }}>
          {([0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16] as const).map((gap) => (
            <div
              key={gap}
              style={{ display: 'grid', gridTemplateColumns: '88px 1fr', alignItems: 'center' }}
            >
              <Mono>{`gap={${gap}}`}</Mono>
              <Measure selector=".db-stack" property="rowGap">
                <Stack direction="horizontal" gap={gap}>
                  <Block />
                  <Block />
                </Stack>
              </Measure>
            </div>
          ))}
        </div>
      </Stage>
    )
  },
}

/** Each component's corners, as drawn. */
export const Corners: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={180}>
        <Example title="Button" note="size md">
          <Measure selector=".button" property="borderRadius">
            <Button>{t('ذخیره', 'Save')}</Button>
          </Measure>
        </Example>
        <Example title="TextField">
          <Measure selector=".input" property="borderRadius">
            <TextField aria-label={t('نام', 'Name')}>
              <Input placeholder={t('نام', 'Name')} />
            </TextField>
          </Measure>
        </Example>
        <Example title="Card">
          <Measure selector=".card" property="borderRadius">
            <Card style={{ width: 140 }}>
              <Card.Title>{t('کارت', 'A card')}</Card.Title>
            </Card>
          </Measure>
        </Example>
        <Example title="Alert">
          <Measure selector=".alert" property="borderRadius">
            <Alert style={{ width: 160 }}>
              <Alert.Content>
                <Alert.Title>{t('هشدار', 'An alert')}</Alert.Title>
              </Alert.Content>
            </Alert>
          </Measure>
        </Example>
        <Example title="Chip">
          <Measure selector=".chip" property="borderRadius">
            <Chip>{t('ارسال شد', 'Sent')}</Chip>
          </Measure>
        </Example>
        <Example title="Avatar">
          <Measure selector=".avatar" property="borderRadius">
            <Avatar>
              <Avatar.Fallback>{t('ن‌ر', 'NR')}</Avatar.Fallback>
            </Avatar>
          </Measure>
        </Example>
      </Grid>
    )
  },
}

/** The three shadows: a card's, an overlay's and a field's edge, in both themes. */
export const Elevation: StoryObj = {
  render: function Render() {
    const t = useT()
    const tiles: [string, string, string][] = [
      ['--surface-shadow', t('کارت', 'A card'), '--surface'],
      ['--overlay-shadow', t('منو، پنجره', 'A menu, a dialog'), '--overlay'],
      ['--field-shadow', t('لبهٔ فیلد', 'A field’s edge'), '--field-background'],
    ]
    return (
      <Themes>
        <div style={{ display: 'grid', gap: 20 }}>
          {tiles.map(([shadow, name, paper]) => (
            <div key={shadow} style={{ display: 'grid', gap: 6 }}>
              <div
                style={{
                  height: 56,
                  borderRadius: 16,
                  background: `var(${paper})`,
                  boxShadow: `var(${shadow})`,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--foreground)',
                  fontSize: 14,
                }}
              >
                {name}
              </div>
              <Mono style={{ color: 'var(--muted)' }}>{shadow}</Mono>
            </div>
          ))}
        </div>
      </Themes>
    )
  },
}

/** The ring the keyboard's focus draws: 2 wide in the focus colour, 2 clear of a control. */
export const FocusRing: StoryObj = {
  name: 'The focus ring',
  render: function Render() {
    const t = useT()
    const ring = {
      boxShadow: '0 0 0 2px var(--background), 0 0 0 4px var(--focus)',
    }
    const fieldRing = { boxShadow: '0 0 0 2px var(--focus)' }
    return (
      <Themes>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <div style={{ display: 'grid', gap: 6, justifyItems: 'start' }}>
            <Button style={ring}>{t('دکمه', 'A button')}</Button>
            <Mono style={{ color: 'var(--muted)' }}>{t('۲ فاصله، ۲ حلقه', '2 clear, 2 ring')}</Mono>
          </div>
          <div style={{ display: 'grid', gap: 6, justifyItems: 'start' }}>
            <TextField defaultValue={t('نیلوفر', 'Niloufar')}>
              <Label>{t('نام', 'Name')}</Label>
              <Input style={fieldRing} />
            </TextField>
            <Mono style={{ color: 'var(--muted)' }}>{t('روی لبه', 'On the edge')}</Mono>
          </div>
        </div>
      </Themes>
    )
  },
}
