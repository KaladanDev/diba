import type { Meta, StoryObj } from '@storybook/react-vite'
import { Shirt, ShoppingBag, Sparkles } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Key } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Form } from '../form'
import { Header } from '../header'
import { Label } from '../label'
import { ListBox } from '../list-box'
import { Select } from './index'

// The Select, every option it has and what it is built into. The docs page is Select.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta: Meta = {
  title: 'Components/Pickers/Select',
  component: Select,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** Fields down the page, 20 apart, as wide as a form's column. */
function Column({ children, width = 320 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

const CATEGORIES = [
  { id: 'scarf', fa: 'شال و روسری', en: 'Scarves' },
  { id: 'bag', fa: 'کیف', en: 'Bags' },
  { id: 'shoe', fa: 'کفش', en: 'Shoes' },
  { id: 'tea', fa: 'چای و دمنوش', en: 'Tea' },
  { id: 'craft', fa: 'صنایع دستی', en: 'Crafts' },
]

/** The options of a product's category, in the page's language. */
function Categories() {
  const t = useT()
  return (
    <ListBox>
      {CATEGORIES.map((c) => (
        <ListBox.Item key={c.id} id={c.id} textValue={t(c.fa, c.en)}>
          {t(c.fa, c.en)}
        </ListBox.Item>
      ))}
    </ListBox>
  )
}

/** A select's parts: its label, the trigger with the value and the chevron, and the menu. */
function Picker({
  label,
  help,
  error,
  children,
  clearable,
  ...props
}: Omit<React.ComponentProps<typeof Select>, 'children'> & {
  label?: ReactNode
  help?: ReactNode
  error?: ReactNode | true
  clearable?: boolean
  children?: ReactNode
}) {
  return (
    <Select {...props}>
      {label ? <Label>{label}</Label> : null}
      <Select.Trigger>
        <Select.Value />
        {clearable ? <Select.ClearButton /> : null}
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>{children ?? <Categories />}</Select.Popover>
      {help ? <Description>{help}</Description> : null}
      {error === true ? <FieldError /> : error ? <FieldError>{error}</FieldError> : null}
    </Select>
  )
}

const keys = (value: unknown) =>
  Array.isArray(value) ? value.map(String) : value == null ? null : String(value)

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  placeholder: string
  multiple: boolean
  variant: 'primary' | 'secondary'
  clearable: boolean
  isRequired: boolean
  isDisabled: boolean
  isInvalid: boolean
}

/** Every option on the controls. Empty words take the sample's. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    label: '',
    placeholder: '',
    multiple: false,
    variant: 'primary',
    clearable: false,
    isRequired: false,
    isDisabled: false,
    isInvalid: false,
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Example' } },
    placeholder: {
      control: 'text',
      description: 'Shown while nothing is chosen.',
      table: { category: 'Select' },
    },
    multiple: {
      description: 'selectionMode="multiple": several chosen, the menu staying open.',
      table: { category: 'Select' },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'secondary on a grey surface.',
      table: { category: 'Select', defaultValue: { summary: 'primary' } },
    },
    clearable: {
      description: 'A Select.ClearButton in the trigger; Backspace or Delete clears too.',
      table: { category: 'Example' },
    },
    isRequired: { table: { category: 'Select', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'Select', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'Select', defaultValue: { summary: 'false' } },
    },
  },
  parameters: { docs: { story: { inline: false, height: '420px' } } },
  render: function Render(args) {
    const t = useT()
    const [single, setSingle] = useState<Key | null>('bag')
    const [several, setSeveral] = useState<Key[]>(['scarf', 'bag'])
    return (
      <Stage width={480} surface={args.variant === 'secondary'}>
        <Column>
          <Picker
            key={args.multiple ? 'several' : 'one'}
            {...(args.multiple
              ? {
                  selectionMode: 'multiple' as const,
                  value: several,
                  onChange: (v: unknown) => setSeveral(v as Key[]),
                }
              : { value: single, onChange: (v: unknown) => setSingle(v as Key | null) })}
            label={args.label || t('دسته', 'Category')}
            placeholder={args.placeholder || t('یک دسته برگزینید', 'Choose a category')}
            variant={args.variant}
            clearable={args.clearable}
            isRequired={args.isRequired}
            isDisabled={args.isDisabled}
            isInvalid={args.isInvalid}
            help={t('محصول در این دسته دیده می‌شود.', 'The product is shown in it.')}
            error={t('این دسته پنهان است.', 'This category is hidden.')}
            fullWidth
          />
          <Value label="value" value={args.multiple ? keys(several) : keys(single)} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Open: the menu 8 under the trigger, as wide as it, the chosen option on the neutral fill. */
export const Open: StoryObj = {
  parameters: { docs: { story: { inline: false, height: '400px' } } },
  render: function Render() {
    const t = useT()
    return (
      <Stage width={360}>
        <Picker label={t('دسته', 'Category')} defaultValue="bag" defaultOpen fullWidth />
      </Stage>
    )
  },
}

/** Nothing chosen yet, one chosen, and several. */
export const Values: StoryObj = {
  name: 'Placeholder, one and several',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Picker
          label={t('دسته', 'Category')}
          placeholder={t('یک دسته برگزینید', 'Choose a category')}
          fullWidth
        />
        <Picker label={t('دسته', 'Category')} defaultValue="tea" fullWidth />
        <Picker
          label={t('دسته‌ها', 'Categories')}
          selectionMode="multiple"
          defaultValue={['scarf', 'bag', 'craft']}
          fullWidth
        />
      </Column>
    )
  },
}

