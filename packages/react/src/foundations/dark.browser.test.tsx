import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { DibaProvider } from '../provider/DibaProvider'
import { settled, textContrast } from '../test/visual'
import {
  Alert,
  Button,
  buttonVariants,
  Card,
  Chip,
  chipVariants,
  Modal,
  ProgressBar,
  Label,
  Snippet,
  snippetOptions,
  Text,
} from '../index'

/**
 * The dark theme, swept.
 *
 * Every contrast assertion in this library lives inside one component's suite,
 * and almost all of them run in light. Three separate ink-on-ink bugs shipped
 * in light anyway — so the theme nobody measures is not a theory.
 *
 * Rather than a ratio per component, this renders a spread of them and walks
 * the tree, checking every element that carries its own words. A component
 * nobody thought to check is the whole point; naming them individually would
 * reproduce the gap. The variants and colours come from the recipes, so one
 * added later is swept too.
 */

let mounted: { unmount: () => void } | null = null
afterEach(() => {
  mounted?.unmount()
  mounted = null
})

function darkly(node: React.ReactNode) {
  mounted?.unmount()
  mounted = render(
    <DibaProvider locale="fa-IR" dir="rtl" theme="dark">
      <div
        data-reduce-motion="true"
        style={{ padding: 16, background: 'var(--background)', color: 'var(--foreground)' }}
      >
        {node}
      </div>
    </DibaProvider>,
  )
  return mounted
}

/**
 * Elements carrying their own words, not just their children's.
 *
 * Searched from `body` rather than from the provider's own wrapper: every
 * overlay portals to `document.body`, so a scope inside the provider would
 * sweep the page and quietly skip the components that float above it — which
 * are the ones with paper of their own, and so the likeliest to differ in dark.
 */
function textBearing(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('body *')].filter((el) => {
    if (!el.textContent?.trim()) return false
    // Own text, so a wrapper is not blamed for its child's colour.
    const own = [...el.childNodes].some(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
    )
    if (!own) return false
    const style = getComputedStyle(el)
    if (style.visibility === 'hidden' || style.display === 'none') return false
    if (el.getBoundingClientRect().width === 0) return false
    // Screen-reader-only text is never seen, so it has no contrast to fail.
    if (el.classList.contains('sr-only')) return false
    // A disabled control is deliberately dimmed; that is its own signal.
    if (el.closest('[data-disabled], [disabled], [aria-disabled="true"]')) return false
    return true
  })
}

function unreadable(): string[] {
  return textBearing()
    .map((el) => ({ el, ratio: textContrast(el) }))
    .filter(({ ratio }) => ratio < 4.5)
    .map(
      ({ el, ratio }) =>
        `${ratio} — ${el.tagName.toLowerCase()}.${el.className.toString().split(' ')[0]} "${el.textContent?.trim().slice(0, 24)}"`,
    )
}

const buttonKinds = Object.keys(buttonVariants.variants.variant) as Array<
  keyof typeof buttonVariants.variants.variant
>
const chipKinds = Object.keys(chipVariants.variants.variant) as Array<
  keyof typeof chipVariants.variants.variant
>
const chipColors = Object.keys(chipVariants.variants.color) as Array<
  keyof typeof chipVariants.variants.color
>
const alertStatuses = ['default', 'accent', 'success', 'warning', 'danger'] as const
const cardKinds = ['default', 'secondary', 'tertiary', 'transparent'] as const

const cases: [string, React.ReactNode][] = [
  [
    'buttons',
    <div key="b" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {buttonKinds.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>,
  ],
  [
    'chips',
    <div key="c" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {chipKinds.map((variant) =>
        chipColors.map((color) => (
          <Chip key={`${variant}-${color}`} variant={variant} color={color}>
            {`${variant} ${color}`}
          </Chip>
        )),
      )}
    </div>,
  ],
  [
    'cards with everything on them',
    <div key="card" style={{ display: 'grid', gap: 8 }}>
      {cardKinds.map((variant) => (
        <Card key={variant} variant={variant}>
          <Card.Header>
            <Card.Title>عنوان کارت</Card.Title>
            <Card.Description>توضیح کوتاه</Card.Description>
          </Card.Header>
          <Card.Content>
            <Text>متن کارت</Text>
            <Text tone="muted">متن کم‌رنگ</Text>
          </Card.Content>
        </Card>
      ))}
    </div>,
  ],
  [
    'alerts',
    <div key="a" style={{ display: 'grid', gap: 8 }}>
      {alertStatuses.map((status) => (
        <Alert key={status} status={status}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>عنوان هشدار</Alert.Title>
            <Alert.Description>توضیح هشدار</Alert.Description>
          </Alert.Content>
        </Alert>
      ))}
    </div>,
  ],
  [
    'snippets',
    <div key="s" style={{ display: 'grid', gap: 8 }}>
      {snippetOptions.variant.map((variant) => (
        <Snippet key={variant} variant={variant} symbol="$">
          bun add diba
        </Snippet>
      ))}
    </div>,
  ],
  [
    'the floating surfaces, which portal out of the provider',
    <Modal.Backdrop key="o" isOpen>
      <Modal.Container>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>عنوان گفت‌وگو</Modal.Heading>
          </Modal.Header>
          <Modal.Body>متن گفت‌وگو</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary">انصراف</Button>
            <Button>تأیید</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>,
  ],
  [
    'progress and prose',
    <div key="p" style={{ display: 'grid', gap: 8 }}>
      <ProgressBar value={60}>
        <Label>بارگذاری</Label>
        <ProgressBar.Output />
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
      <Text tone="muted">متن کم‌رنگ</Text>
      <Text>متن معمولی</Text>
    </div>,
  ],
]

describe('the dark theme is readable', () => {
  it('found something to sweep', () => {
    darkly(<Text>سلام</Text>)
    expect(textBearing().length).toBeGreaterThan(0)
  })

  for (const [name, node] of cases) {
    it(name, async () => {
      darkly(node)
      await settled(120)
      expect(unreadable()).toEqual([])
    })
  }
})
