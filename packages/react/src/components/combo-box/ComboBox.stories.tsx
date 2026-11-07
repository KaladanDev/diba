import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import type { Key } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Form } from '../form'
import { Header } from '../header'
import { Input } from '../input'
import { Label } from '../label'
import { ListBox } from '../list-box'
import { ComboBox } from './index'

// The ComboBox, every option it has and what it is built into. The docs page is ComboBox.mdx. A
// line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta: Meta = {
  title: 'Components/Pickers/ComboBox',
  component: ComboBox,
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

const CITIES = [
  { id: 'tehran', fa: 'تهران', en: 'Tehran', province: 'teh' },
  { id: 'karaj', fa: 'کرج', en: 'Karaj', province: 'teh' },
  { id: 'isfahan', fa: 'اصفهان', en: 'Isfahan', province: 'isf' },
  { id: 'kashan', fa: 'کاشان', en: 'Kashan', province: 'isf' },
  { id: 'shiraz', fa: 'شیراز', en: 'Shiraz', province: 'far' },
  { id: 'tabriz', fa: 'تبریز', en: 'Tabriz', province: 'aza' },
  { id: 'mashhad', fa: 'مشهد', en: 'Mashhad', province: 'kho' },
  { id: 'yazd', fa: 'یزد', en: 'Yazd', province: 'yaz' },
  { id: 'rasht', fa: 'رشت', en: 'Rasht', province: 'gil' },
]

/** The cities, in the page's language. */
function Cities() {
  const t = useT()
  return (
    <ListBox>
      {CITIES.map((c) => (
        <ListBox.Item key={c.id} id={c.id} textValue={t(c.fa, c.en)}>
          {t(c.fa, c.en)}
        </ListBox.Item>
      ))}
    </ListBox>
  )
}

/** A combo box's parts: its label, the text with its chevron, the menu, and help under it. */
function Picker({
  label,
  placeholder,
  help,
  error,
  children,
  ...props
}: Omit<React.ComponentProps<typeof ComboBox>, 'children'> & {
  label?: ReactNode
  placeholder?: string
  help?: ReactNode
  error?: ReactNode | true
  children?: ReactNode
}) {
  return (
    <ComboBox {...props}>
      {label ? <Label>{label}</Label> : null}
      <ComboBox.InputGroup>
        <Input placeholder={placeholder} />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>{children ?? <Cities />}</ComboBox.Popover>
      {help ? <Description>{help}</Description> : null}
      {error === true ? <FieldError /> : error ? <FieldError>{error}</FieldError> : null}
    </ComboBox>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  placeholder: string
  menuTrigger: 'input' | 'focus' | 'manual'
  allowsCustomValue: boolean
  variant: 'primary' | 'secondary'
  isRequired: boolean
  isDisabled: boolean
  isReadOnly: boolean
  isInvalid: boolean
}

/** Every option on the controls. Empty words take the sample's. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    label: '',
    placeholder: '',
    menuTrigger: 'input',
    allowsCustomValue: false,
    variant: 'primary',
    isRequired: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Example' } },
    placeholder: { control: 'text', table: { category: 'Example' } },
    menuTrigger: {
      control: 'inline-radio',
      options: ['input', 'focus', 'manual'],
      description:
        'When the menu opens: as the reader types, on focus, or only from the chevron and the arrow keys.',
      table: { category: 'ComboBox', defaultValue: { summary: 'input' } },
    },
    allowsCustomValue: {
      description: 'What the reader typed may stand, though no option matches it.',
      table: { category: 'ComboBox', defaultValue: { summary: 'false' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'secondary on a grey surface.',
      table: { category: 'ComboBox', defaultValue: { summary: 'primary' } },
    },
    isRequired: { table: { category: 'ComboBox', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'ComboBox', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'ComboBox', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'ComboBox', defaultValue: { summary: 'false' } },
    },
  },
  parameters: { docs: { story: { inline: false, height: '440px' } } },
  render: function Render(args) {
    const t = useT()
    const [key, setKey] = useState<Key | null>('isfahan')
    const [text, setText] = useState('')
    return (
      <Stage width={480} surface={args.variant === 'secondary'}>
        <Column>
          <Picker
            selectedKey={key}
            onSelectionChange={setKey}
            onInputChange={setText}
            menuTrigger={args.menuTrigger}
            allowsCustomValue={args.allowsCustomValue}
            variant={args.variant}
            isRequired={args.isRequired}
            isDisabled={args.isDisabled}
            isReadOnly={args.isReadOnly}
            isInvalid={args.isInvalid}
            label={args.label || t('شهر', 'City')}
            placeholder={args.placeholder || t('نام شهر را بنویسید', 'Type a city')}
            help={t('برای هزینهٔ ارسال.', 'For the delivery fee.')}
            error={t('به این شهر ارسال نداریم.', 'We do not deliver to this city.')}
            fullWidth
          />
          <Value label="selectedKey" value={key == null ? null : String(key)} />
          <Value label="inputValue" value={text} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Typing narrows the menu to the options that hold the words, in either language's letters. */
export const Filtering: StoryObj = {
  name: 'Typing narrows it',
  parameters: { docs: { story: { inline: false, height: '400px' } } },
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Picker
          label={t('شهر', 'City')}
          placeholder={t('نام شهر را بنویسید', 'Type a city')}
          help={t('مثلاً «ش» یا «اصف».', 'Say “sh” or “isf”.')}
          fullWidth
        />
      </Column>
    )
  },
}

