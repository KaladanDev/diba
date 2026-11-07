import type { Meta, StoryObj } from '@storybook/react-vite'
import { AtSign, Copy, Eye, EyeOff, Mail } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Button } from '../button'
import { Description } from '../description'
import { FieldError } from '../field-error'
import { Input } from '../input'
import { InputGroup } from '../input-group'
import { Label } from '../label'
import { TextField } from './index'

// The TextField, every option it has and what it is built into. The docs page is TextField.mdx. A
// line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta: Meta = {
  title: 'Components/Forms/TextField',
  component: TextField,
  parameters: { layout: 'fullscreen' },
}

export default meta

type Type = 'text' | 'email' | 'tel' | 'url' | 'password'

/** Fields down the page, 20 apart, as wide as a form's column. */
function Column({ children, width = 360 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  label: string
  placeholder: string
  description: string
  type: Type
  variant: 'primary' | 'secondary'
  fullWidth: boolean
  prefix: string
  suffix: string
  dir: 'auto' | 'ltr' | 'rtl'
  maxLength: number
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
    description: '',
    type: 'text',
    variant: 'primary',
    fullWidth: true,
    prefix: '',
    suffix: '',
    dir: 'auto',
    maxLength: 0,
    isRequired: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    label: { control: 'text', description: 'The Label above it.', table: { category: 'Example' } },
    placeholder: { control: 'text', table: { category: 'Input' } },
    description: {
      control: 'text',
      description: 'A Description under it.',
      table: { category: 'Example' },
    },
    type: {
      control: 'inline-radio',
      options: ['text', 'email', 'tel', 'url', 'password'],
      description: 'The kind of text, and the keyboard a phone shows for it.',
      table: { category: 'TextField', defaultValue: { summary: 'text' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description: 'secondary for a field on a grey surface; its Input takes it.',
      table: { category: 'TextField', defaultValue: { summary: 'primary' } },
    },
    fullWidth: {
      description:
        'In a row, the width the rest of the row leaves; in a column it already fills it.',
      table: { category: 'TextField' },
    },
    prefix: {
      control: 'text',
      description: 'InputGroup.Prefix: words before the value.',
      table: { category: 'Example' },
    },
    suffix: {
      control: 'text',
      description: 'InputGroup.Suffix: words after the value.',
      table: { category: 'Example' },
    },
    dir: {
      control: 'inline-radio',
      options: ['auto', 'ltr', 'rtl'],
      description: 'The value’s direction: auto follows its first letter.',
      table: { category: 'Input' },
    },
    maxLength: {
      control: { type: 'number', min: 0, max: 200 },
      description: '0 for no limit.',
      table: { category: 'TextField' },
    },
    isRequired: { table: { category: 'TextField', defaultValue: { summary: 'false' } } },
    isDisabled: { table: { category: 'TextField', defaultValue: { summary: 'false' } } },
    isReadOnly: { table: { category: 'TextField', defaultValue: { summary: 'false' } } },
    isInvalid: {
      description: 'With a FieldError under it.',
      table: { category: 'TextField', defaultValue: { summary: 'false' } },
    },
  },
  render: function Render(args) {
    const t = useT()
    const [value, setValue] = useState(t('شال ابریشم', 'Silk scarf'))
    const grouped = Boolean(args.prefix || args.suffix)
    return (
      <Stage width={420} surface={args.variant === 'secondary'}>
        <Column>
          <TextField
            value={value}
            onChange={setValue}
            type={args.type}
            variant={args.variant}
            fullWidth={args.fullWidth}
            maxLength={args.maxLength || undefined}
            isRequired={args.isRequired}
            isDisabled={args.isDisabled}
            isReadOnly={args.isReadOnly}
            isInvalid={args.isInvalid}
          >
            <Label>{args.label || t('نام محصول', 'Product name')}</Label>
            {grouped ? (
              <InputGroup>
                {args.prefix ? <InputGroup.Prefix>{args.prefix}</InputGroup.Prefix> : null}
                <InputGroup.Input placeholder={args.placeholder} dir={args.dir} />
                {args.suffix ? <InputGroup.Suffix>{args.suffix}</InputGroup.Suffix> : null}
              </InputGroup>
            ) : (
              <Input
                placeholder={args.placeholder || t('مثلاً شال ابریشم', 'For example, Silk scarf')}
                dir={args.dir}
              />
            )}
            <Description>
              {args.description || t('همان‌طور که خریدار می‌بیند.', 'As the buyer sees it.')}
            </Description>
            <FieldError>{t('نامی دیگر بنویسید.', 'Write another name.')}</FieldError>
          </TextField>
          <Value label="value" value={value} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** A label above, help under it, a placeholder inside. */
export const LabelAndHelp: StoryObj = {
  name: 'Label, placeholder and help',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <TextField>
          <Label>{t('نام محصول', 'Product name')}</Label>
          <Input placeholder={t('مثلاً شال ابریشم', 'For example, Silk scarf')} />
          <Description>{t('همان‌طور که خریدار می‌بیند.', 'As the buyer sees it.')}</Description>
        </TextField>
        <TextField isRequired defaultValue={t('چای‌خانهٔ آفتاب', 'Aftab Tea House')}>
          <Label>{t('نام فروشگاه', 'Shop name')}</Label>
          <Input />
        </TextField>
        <TextField aria-label={t('یادداشت', 'Note')}>
          <Input
            placeholder={t('بی برچسب دیدنی، با aria-label', 'No label in sight, an aria-label')}
          />
        </TextField>
      </Column>
    )
  },
}

/** The kind of text: an email, a phone, an address, a password. Each asks a phone for its keyboard. */
export const Types: StoryObj = {
  render: function Render() {
    const t = useT()
    const [shown, setShown] = useState(false)
    return (
      <Column>
        <TextField type="email" defaultValue="niloufar@aftab.shop">
          <Label>{t('ایمیل', 'Email')}</Label>
          <Input dir="ltr" />
        </TextField>
        <TextField type="tel" defaultValue="09121234567">
          <Label>{t('تلفن همراه', 'Mobile')}</Label>
          <Input dir="ltr" inputMode="tel" />
        </TextField>
        <TextField type="url" defaultValue="https://aftab.shop">
          <Label>{t('نشانی وب', 'Web address')}</Label>
          <Input dir="ltr" />
        </TextField>
        <TextField type={shown ? 'text' : 'password'} defaultValue="correct horse battery">
          <Label>{t('گذرواژه', 'Password')}</Label>
          <InputGroup>
            <InputGroup.Input dir="ltr" />
            <InputGroup.Suffix>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label={shown ? t('پنهان کردن', 'Hide it') : t('نشان دادن', 'Show it')}
                onPress={() => setShown(!shown)}
              >
                {shown ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>
      </Column>
    )
  },
}

/** A Persian page's field takes Latin too: dir="auto" turns with the first letter, ltr keeps a code's. */
export const Direction: StoryObj = {
  name: 'Direction of the text',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <TextField defaultValue="Silk scarf, hand-woven">
          <Label>{t('نام انگلیسی', 'English name')}</Label>
          <Input dir="auto" />
          <Description>
            {t('dir="auto": جهت از نخستین حرف', 'dir="auto": the direction from the first letter')}
          </Description>
        </TextField>
        <TextField defaultValue={t('شال ابریشم', 'Silk scarf')}>
          <Label>{t('نام فارسی', 'Persian name')}</Label>
          <Input dir="auto" />
        </TextField>
        <TextField defaultValue="SCF-1041-BL">
          <Label>{t('کد کالا', 'SKU')}</Label>
          <Input dir="ltr" spellCheck={false} />
          <Description>
            {t('dir="ltr": همیشه چپ به راست', 'dir="ltr": always left to right')}
          </Description>
        </TextField>
      </Column>
    )
  },
}

/** Words or an icon before the value, or after it, inside the field: InputGroup. */
export const PrefixAndSuffix: StoryObj = {
  name: 'Before and after the value',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <TextField defaultValue="1250000">
          <Label>{t('قیمت', 'Price')}</Label>
          <InputGroup>
            <InputGroup.Input dir="ltr" inputMode="numeric" />
            <InputGroup.Suffix>{t('تومان', 'toman')}</InputGroup.Suffix>
          </InputGroup>
        </TextField>
        <TextField defaultValue="aftab">
          <Label>{t('نشانی فروشگاه', 'Shop address')}</Label>
          <InputGroup dir="ltr">
            <InputGroup.Prefix>https://</InputGroup.Prefix>
            <InputGroup.Input spellCheck={false} />
            <InputGroup.Suffix>.kaladan.shop</InputGroup.Suffix>
          </InputGroup>
          <Description>
            {t(
              'نشانی لاتین روی صفحهٔ فارسی هم چپ به راست است.',
              'A Latin address reads left to right on a Persian page too.',
            )}
          </Description>
        </TextField>
        <TextField defaultValue="aftab.tea">
          <Label>{t('اینستاگرام', 'Instagram')}</Label>
          <InputGroup dir="ltr">
            <InputGroup.Prefix>
              <AtSign aria-hidden size={16} />
            </InputGroup.Prefix>
            <InputGroup.Input spellCheck={false} />
          </InputGroup>
        </TextField>
        <TextField defaultValue="KLD-7Q2X" isReadOnly>
          <Label>{t('کد دعوت', 'Invite code')}</Label>
          <InputGroup dir="ltr">
            <InputGroup.Input />
            <InputGroup.Suffix>
              <Button isIconOnly size="sm" variant="ghost" aria-label={t('رونوشت', 'Copy')}>
                <Copy aria-hidden />
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>
      </Column>
    )
  },
}

