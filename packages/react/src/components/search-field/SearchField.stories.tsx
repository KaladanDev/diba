import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Label } from '../label'
import { SearchField } from './index'

// The SearchField, every option it has and what it is built into. The docs page is
// SearchField.mdx. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta: Meta = {
  title: 'Components/Forms/SearchField',
  component: SearchField,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** Fields down the page, 20 apart, as wide as a form's column. */
function Column({ children, width = 360 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

/** The parts every search field here holds: the icon, the text and the clear button. */
function Insides({ placeholder }: { placeholder?: string }) {
  return (
    <SearchField.Group>
      <SearchField.SearchIcon />
      <SearchField.Input placeholder={placeholder} />
      <SearchField.ClearButton />
    </SearchField.Group>
  )
}

const PRODUCTS = [
  { fa: 'شال ابریشم', en: 'Silk scarf', code: 'SH-104' },
  { fa: 'روسری ترمه', en: 'Termeh headscarf', code: 'TR-221' },
  { fa: 'چای لاهیجان', en: 'Lahijan tea', code: 'CH-017' },
  { fa: 'زعفران قائنات', en: 'Qaenat saffron', code: 'ZF-330' },
  { fa: 'گلیم دست‌باف', en: 'Hand-woven kilim', code: 'GL-058' },
  { fa: 'کاسهٔ فیروزه‌کوب', en: 'Turquoise-inlaid bowl', code: 'KS-412' },
]

/** The products whose name or code holds the words, in either language. */
function matching(words: string) {
  const w = words.trim().toLowerCase()
  if (!w) return PRODUCTS
  return PRODUCTS.filter(
    (p) => p.fa.includes(w) || p.en.toLowerCase().includes(w) || p.code.toLowerCase().includes(w),
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  showLabel: boolean
  placeholder: string
  variant: 'primary' | 'secondary'
  fullWidth: boolean
  isDisabled: boolean
  isReadOnly: boolean
  isInvalid: boolean
}

/** Every option on the controls. Empty words take the sample's. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    label: '',
    showLabel: false,
    placeholder: '',
    variant: 'primary',
    fullWidth: true,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Example' } },
    showLabel: {
      description: 'A Label above it; without one, an aria-label names it.',
      table: { category: 'Example' },
    },
    placeholder: { control: 'text', table: { category: 'SearchField.Input' } },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'secondary for a field on a grey surface.',
      table: { category: 'SearchField', defaultValue: { summary: 'primary' } },
    },
    fullWidth: { table: { category: 'SearchField', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'SearchField', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'SearchField', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'SearchField', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    const [value, setValue] = useState(t('شال', 'scarf'))
    const [sent, setSent] = useState<string | null>(null)
    const label = args.label || t('جستجوی محصول', 'Search products')
    return (
      <Stage width={480} surface={args.variant === 'secondary'}>
        <Column>
          <SearchField
            value={value}
            onChange={setValue}
            onSubmit={setSent}
            variant={args.variant}
            fullWidth={args.fullWidth}
            isDisabled={args.isDisabled}
            isReadOnly={args.isReadOnly}
            isInvalid={args.isInvalid}
            aria-label={args.showLabel ? undefined : label}
          >
            {args.showLabel ? <Label>{label}</Label> : null}
            <Insides placeholder={args.placeholder || t('نام یا کد محصول', 'Name or code')} />
            <FieldError>{t('دست‌کم دو حرف بنویسید.', 'Write at least two letters.')}</FieldError>
          </SearchField>
          <Value label="value" value={value} />
          <Value label="onSubmit" value={sent} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Named by an aria-label where the page says what it searches; by a Label in a form. */
export const WithLabel: StoryObj = {
  name: 'With and without a label',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={280}>
        <Example title={t('بدون برچسب', 'Without a label')} note="aria-label">
          <SearchField aria-label={t('جستجوی سفارش', 'Search orders')} fullWidth>
            <Insides placeholder={t('شماره یا نام خریدار', 'Number or buyer')} />
          </SearchField>
        </Example>
        <Example title={t('با برچسب و راهنما', 'With a label and help')}>
          <SearchField fullWidth>
            <Label>{t('جستجوی مشتری', 'Find a customer')}</Label>
            <Insides placeholder={t('نام، تلفن یا ایمیل', 'Name, phone or email')} />
            <Description>{t('دست‌کم سه حرف.', 'Three letters at least.')}</Description>
          </SearchField>
        </Example>
      </Grid>
    )
  },
}

/** Enter sends what is written; Escape and the clear button empty it. */
export const SubmitAndClear: StoryObj = {
  name: 'Enter and clear',
  render: function Render() {
    const t = useT()
    const [sent, setSent] = useState<string | null>(null)
    const [cleared, setCleared] = useState(0)
    return (
      <Column>
        <SearchField
          aria-label={t('جستجوی محصول', 'Search products')}
          defaultValue={t('زعفران', 'saffron')}
          onSubmit={setSent}
          onClear={() => setCleared((n) => n + 1)}
          fullWidth
        >
          <Insides placeholder={t('نام یا کد محصول', 'Name or code')} />
        </SearchField>
        <Value label="onSubmit" value={sent} />
        <Value label="onClear" value={cleared} />
      </Column>
    )
  },
}

/** Empty, written in, disabled, read-only, wrong, and on a grey surface. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    const name = t('جستجوی محصول', 'Search products')
    const placeholder = t('نام یا کد محصول', 'Name or code')
    return (
      <Grid min={260}>
        <Example title={t('خالی', 'Empty')} note={t('دکمهٔ پاک کردن پنهان است', 'No clear button')}>
          <SearchField aria-label={name} fullWidth>
            <Insides placeholder={placeholder} />
          </SearchField>
        </Example>
        <Example title={t('نوشته‌شده', 'Written in')}>
          <SearchField aria-label={name} defaultValue={t('ترمه', 'termeh')} fullWidth>
            <Insides placeholder={placeholder} />
          </SearchField>
        </Example>
        <Example title={t('غیرفعال', 'Disabled')}>
          <SearchField aria-label={name} isDisabled defaultValue={t('ترمه', 'termeh')} fullWidth>
            <Insides placeholder={placeholder} />
          </SearchField>
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <SearchField aria-label={name} isReadOnly defaultValue={t('ترمه', 'termeh')} fullWidth>
            <Insides placeholder={placeholder} />
          </SearchField>
        </Example>
        <Example title={t('نادرست', 'Invalid')}>
          <SearchField aria-label={name} isInvalid defaultValue="#" fullWidth>
            <Insides placeholder={placeholder} />
            <FieldError>{t('دست‌کم دو حرف بنویسید.', 'Write at least two letters.')}</FieldError>
          </SearchField>
        </Example>
        <Example title={t('روی زمینهٔ خاکستری', 'On a grey surface')} note='variant="secondary"'>
          <Stage width="100%" surface>
            <SearchField aria-label={name} variant="secondary" fullWidth>
              <Insides placeholder={placeholder} />
            </SearchField>
          </Stage>
        </Example>
      </Grid>
    )
  },
}

/** In a row beside a button: its own width, or what the button leaves. */
export const Width: StoryObj = {
  name: 'Width',
  render: function Render() {
    const t = useT()
    const row = { display: 'flex', gap: 8, alignItems: 'center' } as const
    return (
      <Column width={480}>
        <Example title={t('اندازهٔ خودش', 'Its own width')}>
          <div style={row}>
            <SearchField aria-label={t('جستجو', 'Search')}>
              <Insides placeholder={t('جستجو', 'Search')} />
            </SearchField>
            <Button variant="secondary">{t('فیلتر', 'Filter')}</Button>
          </div>
        </Example>
        <Example title={t('آنچه دکمه می‌گذارد', 'What the button leaves')} note="fullWidth">
          <div style={row}>
            <SearchField aria-label={t('جستجو', 'Search')} fullWidth>
              <Insides placeholder={t('جستجو', 'Search')} />
            </SearchField>
            <Button variant="secondary">{t('فیلتر', 'Filter')}</Button>
          </div>
        </Example>
      </Column>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** Above a list of products, narrowing it as the reader types: by name or by code. */
export const FilterAList: StoryObj = {
  name: 'Example: narrowing a list',
  render: function Render() {
    const t = useT()
    const [words, setWords] = useState('')
    const found = matching(words)
    return (
      <Stage width={480} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <SearchField
              aria-label={t('جستجوی محصول', 'Search products')}
              value={words}
              onChange={setWords}
              fullWidth
            >
              <Insides placeholder={t('نام یا کد محصول', 'Name or code')} />
            </SearchField>
            <Button size="md" variant="primary">
              {t('افزودن محصول', 'Add a product')}
            </Button>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {found.map((p) => (
              <li
                key={p.code}
                className="text-foreground"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 4px',
                  borderBottom: '1px solid var(--separator)',
                  fontSize: 14,
                }}
              >
                <span>{t(p.fa, p.en)}</span>
                <span className="text-muted" dir="ltr">
                  {p.code}
                </span>
              </li>
            ))}
          </ul>
          {found.length === 0 ? (
            <p className="text-muted" style={{ margin: 0, fontSize: 14 }}>
              {t('محصولی با این نام یا کد نیست.', 'No product has that name or code.')}
            </p>
          ) : null}
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <Column width={320}>
      <SearchField aria-label={t('جستجوی محصول', 'Search products')} fullWidth>
        <Insides placeholder={t('نام یا کد محصول', 'Name or code')} />
      </SearchField>
      <SearchField defaultValue={t('ترمه', 'termeh')} fullWidth>
        <Label>{t('جستجوی محصول', 'Search products')}</Label>
        <Insides />
      </SearchField>
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

/** A Persian page and an English one: the icon at the start, the clear button at the end. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Sample />
    </Directions>
  ),
}

/** On a phone's width, where it is 40 tall. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Sample />
    </Device>
  ),
}

/** The same field as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'SearchField',
      props: {
        label: t('جستجوی محصول', 'Search products'),
        placeholder: t('نام یا کد محصول', 'Name or code'),
        defaultValue: t('ترمه', 'termeh'),
      },
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