/** Titled groups of options, an icon before each, and a second line under it. */
export const Sections: StoryObj = {
  name: 'Sections, icons and descriptions',
  parameters: { docs: { story: { inline: false, height: '520px' } } },
  render: function Render() {
    const t = useT()
    return (
      <Stage width={360}>
        <Picker
          label={t('نوع محصول', 'Product type')}
          defaultValue="physical"
          defaultOpen
          fullWidth
        >
          <ListBox>
            <ListBox.Section>
              <Header>{t('فروش', 'Selling')}</Header>
              <ListBox.Item id="physical" textValue={t('کالای فیزیکی', 'Physical goods')}>
                <ShoppingBag />
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <Label>{t('کالای فیزیکی', 'Physical goods')}</Label>
                  <Description>{t('با ارسال', 'Shipped')}</Description>
                </span>
              </ListBox.Item>
              <ListBox.Item id="digital" textValue={t('فایل دیجیتال', 'Digital file')}>
                <Sparkles />
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <Label>{t('فایل دیجیتال', 'Digital file')}</Label>
                  <Description>{t('دانلود پس از پرداخت', 'Downloaded once paid')}</Description>
                </span>
              </ListBox.Item>
            </ListBox.Section>
            <ListBox.Section>
              <Header>{t('سفارشی', 'Made to order')}</Header>
              <ListBox.Item id="tailored" textValue={t('دوخت سفارشی', 'Tailored')}>
                <Shirt />
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <Label>{t('دوخت سفارشی', 'Tailored')}</Label>
                  <Description>
                    {t('اندازه را خریدار می‌دهد', 'The buyer gives the size')}
                  </Description>
                </span>
              </ListBox.Item>
            </ListBox.Section>
          </ListBox>
        </Picker>
      </Stage>
    )
  },
}

/** A clear button in the trigger, while something is chosen. */
export const Clearable: StoryObj = {
  render: function Render() {
    const t = useT()
    const [value, setValue] = useState<Key | null>('shoe')
    return (
      <Column>
        <Picker
          label={t('دسته', 'Category')}
          placeholder={t('همهٔ دسته‌ها', 'All categories')}
          value={value}
          onChange={(v) => setValue(v as Key | null)}
          clearable
          fullWidth
        />
        <Value label="value" value={keys(value)} />
      </Column>
    )
  },
}

