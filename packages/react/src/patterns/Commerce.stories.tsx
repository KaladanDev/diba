import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowLeft, ArrowRight, Star, Trash2, Truck } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../stories/kit'
import { brokenPhoto, goods } from '../stories/people'
import {
  Button,
  buttonVariants,
  Card,
  Chip,
  Image,
  Label,
  Link,
  NumberField,
  Separator,
  Stack,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '../index'

// A storefront's pieces, composed from the basics: a price, a score, a quantity, a product, a cart
// line, an order's summary and a product's page. The docs page is Commerce.mdx. A line comment, not
// a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Patterns/Commerce',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

/** A number in the story's digits. */
function useNum() {
  const t = useT()
  const locale = t('fa-IR', 'en-US')
  return (v: number, digits = 0) => v.toLocaleString(locale, { maximumFractionDigits: digits })
}

// ---- the pieces ----------------------------------------------------------------------------------

/**
 * A price: the amount in figures of one width, its unit after it, muted; on sale, the amount in
 * the danger's ink and the old one struck through over it.
 */
function Price({
  amount,
  was,
  size = 'md',
}: {
  amount: number
  was?: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const t = useT()
  const num = useNum()
  const big = { sm: 'md', md: 'xl', lg: '2xl' } as const
  const unit = { sm: 'xs', md: 'sm', lg: 'md' } as const
  return (
    <Stack gap={0} align="start">
      {was ? (
        <del>
          <Text size="xs" tone="muted">
            {num(was)}
          </Text>
        </del>
      ) : null}
      <Stack direction="horizontal" gap={1} align="baseline">
        <Text
          size={big[size]}
          weight="semibold"
          tone={was ? 'danger' : 'default'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {num(amount)}
        </Text>
        <Text size={unit[size]} tone="muted">
          {t('تومان', 'toman')}
        </Text>
      </Stack>
    </Stack>
  )
}

/** A score: five stars, the score's filled in the gilt, the rest outlined, and its count. */
function Stars({ value, count, size = 16 }: { value: number; count?: number; size?: number }) {
  const t = useT()
  const num = useNum()
  const whole = Math.round(value)
  const said = t(
    `${num(value, 1)} از ۵${count ? `، ${num(count)} نظر` : ''}`,
    `${num(value, 1)} out of 5${count ? `, ${count} reviews` : ''}`,
  )
  return (
    <Stack direction="horizontal" gap={2} align="center">
      <span role="img" aria-label={said} style={{ display: 'inline-flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            aria-hidden
            color={i <= whole ? 'var(--accent)' : 'var(--db-slate-500)'}
            fill={i <= whole ? 'var(--accent)' : 'none'}
          />
        ))}
      </span>
      <Text size="sm" tone="muted" aria-hidden>
        {num(value, 1)}
        {count ? ` (${num(count)})` : ''}
      </Text>
    </Stack>
  )
}

/** How many to add: the number field with its − and +, from one up to what is in stock. */
function Quantity({ stock = 10, initial = 1 }: { stock?: number; initial?: number }) {
  const t = useT()
  return (
    <NumberField
      defaultValue={initial}
      minValue={1}
      maxValue={stock}
      aria-label={t('تعداد', 'Quantity')}
    >
      <NumberField.Group style={{ width: 132 }}>
        <NumberField.DecrementButton />
        <NumberField.Input />
        <NumberField.IncrementButton />
      </NumberField.Group>
    </NumberField>
  )
}

type Product = {
  photo?: string
  fa: string
  en: string
  helpFa: string
  helpEn: string
  amount: number
  was?: number
  score: number
  reviews: number
  soldOut?: boolean
}

const products: Product[] = [
  {
    photo: goods.tea.photo,
    fa: goods.tea.fa,
    en: goods.tea.en,
    helpFa: 'برگ درشت، ۴۵۰ گرم',
    helpEn: 'Large leaf, 450 g',
    amount: 256_000,
    was: 320_000,
    score: 4.6,
    reviews: 124,
  },
  {
    photo: goods.scarf.photo,
    fa: goods.scarf.fa,
    en: goods.scarf.en,
    helpFa: 'ابریشم، دست‌باف یزد',
    helpEn: 'Silk, hand-woven in Yazd',
    amount: 960_000,
    score: 4.8,
    reviews: 38,
  },
  {
    photo: brokenPhoto,
    fa: 'گلدان سفالی',
    en: 'Clay vase',
    helpFa: 'لالجین، ۲۵ سانتی‌متر',
    helpEn: 'Lalejin, 25 cm',
    amount: 410_000,
    score: 4.1,
    reviews: 9,
    soldOut: true,
  },
]

/**
 * A product on a card: its picture flush along the top with what is special about it, its name
 * and help, its price and score, and the way to the cart, off when it is sold out.
 */
function ProductTile({ product }: { product: Product }) {
  const t = useT()
  const num = useNum()
  const off = product.was ? Math.round((1 - product.amount / product.was) * 100) : 0
  return (
    <Card style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
      <div style={{ position: 'relative' }}>
        <Image
          src={product.photo}
          alt=""
          ratio="1"
          radius="none"
          fallback={
            <Text size="sm" tone="muted">
              {t(product.fa, product.en)}
            </Text>
          }
        />
        {off || product.soldOut ? (
          <div style={{ position: 'absolute', top: 12, insetInlineStart: 12 }}>
            {product.soldOut ? (
              <Chip variant="secondary">{t('ناموجود', 'Sold out')}</Chip>
            ) : (
              <Chip variant="primary" color="danger">
                {t(`${num(off)}٪ تخفیف`, `${off}% off`)}
              </Chip>
            )}
          </div>
        ) : null}
      </div>
      <Stack gap={3} style={{ padding: '0 16px 16px', flex: 1 }}>
        <Stack gap={0}>
          <Card.Title>{t(product.fa, product.en)}</Card.Title>
          <Card.Description>{t(product.helpFa, product.helpEn)}</Card.Description>
        </Stack>
        <Stack gap={2}>
          <Price amount={product.amount} was={product.was} />
          <Stars value={product.score} count={product.reviews} />
        </Stack>
        <Button fullWidth isDisabled={product.soldOut} style={{ marginTop: 'auto' }}>
          {product.soldOut ? t('ناموجود', 'Sold out') : t('افزودن به سبد', 'Add to cart')}
        </Button>
      </Stack>
    </Card>
  )
}

// ---- the pieces, on their own --------------------------------------------------------------------

/** A price: the amount and its unit; on sale, struck through over it; three sizes. */
export const Prices: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={200}>
        <Example title={t('قیمت', 'A price')}>
          <Price amount={960_000} />
        </Example>
        <Example title={t('در حراج', 'On sale')}>
          <Price amount={256_000} was={320_000} />
        </Example>
        <Example title={t('اندازه‌ها', 'Sizes')} note="sm · md · lg">
          <Stack gap={2}>
            <Price amount={410_000} size="sm" />
            <Price amount={410_000} />
            <Price amount={410_000} size="lg" />
          </Stack>
        </Example>
      </Grid>
    )
  },
}

