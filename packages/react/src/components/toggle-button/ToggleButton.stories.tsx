import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bold, Eye, EyeOff, Heart, Pin } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Tooltip } from '../tooltip'
import { ToggleButton } from './index'

// The ToggleButton, every option it has and what it is built into. The docs page is
// ToggleButton.mdx. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta: Meta = {
  title: 'Components/Buttons/ToggleButton',
  component: ToggleButton,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** Toggles in a row, 8 apart, wrapping on a narrow page. */
function Row({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {children}
    </div>
  )
}

/** A toggle with only its icon, its name in a tooltip as well as to a screen reader. */
function IconToggle({
  label,
  children,
  ...props
}: Omit<React.ComponentProps<typeof ToggleButton>, 'children'> & {
  label: string
  children: ReactNode
}) {
  return (
    <Tooltip delay={500}>
      <ToggleButton isIconOnly aria-label={label} {...props}>
        {children}
      </ToggleButton>
      <Tooltip.Content placement="top" showArrow>
        <Tooltip.Arrow />
        {label}
      </Tooltip.Content>
    </Tooltip>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  children: string
  variant: 'default' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  isDisabled: boolean
}

/** Every option on the controls. Empty words take the sample's. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { children: '', variant: 'default', size: 'md', isDisabled: false },
  argTypes: {
    children: { control: 'text', table: { category: 'Example' } },
    variant: {
      control: 'inline-radio',
      options: ['default', 'ghost'],
      description: 'default on the secondary fill; ghost with none until it is chosen or hovered.',
      table: { category: 'ToggleButton', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: '32, 36 or 40 tall.',
      table: { category: 'ToggleButton', defaultValue: { summary: 'md' } },
    },
    isDisabled: { table: { category: 'ToggleButton', defaultValue: { summary: 'false' } } },
  },
  render: function Render(args) {
    const t = useT()
    const [pinned, setPinned] = useState(true)
    return (
      <Stage width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Row>
            <ToggleButton
              isSelected={pinned}
              onChange={setPinned}
              variant={args.variant}
              size={args.size}
              isDisabled={args.isDisabled}
            >
              <Pin />
              {args.children || t('سنجاق به بالای فهرست', 'Pin to the top')}
            </ToggleButton>
          </Row>
          <Value label="isSelected" value={pinned} />
        </div>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Off and on, in each variant; disabled. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={240}>
        <Example title="default" note={t('خاموش، روشن، غیرفعال', 'Off, on, disabled')}>
          <Row>
            <ToggleButton>{t('ویژه', 'Featured')}</ToggleButton>
            <ToggleButton defaultSelected>{t('ویژه', 'Featured')}</ToggleButton>
            <ToggleButton isDisabled>{t('ویژه', 'Featured')}</ToggleButton>
          </Row>
        </Example>
        <Example title="ghost" note={t('خاموش، روشن، غیرفعال', 'Off, on, disabled')}>
          <Row>
            <ToggleButton variant="ghost">{t('ویژه', 'Featured')}</ToggleButton>
            <ToggleButton variant="ghost" defaultSelected>
              {t('ویژه', 'Featured')}
            </ToggleButton>
            <ToggleButton variant="ghost" isDisabled>
              {t('ویژه', 'Featured')}
            </ToggleButton>
          </Row>
        </Example>
      </Grid>
    )
  },
}

/** Small, medium and large. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Row>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ToggleButton key={size} size={size} defaultSelected={size === 'md'}>
            <Heart />
            {t('پسندیده', 'Favourite')}
          </ToggleButton>
        ))}
      </Row>
    )
  },
}

/** With only its icon, named by an aria-label and a tooltip; or an icon that changes with it. */
export const IconOnly: StoryObj = {
  name: 'Icon only',
  render: function Render() {
    const t = useT()
    const [shown, setShown] = useState(true)
    return (
      <Example title={t('فقط نماد', 'Icons only')} note="aria-label + Tooltip">
        <Row>
          <IconToggle label={t('پررنگ', 'Bold')} defaultSelected>
            <Bold />
          </IconToggle>
          <IconToggle label={t('پسندیده', 'Favourite')}>
            <Heart />
          </IconToggle>
          <IconToggle
            label={t('نمایش در فروشگاه', 'Shown in the shop')}
            isSelected={shown}
            onChange={setShown}
          >
            {shown ? <Eye /> : <EyeOff />}
          </IconToggle>
        </Row>
      </Example>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A product's flags on its page: each a toggle, saved as it is pressed. */
export const ProductFlags: StoryObj = {
  name: 'Example: a product’s flags',
  render: function Render() {
    const t = useT()
    const [flags, setFlags] = useState({ featured: true, pinned: false })
    return (
      <Stage width={480} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
          <span className="text-foreground" style={{ fontSize: 16, fontWeight: 600 }}>
            {t('شال ابریشم', 'Silk scarf')}
          </span>
          <Row>
            <ToggleButton
              size="sm"
              isSelected={flags.featured}
              onChange={(on) => setFlags((f) => ({ ...f, featured: on }))}
            >
              <Heart />
              {t('ویژه', 'Featured')}
            </ToggleButton>
            <ToggleButton
              size="sm"
              isSelected={flags.pinned}
              onChange={(on) => setFlags((f) => ({ ...f, pinned: on }))}
            >
              <Pin />
              {t('سنجاق‌شده', 'Pinned')}
            </ToggleButton>
          </Row>
          <Value label="flags" value={flags} />
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <Row>
      <ToggleButton defaultSelected>
        <Heart />
        {t('ویژه', 'Featured')}
      </ToggleButton>
      <ToggleButton>
        <Pin />
        {t('سنجاق', 'Pin')}
      </ToggleButton>
      <ToggleButton variant="ghost">{t('پیش‌نویس', 'Draft')}</ToggleButton>
    </Row>
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

/** A Persian page and an English one: the icon before the words. */
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
