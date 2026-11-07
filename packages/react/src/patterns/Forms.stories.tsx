import type { Meta, StoryObj } from '@storybook/react-vite'
import { Star } from 'lucide-react'
import { useState } from 'react'
import type { Selection } from 'react-aria-components'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../stories/kit'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Description,
  FieldError,
  Form,
  Input,
  InputOTP,
  Label,
  Link,
  ListBox,
  Select,
  Stack,
  Text,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '../index'

// Forms a shop and its buyers fill in, composed from the basics: signing in with a phone, an
// address, a discount code and a review. The docs page is Forms.mdx. A line comment, not a doc
// comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Patterns/Forms',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

/** Signing in: a phone number, then the code sent to it. */
export const SignIn: StoryObj = {
  name: 'Signing in with a phone',
  render: function Render() {
    const t = useT()
    const [code, setCode] = useState('')
    return (
      <Grid min={320}>
        <Example title={t('گام ۱', 'Step 1')}>
          <Card>
            <Form onSubmit={(e) => e.preventDefault()}>
              <Stack gap={4}>
                <Stack gap={1}>
                  <Card.Title>{t('ورود', 'Sign in')}</Card.Title>
                  <Card.Description>
                    {t('کدی به این شماره پیامک می‌شود.', 'A code is texted to this number.')}
                  </Card.Description>
                </Stack>
                <TextField name="phone" type="tel" isRequired>
                  <Label>{t('شمارهٔ همراه', 'Mobile number')}</Label>
                  <Input dir="ltr" placeholder="0912 345 6789" />
                  <FieldError />
                </TextField>
                <Button type="submit" fullWidth>
                  {t('فرستادن کد', 'Send the code')}
                </Button>
              </Stack>
            </Form>
          </Card>
        </Example>
        <Example title={t('گام ۲', 'Step 2')}>
          <Card>
            <Stack gap={4}>
              <Stack gap={1}>
                <Card.Title>{t('کد را بنویسید', 'Enter the code')}</Card.Title>
                <Card.Description>
                  {t('به ۰۹۱۲ ۳۴۵ ۶۷۸۹ فرستاده شد.', 'Sent to 0912 345 6789.')}
                </Card.Description>
              </Stack>
              <Stack gap={2}>
                <Label id="otp-label">{t('کد ورود', 'Sign-in code')}</Label>
                <InputOTP maxLength={5} aria-labelledby="otp-label" value={code} onChange={setCode}>
                  <InputOTP.Group>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <InputOTP.Slot key={i} index={i} />
                    ))}
                  </InputOTP.Group>
                </InputOTP>
              </Stack>
              <Button fullWidth isDisabled={code.length < 5}>
                {t('ورود', 'Sign in')}
              </Button>
              <Text size="sm" tone="muted" align="center">
                {t('کدی نرسید؟ ', 'No code? ')}
                <Link onPress={() => setCode('')}>{t('دوباره بفرستید', 'Send it again')}</Link>
              </Text>
            </Stack>
          </Card>
        </Example>
      </Grid>
    )
  },
}

/** An address: who receives it, where, and whether it is the one to use next time. */
function AddressForm() {
  const t = useT()
  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <Stack gap={4}>
        <Grid min={200}>
          <TextField name="name" isRequired>
            <Label>{t('نام گیرنده', 'Recipient')}</Label>
            <Input />
            <FieldError />
          </TextField>
          <TextField name="phone" type="tel" isRequired>
            <Label>{t('شمارهٔ همراه', 'Mobile number')}</Label>
            <Input dir="ltr" />
            <FieldError />
          </TextField>
        </Grid>
        <Grid min={200}>
          <Select name="province" isRequired placeholder={t('برگزینید', 'Choose')}>
            <Label>{t('استان', 'Province')}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="tehran">{t('تهران', 'Tehran')}</ListBox.Item>
                <ListBox.Item id="isfahan">{t('اصفهان', 'Isfahan')}</ListBox.Item>
                <ListBox.Item id="yazd">{t('یزد', 'Yazd')}</ListBox.Item>
              </ListBox>
            </Select.Popover>
            <FieldError />
          </Select>
          <TextField name="city" isRequired>
            <Label>{t('شهر', 'City')}</Label>
            <Input />
            <FieldError />
          </TextField>
        </Grid>
        <TextField name="address" isRequired>
          <Label>{t('نشانی', 'Address')}</Label>
          <TextArea rows={3} />
          <Description>
            {t('خیابان، کوچه، پلاک و واحد.', 'Street, lane, number and unit.')}
          </Description>
          <FieldError />
        </TextField>
        <Checkbox name="default" defaultSelected>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label>{t('نشانی پیش‌فرض', 'My default address')}</Label>
          </Checkbox.Content>
        </Checkbox>
        <Stack direction="horizontal" gap={2} justify="end">
          <Button variant="tertiary">{t('انصراف', 'Cancel')}</Button>
          <Button type="submit">{t('ذخیرهٔ نشانی', 'Save the address')}</Button>
        </Stack>
      </Stack>
    </Form>
  )
}

