import type { Meta, StoryObj } from '@storybook/react-vite'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { Button } from '../button'
import { Checkbox } from '../checkbox'
import { Description } from '../description'
import { Form } from '../form'
import { Input } from '../input'
import { Label } from '../label'
import { NumberField } from '../number-field'
import { TextArea } from '../textarea'
import { TextField } from '../textfield'
import { Fieldset } from './index'

// The Fieldset, every option it has and what it groups. The docs page is Fieldset.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Forms/Fieldset',
  component: Fieldset,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Fieldset>

export default meta

/** A product's price and stock, the group most stories draw. */
function PriceAndStock({
  description = true,
  actions = false,
}: {
  description?: boolean
  actions?: boolean
}) {
  const t = useT()
  return (
    <Fieldset>
      <Fieldset.Legend>{t('قیمت و موجودی', 'Price and stock')}</Fieldset.Legend>
      {description ? (
        <Description>
          {t('آنچه خریدار می‌پردازد و چند عدد مانده.', 'What a buyer pays, and how many are left.')}
        </Description>
      ) : null}
      <Fieldset.Group>
        <NumberField
          name="price"
          defaultValue={320000}
          formatOptions={{ maximumFractionDigits: 0 }}
        >
          <Label>{t('قیمت', 'Price')}</Label>
          <NumberField.Group>
            <NumberField.Input />
            <span data-slot="unit">{t('تومان', 'toman')}</span>
          </NumberField.Group>
        </NumberField>
        <NumberField name="stock" defaultValue={12} minValue={0}>
          <Label>{t('موجودی', 'Stock')}</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
      </Fieldset.Group>
      {actions ? (
        <Fieldset.Actions>
          <Button size="sm">{t('ذخیره', 'Save')}</Button>
          <Button size="sm" variant="tertiary">
            {t('انصراف', 'Cancel')}
          </Button>
        </Fieldset.Actions>
      ) : null}
    </Fieldset>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = { description: boolean; actions: boolean }

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { description: true, actions: false },
  argTypes: {
    description: {
      description: 'A Description right under the legend.',
      table: { category: 'Example' },
    },
    actions: {
      description: 'Fieldset.Actions: buttons after the fields.',
      table: { category: 'Example' },
    },
  },
  render: (args) => (
    <Stage width={480} surface>
      <PriceAndStock {...args} />
    </Stage>
  ),
}

// ---- its options ---------------------------------------------------------------------------------

/** A legend alone, a legend and its description, and buttons of its own. */
export const Parts: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={260}>
        <Example title={t('فقط عنوان', 'A legend alone')}>
          <Stage surface>
            <PriceAndStock description={false} />
          </Stage>
        </Example>
        <Example title={t('با توضیح', 'With a description')}>
          <Stage surface>
            <PriceAndStock />
          </Stage>
        </Example>
        <Example title={t('با دکمه‌های خودش', 'With its own buttons')} note="Fieldset.Actions">
          <Stage surface>
            <PriceAndStock actions />
          </Stage>
        </Example>
      </Grid>
    )
  },
}

// ---- what it groups ------------------------------------------------------------------------------

/** The admin's product page: two groups in one form, saved together. */
export const ProductForm: StoryObj = {
  name: 'Example: a product form',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={560} surface>
        <Form
          onSubmit={(event) => event.preventDefault()}
          style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
        >
          <Fieldset>
            <Fieldset.Legend>{t('دربارهٔ محصول', 'About the product')}</Fieldset.Legend>
            <Fieldset.Group>
              <TextField name="name" defaultValue={t('چای لاهیجان', 'Lahijan tea')} isRequired>
                <Label>{t('نام', 'Name')}</Label>
                <Input />
              </TextField>
              <TextField name="about">
                <Label>{t('توضیح', 'Description')}</Label>
                <TextArea rows={3} />
              </TextField>
            </Fieldset.Group>
          </Fieldset>
          <PriceAndStock />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit">{t('ذخیره', 'Save')}</Button>
          </div>
        </Form>
      </Stage>
    )
  },
}

/** A storefront's checkout: where to send it, and how to reach the buyer. */
export const Checkout: StoryObj = {
  name: 'Example: a checkout',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={480} surface>
        <Form
          onSubmit={(event) => event.preventDefault()}
          style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
        >
          <Fieldset>
            <Fieldset.Legend>{t('نشانی تحویل', 'Delivery address')}</Fieldset.Legend>
            <Description>
              {t('سفارش به همین نشانی فرستاده می‌شود.', 'The order is sent to this address.')}
            </Description>
            <Fieldset.Group>
              <TextField name="city" isRequired>
                <Label>{t('شهر', 'City')}</Label>
                <Input />
              </TextField>
              <TextField name="address" isRequired>
                <Label>{t('نشانی', 'Address')}</Label>
                <TextArea rows={2} />
              </TextField>
            </Fieldset.Group>
          </Fieldset>
          <Fieldset>
            <Fieldset.Legend>{t('راه تماس', 'Contact')}</Fieldset.Legend>
            <Fieldset.Group>
              <TextField name="phone" type="tel" isRequired>
                <Label>{t('شمارهٔ همراه', 'Mobile number')}</Label>
                <Input dir="ltr" placeholder="09121234567" />
              </TextField>
              <Checkbox name="news">
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Label>{t('خبرهای فروشگاه را پیامک کن', 'Text me the shop’s news')}</Label>
                </Checkbox.Content>
              </Checkbox>
            </Fieldset.Group>
          </Fieldset>
          <Button type="submit" fullWidth>
            {t('ادامه به پرداخت', 'Go on to payment')}
          </Button>
        </Form>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** In both themes. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <PriceAndStock />
    </Themes>
  ),
}

/** On a Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <PriceAndStock />
    </Directions>
  ),
}

/** On a phone. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <PriceAndStock actions />
    </Device>
  ),
}

/** The same group as a tree, in a Form block. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Form',
      children: [
        {
          type: 'Fieldset',
          props: {
            legend: t('نشانی تحویل', 'Delivery address'),
            description: t(
              'سفارش به همین نشانی فرستاده می‌شود.',
              'The order is sent to this address.',
            ),
          },
          children: [
            {
              type: 'TextField',
              props: { name: 'city', label: t('شهر', 'City'), isRequired: true },
            },
            { type: 'TextArea', props: { name: 'address', label: t('نشانی', 'Address'), rows: 2 } },
          ],
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