/** Titled groups of options, and what the menu says when nothing matches. */
export const Sections: StoryObj = {
  name: 'Sections, and nothing found',
  parameters: { docs: { story: { inline: false, height: '440px' } } },
  render: function Render() {
    const t = useT()
    const groups = [
      { id: 'teh', fa: 'استان تهران', en: 'Tehran province' },
      { id: 'isf', fa: 'استان اصفهان', en: 'Isfahan province' },
    ]
    return (
      <Column>
        <Picker
          label={t('شهر', 'City')}
          placeholder={t('نام شهر را بنویسید', 'Type a city')}
          allowsEmptyCollection
          fullWidth
        >
          <ListBox
            renderEmptyState={() => (
              <div className="text-muted" style={{ padding: '8px 12px', fontSize: 14 }}>
                {t('شهری با این نام نیست.', 'No city by that name.')}
              </div>
            )}
          >
            {groups.map((g) => (
              <ListBox.Section key={g.id}>
                <Header>{t(g.fa, g.en)}</Header>
                {CITIES.filter((c) => c.province === g.id).map((c) => (
                  <ListBox.Item key={c.id} id={c.id} textValue={t(c.fa, c.en)}>
                    {t(c.fa, c.en)}
                  </ListBox.Item>
                ))}
              </ListBox.Section>
            ))}
          </ListBox>
        </Picker>
      </Column>
    )
  },
}

/** What is typed may stand, though no option matches: a new colour, say. */
export const CustomValue: StoryObj = {
  name: 'Words of the reader’s own',
  render: function Render() {
    const t = useT()
    const [text, setText] = useState(t('زرشکی تیره', 'Dark crimson'))
    const [key, setKey] = useState<Key | null>(null)
    return (
      <Column>
        <Picker
          label={t('رنگ', 'Colour')}
          allowsCustomValue
          // The words are the app's; the choice is the combo box's, which writes its option's words
          // in. With both the app's, onSelectionChange would have to write them itself.
          inputValue={text}
          onInputChange={setText}
          onSelectionChange={setKey}
          help={t('یکی را برگزینید، یا رنگ تازه‌ای بنویسید.', 'Choose one, or write a new colour.')}
          fullWidth
        >
          <ListBox>
            <ListBox.Item id="crimson">{t('زرشکی', 'Crimson')}</ListBox.Item>
            <ListBox.Item id="turquoise">{t('فیروزه‌ای', 'Turquoise')}</ListBox.Item>
            <ListBox.Item id="gold">{t('طلایی', 'Gold')}</ListBox.Item>
          </ListBox>
        </Picker>
        <Value label="inputValue" value={text} />
        <Value label="selectedKey" value={key == null ? null : String(key)} />
      </Column>
    )
  },
}

/** Disabled, read-only, invalid, and on a grey surface. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        <Example title={t('غیرفعال', 'Disabled')}>
          <Picker label={t('شهر', 'City')} defaultSelectedKey="yazd" isDisabled fullWidth />
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <Picker label={t('شهر', 'City')} defaultSelectedKey="yazd" isReadOnly fullWidth />
        </Example>
        <Example title={t('نادرست', 'Invalid')}>
          <Picker
            label={t('شهر', 'City')}
            defaultSelectedKey="rasht"
            isInvalid
            error={t('به این شهر ارسال نداریم.', 'We do not deliver to this city.')}
            fullWidth
          />
        </Example>
        <Example title={t('روی زمینهٔ خاکستری', 'On a grey surface')} note='variant="secondary"'>
          <Stage width="100%" surface>
            <Picker
              label={t('شهر', 'City')}
              variant="secondary"
              defaultSelectedKey="shiraz"
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
            name="city"
            isRequired
            label={t('شهر', 'City')}
            placeholder={t('نام شهر را بنویسید', 'Type a city')}
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

/** A buyer's address at checkout: the city found by typing, then the street. */
export const Address: StoryObj = {
  name: 'Example: an address',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={480} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
          <span className="text-foreground" style={{ fontSize: 16, fontWeight: 600 }}>
            {t('نشانی تحویل', 'Delivery address')}
          </span>
          <Picker
            label={t('شهر', 'City')}
            placeholder={t('نام شهر را بنویسید', 'Type a city')}
            isRequired
            fullWidth
          />
          <Picker
            label={t('محله', 'District')}
            placeholder={t('اختیاری', 'Optional')}
            allowsCustomValue
            fullWidth
          >
            <ListBox>
              <ListBox.Item id="jolfa">{t('جلفا', 'Jolfa')}</ListBox.Item>
              <ListBox.Item id="chaharbagh">{t('چهارباغ', 'Chaharbagh')}</ListBox.Item>
            </ListBox>
          </Picker>
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
        label={t('شهر', 'City')}
        defaultSelectedKey="tabriz"
        help={t('برای هزینهٔ ارسال.', 'For the delivery fee.')}
        fullWidth
      />
      <Picker
        label={t('شهر', 'City')}
        placeholder={t('نام شهر را بنویسید', 'Type a city')}
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

/** On a phone's width. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Sample />
    </Device>
  ),
}

/** The same combo box as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'ComboBox',
      props: {
        label: t('شهر', 'City'),
        placeholder: t('نام شهر را بنویسید', 'Type a city'),
        emptyMessage: t('شهری با این نام نیست.', 'No city by that name.'),
        defaultSelectedKey: 'isfahan',
      },
      children: CITIES.slice(0, 5).map((c) => ({
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