/** A score: stars and their count, read; and a review's own score, chosen from five. */
export const Scores: StoryObj = {
  render: function Render() {
    const t = useT()
    const num = useNum()
    const [mine, setMine] = useState<Set<string | number>>(new Set(['4']))
    return (
      <Grid min={280}>
        <Example title={t('امتیاز کالا', 'A product’s score')}>
          <Stack gap={2}>
            <Stars value={4.6} count={124} />
            <Stars value={3.2} count={9} size={20} />
          </Stack>
        </Example>
        <Example title={t('امتیاز شما', 'Your score')} note="ToggleButtonGroup">
          <Stack gap={2}>
            <Label id="your-score">{t('چند ستاره؟', 'How many stars?')}</Label>
            <ToggleButtonGroup
              aria-labelledby="your-score"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={mine}
              onSelectionChange={setMine}
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
        </Example>
      </Grid>
    )
  },
}

/** A quantity: the number field's − and +, from one up to what is in stock. */
export const Quantities: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={220}>
        <Example title={t('تعداد', 'A quantity')}>
          <Quantity />
        </Example>
        <Example title={t('با برچسب', 'With its label')}>
          <NumberField defaultValue={2} minValue={1} maxValue={5}>
            <Label>{t('تعداد', 'Quantity')}</Label>
            <NumberField.Group style={{ width: 132 }}>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>
        </Example>
        <Example title={t('آخرین موجودی', 'The last one')} note={t('+ خاموش', '+ is off')}>
          <Quantity stock={1} />
        </Example>
      </Grid>
    )
  },
}

// ---- composed ------------------------------------------------------------------------------------

/** Cards side by side, each as tall as its row, so their buttons line up. */
function Shelf({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
        gap: 16,
      }}
    >
      {children}
    </div>
  )
}

/** Products on cards: one on sale, one plain, one sold out with its picture missing. */
export const ProductCards: StoryObj = {
  name: 'Product cards',
  render: () => (
    <Shelf>
      {products.map((product) => (
        <ProductTile key={product.en} product={product} />
      ))}
    </Shelf>
  ),
}

