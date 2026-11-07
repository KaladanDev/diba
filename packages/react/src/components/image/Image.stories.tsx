import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../../stories/kit'
import { brokenPhoto, goods } from '../../stories/people'
import { Button, Card, Chip, Stack, Table, Text } from '../../index'
import { Image, type ImageFit, type ImageRadius } from './Image'

// The Image, every option it has and what it builds. The docs page is Image.mdx. A line comment,
// not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Media/Image',
  component: Image,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Image>

export default meta

const svg = (width: number, height: number, body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${body}</svg>`,
  )}`

/** A shop's banner, three times as wide as it is tall: tea fields under a sun. */
const banner = svg(
  288,
  96,
  '<rect width="288" height="96" fill="#cfe3d8"/>' +
    '<circle cx="232" cy="30" r="14" fill="#e7c873"/>' +
    '<path d="M0 62c40-18 80-18 120-4s90 14 168-8v46H0z" fill="#5f8f6f"/>' +
    '<path d="M0 78c50-14 100-12 150 0s90 10 138-4v18H0z" fill="#2f5d46"/>' +
    '<path d="M20 76c20-6 40-6 60 0M100 82c20-6 40-6 60 0M180 80c20-6 40-6 60 0" fill="none" stroke="#a9cdb5" stroke-width="2" stroke-linecap="round"/>',
)

/** A vase, taller than it is wide. */
const vase = svg(
  96,
  160,
  '<rect width="96" height="160" fill="#f3e7da"/>' +
    '<path d="M36 22h24v10c0 6 14 14 14 44 0 34-12 64-26 64S22 110 22 76c0-30 14-38 14-44z" fill="#b5523b"/>' +
    '<path d="M28 78c12 6 28 6 40 0M30 98c12 6 24 6 36 0" fill="none" stroke="#e7c873" stroke-width="3" stroke-linecap="round"/>',
)

const pictures = {
  tea: goods.tea.photo,
  scarf: goods.scarf.photo,
  banner,
  vase,
  broken: brokenPhoto,
}
type Picture = keyof typeof pictures

/** A caption under a picture, muted. */
function Caption({ children }: { children: ReactNode }) {
  return (
    <Text size="xs" tone="muted">
      {children}
    </Text>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  picture: Picture
  ratio: string
  fit: ImageFit
  radius: ImageRadius
  isZoomable: boolean
  alt: string
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    picture: 'tea',
    ratio: '1 / 1',
    fit: 'cover',
    radius: 'md',
    isZoomable: false,
    alt: 'چای لاهیجان',
  },
  argTypes: {
    picture: {
      control: 'select',
      options: Object.keys(pictures),
      description: 'The picture: square, wide, tall, or one that does not come.',
      table: { category: 'Story' },
    },
    ratio: {
      control: 'inline-radio',
      options: ['1 / 1', '4 / 3', '16 / 9', '3 / 4', '3 / 1', 'auto'],
      description: 'The box’s width to its height, as CSS writes a ratio.',
      table: { category: 'Image', defaultValue: { summary: '1 / 1' } },
    },
    fit: {
      control: 'inline-radio',
      options: ['cover', 'contain'],
      description: 'Fill the box and crop, or show it all on the second paper.',
      table: { category: 'Image', defaultValue: { summary: 'cover' } },
    },
    radius: {
      control: 'inline-radio',
      options: ['none', 'sm', 'md', 'lg', 'full'],
      description: 'Its corners: 0, 8, 12, 16 or round.',
      table: { category: 'Image', defaultValue: { summary: 'md' } },
    },
    isZoomable: {
      control: 'boolean',
      description: 'A press opens it larger, over the page.',
      table: { category: 'Image', defaultValue: { summary: 'false' } },
    },
    alt: {
      control: 'text',
      description: 'What it shows; empty when the words beside it say it.',
      table: { category: 'Image' },
    },
  },
  render: function Render({ picture, ratio, fit, radius, isZoomable, alt }) {
    const t = useT()
    const [round, setRound] = useState(0)
    return (
      <Stage width={280}>
        <Stack gap={3} align="start">
          <Image
            key={round}
            src={pictures[picture]}
            alt={alt}
            ratio={ratio}
            fit={fit}
            radius={radius}
            isZoomable={isZoomable}
            style={{ width: 240 }}
          />
          <Button size="sm" variant="tertiary" onPress={() => setRound((n) => n + 1)}>
            {t('دوباره نشان بده', 'Show it again')}
          </Button>
        </Stack>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** The box's shape, before the picture comes. */
export const Ratios: StoryObj = {
  render: function Render() {
    return (
      <Grid min={150}>
        {['1 / 1', '4 / 3', '16 / 9', '3 / 4'].map((ratio) => (
          <Example key={ratio} title={`ratio="${ratio}"`}>
            <Image src={goods.tea.photo} alt="" ratio={ratio} />
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Fill the box and crop, or show the whole picture on the second paper. */
export const Fit: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Grid min={200}>
        {(['cover', 'contain'] as const).map((fit) => (
          <Example
            key={fit}
            title={`fit="${fit}"`}
            note={
              fit === 'cover'
                ? t('پر می‌کند و می‌بُرد', 'Fills, and crops')
                : t('همه را نشان می‌دهد', 'Shows it all')
            }
          >
            <Stack gap={3}>
              <Image src={banner} alt="" ratio="1 / 1" fit={fit} />
              <Image src={vase} alt="" ratio="16 / 9" fit={fit} />
            </Stack>
          </Example>
        ))}
      </Grid>
    )
  },
}

/** Loaded, failed with words, failed with none, and given a fallback of its own. */
export const States: StoryObj = {
  render: function Render() {
    const t = useT()
    const [round, setRound] = useState(0)
    return (
      <Grid min={150}>
        <Example
          title={t('رسیده', 'Loaded')}
          note={t('در ۴۰۰ میلی‌ثانیه پیدا می‌شود', 'Fades in over 400ms')}
        >
          <Stack gap={2} align="start">
            <Image
              key={round}
              src={goods.scarf.photo}
              alt={t(goods.scarf.fa, goods.scarf.en)}
              style={{ width: '100%' }}
            />
            <Button size="sm" variant="tertiary" onPress={() => setRound((n) => n + 1)}>
              {t('دوباره', 'Again')}
            </Button>
          </Stack>
        </Example>
        <Example title={t('نرسید', 'Failed')} note={t('می‌گوید چه بود', 'Says what it was of')}>
          <Image src={brokenPhoto} alt={t('گلدان سفالی لالجین', 'Lalejin clay vase')} />
        </Example>
        <Example title={t('نرسید، بی‌نام', 'Failed, decorative')} note='alt=""'>
          <Image src={brokenPhoto} alt="" />
        </Example>
        <Example title={t('جایگزین خودش', 'Its own fallback')} note="fallback">
          <Image
            src={brokenPhoto}
            alt=""

            fallback={
              <Stack gap={1} align="center">
                <Text size="sm" weight="medium">
                  {t('عکسی نیست', 'No picture')}
                </Text>
                <Caption>{t('عکس کالا را بیفزایید', 'Add the product’s photo')}</Caption>
              </Stack>
            }
          />
        </Example>
      </Grid>
    )
  },
}

/** Its five radii, the block's on both platforms; 12 unless it is told. */
export const Corners: StoryObj = {
  render: function Render() {
    return (
      <Grid min={130}>
        {(
          [
            ['none', 0],
            ['sm', 8],
            ['md', 12],
            ['lg', 16],
            ['full', 9999],
          ] as const
        ).map(([name, radius]) => (
          <Example key={name} title={`radius="${name}"`} note={`${radius}px`}>
            <Image src={goods.scarf.photo} alt="" radius={name} />
          </Example>
        ))}
      </Grid>
    )
  },
}

/** A press opens the picture larger, over the page: a product's photo on its own page. */
export const Zoomable: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Stage width={240}>
        <Stack gap={2}>
          <Image src={goods.scarf.photo} alt={t(goods.scarf.fa, goods.scarf.en)} isZoomable />
          <Caption>{t('برای بزرگ‌نمایی بزنید.', 'Press it to see it larger.')}</Caption>
        </Stack>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

const shelf = [
  {
    photo: goods.tea.photo,
    fa: goods.tea.fa,
    en: goods.tea.en,
    price: '256,000',
    priceFa: '۲۵۶٬۰۰۰',
  },
  {
    photo: goods.scarf.photo,
    fa: goods.scarf.fa,
    en: goods.scarf.en,
    price: '960,000',
    priceFa: '۹۶۰٬۰۰۰',
  },
  { photo: brokenPhoto, fa: 'گلدان سفالی', en: 'Clay vase', price: '410,000', priceFa: '۴۱۰٬۰۰۰' },
]

/** A product on a card, its picture flush along the top; one whose picture did not come. */
function Tile({ item }: { item: (typeof shelf)[number] }) {
  const t = useT()
  return (
    <Card style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
      <a href={`#${item.en}`} aria-label={t(item.fa, item.en)} style={{ display: 'block' }}>
        <Image
          src={item.photo}
          alt=""
          radius="none"
          fallback={<Caption>{t(item.fa, item.en)}</Caption>}
        />
      </a>
      <Stack gap={1} style={{ padding: '0 16px 16px' }}>
        <Card.Title>{t(item.fa, item.en)}</Card.Title>
        <Text size="sm" weight="semibold">
          {t(`${item.priceFa} تومان`, `${item.price} toman`)}
        </Text>
      </Stack>
    </Card>
  )
}

/** The storefront's shelf: a card a product, its picture flush along the top and the way in. */
export const Shelf: StoryObj = {
  name: 'Example: a storefront’s shelf',
  render: () => (
    <Grid min={180}>
      {shelf.map((item) => (
        <Tile key={item.en} item={item} />
      ))}
    </Grid>
  ),
}

/** The admin's products, a small square picture at the start of each row. */
export const ProductsTable: StoryObj = {
  name: 'Example: products in a table',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={560}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label={t('کالاها', 'Products')}>
              <Table.Header>
                <Table.Column isRowHeader>{t('کالا', 'Product')}</Table.Column>
                <Table.Column align="end">{t('قیمت (تومان)', 'Price (toman)')}</Table.Column>
              </Table.Header>
              <Table.Body>
                {shelf.map((item) => (
                  <Table.Row key={item.en} id={item.en}>
                    <Table.Cell>
                      <Stack direction="horizontal" gap={3} align="center">
                        <Image
                          src={item.photo}
                          alt=""
                          radius="sm"
                          style={{ width: 40, flexShrink: 0 }}
                        />
                        {t(item.fa, item.en)}
                      </Stack>
                    </Table.Cell>
                    <Table.Cell align="end">{t(item.priceFa, item.price)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Stage>
    )
  },
}

/** The admin's storefront settings: the shop's banner, wide, with the ways to change it. */
export const ShopBanner: StoryObj = {
  name: 'Example: a shop’s banner',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={560}>
        <Card>
          <Card.Header>
            <Card.Title>{t('بنر فروشگاه', 'Shop banner')}</Card.Title>
            <Card.Description>
              {t(
                'بالای ویترین نشان داده می‌شود؛ سه برابر پهنا به بلندا.',
                'Shown across the top of the storefront; three times as wide as it is tall.',
              )}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Image src={banner} alt={t('بنر فروشگاه', 'Shop banner')} ratio="3 / 1" />
          </Card.Content>
          <Card.Footer>
            <Stack direction="horizontal" gap={2}>
              <Button size="sm" variant="secondary">
                {t('جایگزینی', 'Replace')}
              </Button>
              <Button size="sm" variant="tertiary">
                {t('برداشتن', 'Remove')}
              </Button>
            </Stack>
          </Card.Footer>
        </Card>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Pair() {
  return (
    <Grid min={120}>
      <Tile item={shelf[1]!} />
      <Tile item={shelf[2]!} />
    </Grid>
  )
}

/** In both themes: the second paper under a picture that did not come. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Pair />
    </Themes>
  ),
}

/** On a Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Pair />
    </Directions>
  ),
}

/** On a phone, two to a row. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Pair />
    </Device>
  ),
}

/** Two pictures as a tree: one that comes, 12 round by default, and one that does not, 16 round. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 3 },
      children: [
        {
          type: 'Image',
          props: { src: banner, alt: t('بنر فروشگاه', 'Shop banner') },
        },
        {
          type: 'Image',
          props: {
            src: brokenPhoto,
            alt: t('گلدان سفالی', 'Clay vase'),
            ratio: '3/1',
            radius: 'lg',
          },
        },
      ],
    }
    // The tree as written, its pictures' long data addresses shortened to be read.
    const shown = {
      ...tree,
      children: tree.children.map((c, i) => ({
        ...c,
        props: { ...c.props, src: ['/shop/banner.png', '/goods/vase.png'][i] },
      })),
    }
    return (
      <Grid min={320}>
        <Example
          title={t('آنچه کشیده می‌شود', 'What is drawn')}
          note={t('در وب و در Flutter', 'On the web and in Flutter')}
        >
          <div style={{ width: 280 }}>
            <DibaSurface tree={tree as never} />
          </div>
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
            {JSON.stringify(shown, null, 2)}
          </pre>
        </Example>
      </Grid>
    )
  },
}