/** Disabled, an option disabled, invalid, and on a grey surface. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        <Example title={t('غیرفعال', 'Disabled')}>
          <Picker label={t('دسته', 'Category')} defaultValue="bag" isDisabled fullWidth />
        </Example>
        <Example title={t('نادرست', 'Invalid')}>
          <Picker
            label={t('دسته', 'Category')}
            defaultValue="shoe"
            isInvalid
            error={t('این دسته پنهان است.', 'This category is hidden.')}
            fullWidth
          />
        </Example>
        <Example title={t('یک گزینه غیرفعال', 'One option disabled')}>
          <Picker label={t('دسته', 'Category')} disabledKeys={['tea']} fullWidth />
        </Example>
        <Example title={t('روی زمینهٔ خاکستری', 'On a grey surface')} note='variant="secondary"'>
          <Stage width="100%" surface>
            <Picker
              label={t('دسته', 'Category')}
              variant="secondary"
              defaultValue="craft"
              fullWidth
            />
          </Stage>
        </Example>
      </Grid>
    )
  },
}

/** In a form: the chosen option's id under its name; a required one left empty stops the form. */
export const InAForm: StoryObj = {
  name: 'In a form',
  render: function Render() {
    const t = useT()
    const [sent, setSent] = useState<Record<string, FormDataEntryValue> | null>(null)
    return (
      <Stage width={420} surface>
        <Form
          onSubmit={(e) => {
            e.preventDefault()
            setSent(Object.fromEntries(new FormData(e.currentTarget)))
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}
        >
          <Picker
            name="category"
            isRequired
            label={t('دسته', 'Category')}
            placeholder={t('یک دسته برگزینید', 'Choose a category')}
            error
            fullWidth
          />
          <div>
            <Button type="submit" variant="primary">
              {t('ذخیره', 'Save')}
            </Button>
          </div>
          <Value label={t('فرستاده شد', 'Sent')} value={sent} />
        </Form>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** An order list's filters: status and delivery, side by side. */
export const OrderFilters: StoryObj = {
  name: 'Example: order filters',
  render: function Render() {
    const t = useT()
    const [status, setStatus] = useState<Key | null>('paid')
    const [ship, setShip] = useState<Key | null>(null)
    return (
      <Stage width={560} surface>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 8 }}>
          <div style={{ flex: '1 1 200px' }}>
            <Picker
              aria-label={t('وضعیت', 'Status')}
              value={status}
              onChange={(v) => setStatus(v as Key | null)}
              fullWidth
            >
              <ListBox>
                <ListBox.Item id="paid">{t('پرداخت‌شده', 'Paid')}</ListBox.Item>
                <ListBox.Item id="unpaid">{t('پرداخت‌نشده', 'Unpaid')}</ListBox.Item>
                <ListBox.Item id="refunded">{t('بازپرداخت', 'Refunded')}</ListBox.Item>
              </ListBox>
            </Picker>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <Picker
              aria-label={t('روش ارسال', 'Delivery method')}
              placeholder={t('همهٔ روش‌های ارسال', 'Every delivery method')}
              value={ship}
              onChange={(v) => setShip(v as Key | null)}
              clearable
              fullWidth
            >
              <ListBox>
                <ListBox.Item id="post">{t('پست پیشتاز', 'Express post')}</ListBox.Item>
                <ListBox.Item id="tipax">{t('تیپاکس', 'Tipax')}</ListBox.Item>
                <ListBox.Item id="pickup">{t('تحویل حضوری', 'Collect in person')}</ListBox.Item>
              </ListBox>
            </Picker>
          </div>
          <Value label="filters" value={{ status: keys(status), ship: keys(ship) }} />
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <Column width={300}>
      <Picker
        label={t('دسته', 'Category')}
        defaultValue="scarf"
        help={t('برای خریدار.', 'For the buyer.')}
        fullWidth
      />
      <Picker
        label={t('دسته', 'Category')}
        placeholder={t('یک دسته برگزینید', 'Choose a category')}
        fullWidth
      />
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

/** A Persian page and an English one: the chevron at the end. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Sample />
    </Directions>
  ),
}

/** On a phone's width, where the trigger is 40 tall. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Sample />
    </Device>
  ),
}

/** The same select as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Select',
      props: {
        label: t('دسته', 'Category'),
        placeholder: t('یک دسته برگزینید', 'Choose a category'),
        defaultSelectedKey: 'bag',
      },
      children: CATEGORIES.map((c) => ({
        type: 'ListBoxItem',
        props: { id: c.id },
        children: t(c.fa, c.en),
      })),
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