/** What is wrong, under the field in the help's place: your own check, or a field required. */
export const Validation: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <TextField
          defaultValue="niloufar@"
          type="email"
          validationBehavior="aria"
          validate={(value) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
              ? null
              : t('یک نشانی ایمیل درست بنویسید.', 'Write a whole email address.')
          }
        >
          <Label>{t('ایمیل', 'Email')}</Label>
          <Input dir="ltr" />
          <FieldError />
        </TextField>
        <TextField
          defaultValue="ab"
          minLength={3}
          validationBehavior="aria"
          validate={(value) =>
            value.length < 3 ? t('دست‌کم ۳ حرف.', 'At least 3 letters.') : null
          }
        >
          <Label>{t('نام کاربری', 'Username')}</Label>
          <Input dir="ltr" />
          <Description>{t('دست‌کم ۳ حرف.', 'At least 3 letters.')}</Description>
          <FieldError />
        </TextField>
        <TextField isInvalid defaultValue={t('آفتاب', 'Aftab')}>
          <Label>{t('نام فروشگاه', 'Shop name')}</Label>
          <Input />
          <FieldError>
            {t('این نام را فروشگاه دیگری دارد.', 'Another shop has this name.')}
          </FieldError>
        </TextField>
      </Column>
    )
  },
}