/** An address, its fields in pairs where they belong together. */
export const Address: StoryObj = {
  name: 'An address',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={640}>
        <Card>
          <Card.Header>
            <Card.Title>{t('نشانی تازه', 'A new address')}</Card.Title>
          </Card.Header>
          <AddressForm />
        </Card>
      </Stage>
    )
  },
}

/** A discount code beside its button, and what the shop says of it. */
export const DiscountCode: StoryObj = {
  name: 'A discount code',
  render: function Render() {
    const t = useT()
    const [applied, setApplied] = useState(false)
    return (
      <Stage width={420}>
        <Stack gap={3}>
          <Form
            onSubmit={(e) => {
              e.preventDefault()
              setApplied(true)
            }}
          >
            <Stack direction="horizontal" gap={2} align="end">
              <TextField name="code" isRequired defaultValue="YALDA" style={{ flex: 1 }}>
                <Label>{t('کد تخفیف', 'Discount code')}</Label>
                <Input dir="ltr" />
              </TextField>
              <Button type="submit" variant="secondary">
                {t('اعمال', 'Apply')}
              </Button>
            </Stack>
          </Form>
          {applied ? (
            <Alert status="success">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{t('۱۰٪ تخفیف اعمال شد', '10% off applied')}</Alert.Title>
                <Alert.Description>
                  {t('۶۴٬۰۰۰ تومان از جمع کم شد.', '64,000 toman off the total.')}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}
        </Stack>
      </Stage>
    )
  },
}

/** A review: a score from five, words, and the way to send it. */
export const Review: StoryObj = {
  name: 'A review',
  render: function Render() {
    const t = useT()
    const num = (v: number) => v.toLocaleString(t('fa-IR', 'en-US'))
    const [score, setScore] = useState<Selection>(new Set())
    return (
      <Stage width={520}>
        <Card>
          <Card.Header>
            <Card.Title>
              {t('نظر شما دربارهٔ چای لاهیجان', 'Your review of Lahijan tea')}
            </Card.Title>
          </Card.Header>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Stack gap={4}>
              <Stack gap={2}>
                <Label id="score-label">{t('امتیاز', 'Score')}</Label>
                <ToggleButtonGroup
                  aria-labelledby="score-label"
                  selectionMode="single"
                  selectedKeys={score}
                  onSelectionChange={setScore}
                  size="sm"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <ToggleButton
                      key={n}
                      id={String(n)}
                      aria-label={t(`${num(n)} ستاره`, `${n} stars`)}
                    >
                      <Star aria-hidden size={14} fill="currentColor" />
                      {num(n)}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
              <TextField name="words" maxLength={500}>
                <Label>{t('نظر', 'Your words')}</Label>
                <TextArea rows={4} />
                <Description>
                  {t('دیگر خریداران آن را می‌بینند.', 'Other buyers will see it.')}
                </Description>
              </TextField>
              <Button type="submit" isDisabled={(score as Set<unknown>).size === 0}>
                {t('فرستادن نظر', 'Send the review')}
              </Button>
            </Stack>
          </Form>
        </Card>
      </Stage>
    )
  },
}

// ---- everywhere they are drawn -------------------------------------------------------------------

/** In both themes. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <AddressForm />
    </Themes>
  ),
}

/** On a Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <AddressForm />
    </Directions>
  ),
}

/** On a phone: the pairs one under the other. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <AddressForm />
    </Device>
  ),
}