/** A line of the cart: its picture, name and kind, price, quantity and the way to remove it. */
export const CartLines: StoryObj = {
  name: 'Cart lines',
  render: function Render() {
    const t = useT()
    const lines = [products[0]!, products[1]!]
    return (
      <Stage width={640}>
        <Card>
          <Card.Header>
            <Card.Title>{t('سبد خرید', 'Your cart')}</Card.Title>
          </Card.Header>
          <Card.Content>
            <Stack gap={4}>
              {lines.map((product, i) => (
                <div key={product.en}>
                  {i ? <Separator style={{ marginBottom: 16 }} /> : null}
                  <Stack direction="horizontal" gap={3} align="center">
                    <div style={{ width: 64, flexShrink: 0, borderRadius: 12, overflow: 'hidden' }}>
                      <Image src={product.photo} alt="" ratio="1" />
                    </div>
                    <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" weight="medium">
                        {t(product.fa, product.en)}
                      </Text>
                      <Price amount={product.amount} size="sm" />
                    </Stack>
                    <Quantity initial={i + 1} />
                    <Tooltip delay={500}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="tertiary"
                        aria-label={t('برداشتن از سبد', 'Remove from cart')}
                      >
                        <Trash2 />
                      </Button>
                      <Tooltip.Content placement="top" showArrow>
                        <Tooltip.Arrow />
                        {t('برداشتن از سبد', 'Remove from cart')}
                      </Tooltip.Content>
                    </Tooltip>
                  </Stack>
                </div>
              ))}
            </Stack>
          </Card.Content>
        </Card>
      </Stage>
    )
  },
}

/** An order's summary: its lines, the total under a line, and the way to pay. */
export const OrderSummary: StoryObj = {
  name: 'An order’s summary',
  render: function Render() {
    const t = useT()
    const num = useNum()
    const line = (name: string, value: ReactNode, strong = false) => (
      <Stack direction="horizontal" justify="between" align="baseline">
        <Text size="sm" tone={strong ? 'default' : 'muted'} weight={strong ? 'semibold' : 'normal'}>
          {name}
        </Text>
        <Text
          size="sm"
          weight={strong ? 'semibold' : 'normal'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </Text>
      </Stack>
    )
    return (
      <Stage width={380}>
        <Card>
          <Card.Header>
            <Card.Title>{t('خلاصهٔ سفارش', 'Order summary')}</Card.Title>
          </Card.Header>
          <Card.Content>
            <Stack gap={2}>
              {line(
                t('کالاها (۳)', 'Items (3)'),
                t(`${num(1_472_000)} تومان`, `${num(1_472_000)} toman`),
              )}
              {line(t('تخفیف', 'Discount'), t(`−${num(64_000)} تومان`, `−${num(64_000)} toman`))}
              {line(t('ارسال', 'Delivery'), t('رایگان', 'Free'))}
              <Separator />
              {line(
                t('جمع', 'Total'),
                t(`${num(1_408_000)} تومان`, `${num(1_408_000)} toman`),
                true,
              )}
            </Stack>
          </Card.Content>
          <Card.Footer>
            <Button fullWidth>{t('پرداخت', 'Pay')}</Button>
          </Card.Footer>
        </Card>
      </Stage>
    )
  },
}

/** A product's page: its picture, name, score, price, delivery, quantity and the way to the cart. */
export const ProductPage: StoryObj = {
  name: 'A product’s page',
  render: function Render() {
    const t = useT()
    const product = products[0]!
    const Back = t('fa', 'en') === 'fa' ? ArrowRight : ArrowLeft
    return (
      <Stage width={760}>
        <Grid min={300}>
          <div style={{ borderRadius: 24, overflow: 'hidden' }}>
            <Image src={product.photo} alt={t(product.fa, product.en)} ratio="1" />
          </div>
          <Stack gap={4}>
            <Link href="#shop">
              <Link.Icon>
                <Back />
              </Link.Icon>
              {t('چای و دمنوش', 'Tea and infusions')}
            </Link>
            <Stack gap={1}>
              <Text as="h1" size="2xl" weight="semibold">
                {t(product.fa, product.en)}
              </Text>
              <Text size="sm" tone="muted">
                {t(product.helpFa, product.helpEn)}
              </Text>
            </Stack>
            <Stars value={product.score} count={product.reviews} />
            <Price amount={product.amount} was={product.was} size="lg" />
            <Stack direction="horizontal" gap={2} align="center">
              <Chip variant="soft" color="success">
                <Truck />
                <Chip.Label>{t('ارسال رایگان', 'Free delivery')}</Chip.Label>
              </Chip>
              <Text size="sm" tone="muted">
                {t('فقط ۴ عدد مانده', 'Only 4 left')}
              </Text>
            </Stack>
            <Stack direction="horizontal" gap={3} align="center" wrap>
              <Quantity stock={4} />
              <Button>{t('افزودن به سبد', 'Add to cart')}</Button>
            </Stack>
            <Link href="#size-guide" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              {t('راهنمای خرید', 'Buying guide')}
            </Link>
          </Stack>
        </Grid>
      </Stage>
    )
  },
}

// ---- everywhere they are drawn -------------------------------------------------------------------

function Two() {
  return (
    <Shelf>
      <ProductTile product={products[0]!} />
      <ProductTile product={products[2]!} />
    </Shelf>
  )
}

/** In both themes. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Two />
    </Themes>
  ),
}

/** On a Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Two />
    </Directions>
  ),
}

/** On a phone: the cards one under the other. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Stack gap={4}>
        <ProductTile product={products[0]!} />
        <ProductTile product={products[1]!} />
      </Stack>
    </Device>
  ),
}
