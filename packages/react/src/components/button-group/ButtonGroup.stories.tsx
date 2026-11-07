import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Dropdown } from '../dropdown'
import { Label } from '../label'
import { ButtonGroup } from './index'

// The ButtonGroup, every option it has and what it is built into. The docs page is
// ButtonGroup.mdx. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one. Typed as a plain Meta, as Button's is.
const meta: Meta = {
  title: 'Components/Buttons/ButtonGroup',
  component: ButtonGroup,
  parameters: { layout: 'fullscreen' },
}

export default meta

type Variant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger' | 'danger-soft'
type Size = 'sm' | 'md' | 'lg'
const SIZES: Size[] = ['sm', 'md', 'lg']

/** Whether the story is drawn in Persian. */
function usePersian() {
  const t = useT()
  return t('fa', 'en') === 'fa'
}

/** The arrows back and on, by the page's direction: on a Persian page back is to the right. */
function useArrows() {
  const persian = usePersian()
  return persian
    ? { back: <ChevronRight aria-hidden />, on: <ChevronLeft aria-hidden /> }
    : { back: <ChevronLeft aria-hidden />, on: <ChevronRight aria-hidden /> }
}

/** Groups down the page, 16 apart. */
function Column({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
}

/** A row's actions, the words of each in the reader's language. */
function useRowActions() {
  const t = useT()
  return [t('ویرایش', 'Edit'), t('رونوشت', 'Duplicate'), t('حذف', 'Delete')]
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  buttons: number
  orientation: 'horizontal' | 'vertical'
  size: Size
  variant: Variant
  separators: boolean
  fullWidth: boolean
  isDisabled: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    buttons: 3,
    orientation: 'horizontal',
    size: 'md',
    variant: 'secondary',
    separators: true,
    fullWidth: false,
    isDisabled: false,
  },
  argTypes: {
    buttons: {
      control: { type: 'range', min: 1, max: 5, step: 1 },
      description: 'How many buttons it joins.',
      table: { category: 'Example' },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      table: { category: 'ButtonGroup', defaultValue: { summary: 'horizontal' } },
    },
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: 'Its buttons’ size, where a button sets none.',
      table: { category: 'ButtonGroup' },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'tertiary', 'outline', 'ghost', 'danger', 'danger-soft'],
      description: 'Its buttons’ variant, where a button sets none.',
      table: { category: 'ButtonGroup' },
    },
    separators: {
      description: 'ButtonGroup.Separator at the start of each button after the first.',
      table: { category: 'Example' },
    },
    fullWidth: {
      description: 'As wide as its container, the buttons sharing it.',
      table: { category: 'ButtonGroup', defaultValue: { summary: 'false' } },
    },
    isDisabled: {
      description: 'Every button in it.',
      table: { category: 'ButtonGroup', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render({
    buttons,
    orientation,
    size,
    variant,
    separators,
    fullWidth,
    isDisabled,
  }) {
    const t = useT()
    const words = [
      t('یک', 'One'),
      t('دو', 'Two'),
      t('سه', 'Three'),
      t('چهار', 'Four'),
      t('پنج', 'Five'),
    ].slice(0, buttons)
    return (
      <Stage width={fullWidth ? 480 : 640}>
        <ButtonGroup
          aria-label={t('نمونه', 'Example')}
          orientation={orientation}
          size={size}
          variant={variant}
          fullWidth={fullWidth}
          isDisabled={isDisabled}
        >
          {words.map((word, i) => (
            <Button key={word}>
              {separators && i > 0 ? <ButtonGroup.Separator /> : null}
              {word}
            </Button>
          ))}
        </ButtonGroup>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Buttons joined into one: their inner corners squared, the ends round. */
export const Joined: StoryObj = {
  render: function Render() {
    const t = useT()
    const actions = useRowActions()
    const arrows = useArrows()
    return (
      <Grid min={260}>
        <Example title={t('قبلی و بعدی', 'Previous and next')}>
          <ButtonGroup aria-label={t('صفحه‌ها', 'Pages')} variant="secondary">
            <Button>
              {arrows.back}
              {t('قبلی', 'Previous')}
            </Button>
            <Button>
              <ButtonGroup.Separator />
              {t('بعدی', 'Next')}
              {arrows.on}
            </Button>
          </ButtonGroup>
        </Example>
        <Example title={t('کارهای یک ردیف', "A row's actions")}>
          <ButtonGroup aria-label={t('کارهای محصول', "The product's actions")} variant="tertiary">
            {actions.map((action, i) => (
              <Button key={action}>
                {i > 0 ? <ButtonGroup.Separator /> : null}
                {action}
              </Button>
            ))}
          </ButtonGroup>
        </Example>
      </Grid>
    )
  },
}

/** A separator inside each button after the first, at half its height; or none. */
export const Separators: StoryObj = {
  render: function Render() {
    const t = useT()
    const actions = useRowActions()
    return (
      <Grid min={260}>
        {[true, false].map((separated) => (
          <Example
            key={String(separated)}
            title={separated ? t('با جداکننده', 'With separators') : t('بی جداکننده', 'Without')}
          >
            <ButtonGroup
              aria-label={t('کارهای محصول', "The product's actions")}
              variant="secondary"
            >
              {actions.map((action, i) => (
                <Button key={action}>
                  {separated && i > 0 ? <ButtonGroup.Separator /> : null}
                  {action}
                </Button>
              ))}
            </ButtonGroup>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** The variants a group is drawn in. */
export const Variants: StoryObj = {
  render: function Render() {
    const t = useT()
    const actions = useRowActions()
    return (
      <Column>
        {(['primary', 'secondary', 'tertiary', 'outline', 'ghost'] as const).map((variant) => (
          <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <code className="text-muted" style={{ width: 72, fontSize: 12 }}>
              {variant}
            </code>
            <ButtonGroup aria-label={t('کارهای محصول', "The product's actions")} variant={variant}>
              {actions.map((action, i) => (
                <Button key={action}>
                  {i > 0 ? <ButtonGroup.Separator /> : null}
                  {action}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        ))}
      </Column>
    )
  },
}

/** Three sizes, given to every button. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    const arrows = useArrows()
    return (
      <Column>
        {SIZES.map((size) => (
          <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <code className="text-muted" style={{ width: 32, fontSize: 12 }}>
              {size}
            </code>
            <ButtonGroup aria-label={t('صفحه‌ها', 'Pages')} size={size} variant="secondary">
              <Button isIconOnly aria-label={t('قبلی', 'Previous')}>
                {arrows.back}
              </Button>
              <Button isIconOnly aria-label={t('بعدی', 'Next')}>
                <ButtonGroup.Separator />
                {arrows.on}
              </Button>
            </ButtonGroup>
          </div>
        ))}
      </Column>
    )
  },
}

/** Down the page instead of across it. */
export const Vertical: StoryObj = {
  render: function Render() {
    const t = useT()
    const actions = useRowActions()
    return (
      <ButtonGroup
        aria-label={t('کارهای محصول', "The product's actions")}
        orientation="vertical"
        variant="secondary"
      >
        {actions.map((action, i) => (
          <Button key={action}>
            {i > 0 ? <ButtonGroup.Separator /> : null}
            {action}
          </Button>
        ))}
      </ButtonGroup>
    )
  },
}

/** The group's size, variant and disabling fill in what each button left out; a button's own wins. */
export const GroupLook: StoryObj = {
  name: "The group's look",
  render: function Render() {
    const t = useT()
    const actions = useRowActions()
    return (
      <Grid min={260}>
        <Example title={t('یکی با رنگ خودش', 'One with its own')} note='variant="danger-soft"'>
          <ButtonGroup aria-label={t('کارهای محصول', "The product's actions")} variant="secondary">
            <Button>
              <Pencil aria-hidden />
              {t('ویرایش', 'Edit')}
            </Button>
            <Button>
              <ButtonGroup.Separator />
              <Copy aria-hidden />
              {t('رونوشت', 'Duplicate')}
            </Button>
            <Button variant="danger-soft">
              <Trash2 aria-hidden />
              {t('حذف', 'Delete')}
            </Button>
          </ButtonGroup>
        </Example>
        <Example title={t('همه غیرفعال', 'All disabled')} note="isDisabled">
          <ButtonGroup
            aria-label={t('کارهای محصول', "The product's actions")}
            variant="secondary"
            isDisabled
          >
            {actions.map((action, i) => (
              <Button key={action}>
                {i > 0 ? <ButtonGroup.Separator /> : null}
                {action}
              </Button>
            ))}
          </ButtonGroup>
        </Example>
      </Grid>
    )
  },
}

/** As wide as its container, its buttons sharing the width. */
export const FullWidth: StoryObj = {
  name: 'Full width',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <ButtonGroup aria-label={t('بازه', 'Range')} variant="secondary" fullWidth>
          <Button>{t('امروز', 'Today')}</Button>
          <Button>
            <ButtonGroup.Separator />
            {t('این هفته', 'This week')}
          </Button>
          <Button>
            <ButtonGroup.Separator />
            {t('این ماه', 'This month')}
          </Button>
        </ButtonGroup>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A table's pager: where the reader is, and back and on. */
export const TablePager: StoryObj = {
  name: 'Example: a table’s pager',
  render: function Render() {
    const t = useT()
    const arrows = useArrows()
    const [page, setPage] = useState(1)
    const pages = 7
    return (
      <Stage width={640} surface>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: 8,
          }}
        >
          <span className="text-muted" style={{ fontSize: 13 }}>
            {t(
              `صفحهٔ ${page.toLocaleString('fa-IR')} از ${pages.toLocaleString('fa-IR')}`,
              `Page ${page} of ${pages}`,
            )}
          </span>
          <ButtonGroup aria-label={t('صفحه‌ها', 'Pages')} variant="secondary" size="sm">
            <Button isDisabled={page === 1} onPress={() => setPage(page - 1)}>
              {arrows.back}
              {t('قبلی', 'Previous')}
            </Button>
            <Button isDisabled={page === pages} onPress={() => setPage(page + 1)}>
              <ButtonGroup.Separator />
              {t('بعدی', 'Next')}
              {arrows.on}
            </Button>
          </ButtonGroup>
        </div>
      </Stage>
    )
  },
}

/** A split button: the main action, and a menu of the others beside it. */
export const SplitButton: StoryObj = {
  name: 'Example: a split button',
  render: function Render() {
    const t = useT()
    const [done, setDone] = useState<string | null>(null)
    return (
      <Stage width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ButtonGroup aria-label={t('ذخیره', 'Save')} variant="primary">
            <Button onPress={() => setDone('publish')}>
              {t('ذخیره و انتشار', 'Save and publish')}
            </Button>
            <Dropdown>
              <Button
                variant="primary"
                isIconOnly
                aria-label={t('راه‌های دیگر ذخیره', 'Other ways to save')}
              >
                <ButtonGroup.Separator />
                <ChevronDown aria-hidden />
              </Button>
              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu onAction={(key) => setDone(String(key))}>
                  <Dropdown.Item id="draft" textValue={t('ذخیرهٔ پیش‌نویس', 'Save as a draft')}>
                    <Label>{t('ذخیرهٔ پیش‌نویس', 'Save as a draft')}</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="schedule" textValue={t('زمان‌بندی انتشار', 'Schedule it')}>
                    <Label>{t('زمان‌بندی انتشار', 'Schedule it')}</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </ButtonGroup>
          <Value label={t('انجام شد', 'Done')} value={done} />
        </div>
      </Stage>
    )
  },
}

/** A picture viewer's zoom: icons alone, each named. */
export const Zoom: StoryObj = {
  name: 'Example: zoom',
  render: function Render() {
    const t = useT()
    const [zoom, setZoom] = useState(100)
    return (
      <Stage width={420}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ButtonGroup aria-label={t('بزرگ‌نمایی', 'Zoom')} variant="tertiary" size="sm">
            <Button
              isIconOnly
              aria-label={t('کوچک‌تر', 'Zoom out')}
              isDisabled={zoom <= 50}
              onPress={() => setZoom(zoom - 25)}
            >
              <ZoomOut aria-hidden />
            </Button>
            <Button onPress={() => setZoom(100)}>
              <ButtonGroup.Separator />
              {t(`${zoom.toLocaleString('fa-IR')}٪`, `${zoom}%`)}
            </Button>
            <Button
              isIconOnly
              aria-label={t('بزرگ‌تر', 'Zoom in')}
              isDisabled={zoom >= 200}
              onPress={() => setZoom(zoom + 25)}
            >
              <ButtonGroup.Separator />
              <ZoomIn aria-hidden />
            </Button>
          </ButtonGroup>
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  const arrows = useArrows()
  const actions = useRowActions()
  return (
    <Column>
      <ButtonGroup aria-label={t('صفحه‌ها', 'Pages')} variant="secondary">
        <Button>
          {arrows.back}
          {t('قبلی', 'Previous')}
        </Button>
        <Button>
          <ButtonGroup.Separator />
          {t('بعدی', 'Next')}
          {arrows.on}
        </Button>
      </ButtonGroup>
      <ButtonGroup
        aria-label={t('کارهای محصول', "The product's actions")}
        variant="tertiary"
        size="sm"
      >
        {actions.map((action, i) => (
          <Button key={action}>
            {i > 0 ? <ButtonGroup.Separator /> : null}
            {action}
          </Button>
        ))}
      </ButtonGroup>
      <ButtonGroup aria-label={t('ذخیره', 'Save')} variant="primary">
        <Button>{t('ذخیره', 'Save')}</Button>
        <Button isIconOnly aria-label={t('راه‌های دیگر ذخیره', 'Other ways to save')}>
          <ButtonGroup.Separator />
          <ChevronDown aria-hidden />
        </Button>
      </ButtonGroup>
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

/** A Persian page and an English one: the first button's round end is at the reading side. */
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

/** The same group as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    // A tree names an arrow as for left-to-right: the block turns a mirrored one on a Persian page.
    const tree = {
      type: 'ButtonGroup',
      props: { variant: 'secondary', size: 'md' },
      children: [
        {
          type: 'Button',
          props: { icon: 'chevron-left' },
          children: t('قبلی', 'Previous'),
          actions: { onPress: { do: 'call', action: 'orders.previous' } },
        },
        {
          type: 'Button',
          props: { icon: 'chevron-right', iconPlacement: 'end' },
          children: t('بعدی', 'Next'),
          actions: { onPress: { do: 'call', action: 'orders.next' } },
        },
      ],
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
