import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'
import { DibaProvider } from '../provider/DibaProvider'
import { Example, Grid, useT } from '../stories/kit'
import { Button, Card, Checkbox, Chip, Label, ProgressBar, Stack, Switch, Text } from '../index'

// How a page changes Diba's colours: a merchant's brand over the gilt, dark mode, and a dark panel
// on a light page. The docs page is Theming.mdx. A line comment, not a doc comment: the docs plugin
// replaces a commented meta's parameters with one.
const meta = {
  title: 'Foundations/Theming',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

/** A piece of a settings page that shows the brand and a control in each of its states. */
function Sample() {
  const t = useT()
  return (
    <Card>
      <Stack gap={3}>
        <Card.Title>{t('ارسال رایگان', 'Free delivery')}</Card.Title>
        <Text size="sm" tone="muted">
          {t('برای سفارش‌های بالای ۵۰۰٬۰۰۰ تومان', 'On orders over 500,000 toman')}
        </Text>
        <Stack direction="horizontal" gap={2} align="center" wrap>
          <Chip color="accent">{t('فعال', 'On')}</Chip>
          <Switch defaultSelected aria-label={t('فعال', 'On')}>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch>
          <Checkbox defaultSelected aria-label={t('همه', 'All')}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
            </Checkbox.Content>
          </Checkbox>
        </Stack>
        <ProgressBar value={60}>
          <Label>{t('تا ارسال رایگان', 'Towards free delivery')}</Label>
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
        <Stack direction="horizontal" gap={2}>
          <Button size="sm" variant="primary">
            {t('ذخیره', 'Save')}
          </Button>
          <Button size="sm" variant="secondary">
            {t('انصراف', 'Cancel')}
          </Button>
        </Stack>
      </Stack>
    </Card>
  )
}

/** A merchant's teal, set on the roles: the brand's fill and words, and the controls'. */
const teal = {
  '--accent': 'oklch(0.6 0.11 190)',
  '--accent-foreground': 'oklch(0.99 0 0)',
  '--accent-hover': 'oklch(0.55 0.11 190)',
  '--accent-soft': 'oklch(0.95 0.03 190)',
  '--accent-soft-foreground': 'oklch(0.42 0.08 190)',
  '--db-control-fill': 'oklch(0.6 0.11 190)',
  '--db-control-on-fill': 'oklch(0.99 0 0)',
  '--db-indicator-accent': 'oklch(0.5 0.1 190)',
} as CSSProperties

/** The same page in Diba's gilt and in a merchant's teal. */
export const ABrand: StoryObj = {
  name: 'A brand over the gilt',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        <Example title={t('دیبا', 'Diba’s')} note={t('زرین', 'The gilt')}>
          <Sample />
        </Example>
        <Example title={t('برند فروشگاه', 'A shop’s')} note={t('هشت متغیر', 'Eight variables')}>
          <div style={teal}>
            <Sample />
          </div>
        </Example>
      </Grid>
    )
  },
}

/** Light and dark: one prop on the provider. */
export const DarkMode: StoryObj = {
  name: 'Light and dark',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={300}>
        {(['light', 'dark'] as const).map((theme) => (
          <Example key={theme} title={`theme="${theme}"`}>
            <DibaProvider
              theme={theme}
              locale={t('fa-IR', 'en-US')}
              ownsDocument={false}
              style={{ background: 'var(--background)', padding: 16, borderRadius: 24 }}
            >
              <Sample />
            </DibaProvider>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** A dark panel inside a light page: a second provider, which leaves the page alone. */
export const Nested: StoryObj = {
  name: 'A dark panel on a light page',
  render: function Render() {
    const t = useT()
    return (
      <DibaProvider
        theme="light"
        locale={t('fa-IR', 'en-US')}
        ownsDocument={false}
        style={{ background: 'var(--background)', padding: 16, borderRadius: 24 }}
      >
        <Grid min={280}>
          <Sample />
          <DibaProvider
            theme="dark"
            locale={t('fa-IR', 'en-US')}
            ownsDocument={false}
            style={{ background: 'var(--background)', padding: 16, borderRadius: 24 }}
          >
            <Sample />
          </DibaProvider>
        </Grid>
      </DibaProvider>
    )
  },
}