/** Disabled, read-only, on a grey surface, and at its own width. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={280}>
        <Example title={t('غیرفعال', 'Disabled')}>
          <TextField isDisabled defaultValue={t('شال ابریشم', 'Silk scarf')}>
            <Label>{t('نام محصول', 'Product name')}</Label>
            <Input />
          </TextField>
        </Example>
        <Example title={t('فقط خواندنی', 'Read-only')}>
          <TextField isReadOnly defaultValue={t('شال ابریشم', 'Silk scarf')}>
            <Label>{t('نام محصول', 'Product name')}</Label>
            <Input />
          </TextField>
        </Example>
        <Example title={t('روی زمینهٔ خاکستری', 'On a grey surface')} note='variant="secondary"'>
          <Stage width="100%" surface>
            <TextField variant="secondary" defaultValue={t('شال ابریشم', 'Silk scarf')}>
              <Label>{t('نام محصول', 'Product name')}</Label>
              <Input />
            </TextField>
          </Stage>
        </Example>
        <Example title={t('به پهنای خودش', 'At its own width')} note={t('در یک ردیف', 'In a row')}>
          <div style={{ display: 'flex' }}>
            <TextField defaultValue="4">
              <Label>{t('تعداد', 'Quantity')}</Label>
              <Input dir="ltr" inputMode="numeric" />
            </TextField>
          </div>
        </Example>
      </Grid>
    )
  },
}

/** In a form: its name sends the value; a required field left empty stops the form. */
export const InAForm: StoryObj = {
  name: 'In a form',
  render: function Render() {
    const t = useT()
    const [sent, setSent] = useState<Record<string, string> | null>(null)
    return (
      <Stage width={420} surface>
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}
          onSubmit={(event) => {
            event.preventDefault()
            setSent(Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>)
          }}
        >
          <TextField name="name" isRequired>
            <Label>{t('نام', 'Name')}</Label>
            <Input />
            <FieldError />
          </TextField>
          <TextField name="email" type="email">
            <Label>{t('ایمیل', 'Email')}</Label>
            <Input dir="ltr" />
            <FieldError />
          </TextField>
          <div>
            <Button type="submit" variant="primary">
              {t('ذخیره', 'Save')}
            </Button>
          </div>
          <Value label={t('فرستاده شد', 'Sent')} value={sent} />
        </form>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A product's details: its name, its code and its price. */
export const ProductDetails: StoryObj = {
  name: 'Example: a product’s details',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={560} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
          <TextField defaultValue={t('شال ابریشم دست‌باف', 'Hand-woven silk scarf')} isRequired>
            <Label>{t('نام محصول', 'Product name')}</Label>
            <Input />
          </TextField>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <TextField defaultValue="SCF-1041-BL">
                <Label>{t('کد کالا', 'SKU')}</Label>
                <Input dir="ltr" spellCheck={false} />
              </TextField>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <TextField defaultValue="1250000">
                <Label>{t('قیمت', 'Price')}</Label>
                <InputGroup>
                  <InputGroup.Input dir="ltr" inputMode="numeric" />
                  <InputGroup.Suffix>{t('تومان', 'toman')}</InputGroup.Suffix>
                </InputGroup>
              </TextField>
            </div>
          </div>
        </div>
      </Stage>
    )
  },
}

/** The support address customers are answered from: an icon before it. */
export const ContactField: StoryObj = {
  name: 'Example: a contact field',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={420}>
        <TextField type="email" defaultValue="hello@aftab.shop">
          <Label>{t('ایمیل پشتیبانی', 'Support email')}</Label>
          <InputGroup dir="ltr">
            <InputGroup.Prefix>
              <Mail aria-hidden size={16} />
            </InputGroup.Prefix>
            <InputGroup.Input />
          </InputGroup>
          <Description>
            {t('خریداران پاسخ را از این نشانی می‌گیرند.', 'Buyers get replies from this address.')}
          </Description>
        </TextField>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <Column width={320}>
      <TextField defaultValue={t('شال ابریشم', 'Silk scarf')}>
        <Label>{t('نام محصول', 'Product name')}</Label>
        <Input />
        <Description>{t('همان‌طور که خریدار می‌بیند.', 'As the buyer sees it.')}</Description>
      </TextField>
      <TextField defaultValue="1250000">
        <Label>{t('قیمت', 'Price')}</Label>
        <InputGroup>
          <InputGroup.Input dir="ltr" />
          <InputGroup.Suffix>{t('تومان', 'toman')}</InputGroup.Suffix>
        </InputGroup>
      </TextField>
      <TextField isInvalid>
        <Label>{t('نام فروشگاه', 'Shop name')}</Label>
        <Input placeholder={t('نام فروشگاه', 'Shop name')} />
        <FieldError>{t('نام فروشگاه را بنویسید.', 'Write the shop’s name.')}</FieldError>
      </TextField>
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

/** A Persian page and an English one: the label, the value and the icons keep to the reading side. */
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

/** The same field as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 5 },
      children: [
        {
          type: 'TextField',
          props: {
            label: t('نام محصول', 'Product name'),
            defaultValue: t('شال ابریشم', 'Silk scarf'),
            description: t('همان‌طور که خریدار می‌بیند.', 'As the buyer sees it.'),
            isRequired: true,
          },
        },
        {
          type: 'TextField',
          props: {
            label: t('قیمت', 'Price'),
            defaultValue: '1250000',
            inputMode: 'numeric',
            dir: 'ltr',
            suffix: t('تومان', 'toman'),
          },
        },
        {
          type: 'TextField',
          props: {
            label: t('ایمیل', 'Email'),
            type: 'email',
            dir: 'ltr',
            errorMessage: t('یک نشانی ایمیل درست بنویسید.', 'Write a whole email address.'),
          },
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
