import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inbox, PackageOpen, Search, ShoppingCart, Sparkles, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Device, Directions, Example, Grid, Stage, Themes, useT } from '../stories/kit'
import { Button, buttonVariants, Card, Link, SearchField, Stack, Table, Text } from '../index'

// What a list, a card or a page says with nothing in it, composed from Stack, Text and a button.
// The docs page is EmptyStates.mdx. A line comment, not a doc comment: the docs plugin replaces a
// commented meta's parameters with one.
const meta = {
  title: 'Patterns/Empty states',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

/**
 * An empty state: its icon 32 and muted, its title 14 on 20 and medium, its help muted, 8 apart
 * and centred, and what to do about it 16 under them; all 8 in.
 */
function Empty({
  icon: Icon,
  title,
  help,
  children,
}: {
  icon?: LucideIcon
  title: string
  help?: string
  children?: ReactNode
}) {
  return (
    <Stack align="center" gap={4} style={{ padding: 8 }}>
      <Stack align="center" gap={2}>
        {Icon ? <Icon size={32} color="var(--muted)" aria-hidden /> : null}
        <Text size="sm" weight="medium" align="center">
          {title}
        </Text>
        {help ? (
          <Text size="sm" tone="muted" align="center">
            {help}
          </Text>
        ) : null}
      </Stack>
      {children}
    </Stack>
  )
}

/** A list with nothing in it yet: the admin's orders, and the first thing to do. */
export const EmptyList: StoryObj = {
  name: 'A list with nothing yet',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={480}>
        <Card>
          <Empty
            icon={Inbox}
            title={t('هنوز سفارشی نرسیده', 'No orders yet')}
            help={t(
              'نشانی فروشگاه را بفرستید تا نخستین سفارش برسد.',
              'Share your shop to get the first one.',
            )}
          >
            <Button size="sm" variant="secondary">
              {t('رونوشت نشانی فروشگاه', 'Copy the shop’s address')}
            </Button>
          </Empty>
        </Card>
      </Stage>
    )
  },
}

/** A search that found nothing: what was looked for, and the way back. */
export const NothingFound: StoryObj = {
  name: 'Nothing found',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={480}>
        <Card>
          <Card.Header>
            <SearchField
              aria-label={t('جست‌وجوی کالا', 'Search products')}
              defaultValue={t('شال آبی', 'blue scarf')}
            >
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          </Card.Header>
          <Empty
            icon={Search}
            title={t('چیزی برای «شال آبی» پیدا نشد', 'Nothing found for “blue scarf”')}
            help={t(
              'واژهٔ دیگری بیازمایید، یا پالایه‌ها را بردارید.',
              'Try other words, or clear the filters.',
            )}
          >
            <Button size="sm" variant="secondary">
              {t('برداشتن پالایه‌ها', 'Clear the filters')}
            </Button>
          </Empty>
        </Card>
      </Stage>
    )
  },
}

/** The storefront's cart, empty: the way back to the shop, a link drawn as a button. */
export const EmptyCart: StoryObj = {
  name: 'An empty cart',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={380}>
        <Empty
          icon={ShoppingCart}
          title={t('سبد خرید خالی است', 'Your cart is empty')}
          help={t('کالایی را که می‌پسندید به سبد بیفزایید.', 'Add something you like to it.')}
        >
          <Link href="#shop" className={buttonVariants({ size: 'sm' })}>
            {t('دیدن کالاها', 'See the products')}
          </Link>
        </Empty>
      </Stage>
    )
  },
}

/** A shop's first visit: what it is for, and two ways to begin. */
export const FirstRun: StoryObj = {
  name: 'A first visit',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={560}>
        <Card variant="secondary">
          <Empty
            icon={Sparkles}
            title={t('نخستین کالای خود را بیفزایید', 'Add your first product')}
            help={t(
              'یک کالا با عکس و قیمت کافی است تا فروشگاه باز شود.',
              'One product with a picture and a price is enough to open the shop.',
            )}
          >
            <Stack direction="horizontal" gap={2} justify="center" wrap>
              <Button size="sm">{t('افزودن کالا', 'Add a product')}</Button>
              <Button size="sm" variant="tertiary">
                {t('درون‌ریزی از فایل', 'Import a file')}
              </Button>
            </Stack>
          </Empty>
        </Card>
      </Stage>
    )
  },
}

/** In a table's body, and under a card's section: the same parts, smaller where room is less. */
export const InPlace: StoryObj = {
  name: 'Inside a table and a section',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={360}>
        <Example title={t('در جدول', 'In a table')} note="renderEmptyState">
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label={t('کالاها', 'Products')}>
                <Table.Header>
                  <Table.Column isRowHeader>{t('کالا', 'Product')}</Table.Column>
                  <Table.Column align="end">{t('موجودی', 'Stock')}</Table.Column>
                </Table.Header>
                <Table.Body
                  renderEmptyState={() => (
                    <Empty
                      icon={PackageOpen}
                      title={t('کالایی نیست', 'No products')}
                      help={t('نخستین کالا را بیفزایید.', 'Add your first product.')}
                    />
                  )}
                >
                  {[]}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Example>
        <Example title={t('در بخشی از کارت', 'In a card’s section')} note={t('بی نماد', 'No icon')}>
          <Card>
            <Card.Header>
              <Card.Title>{t('یادداشت‌ها', 'Notes')}</Card.Title>
            </Card.Header>
            <Empty
              title={t('یادداشتی نیست', 'No notes')}
              help={t('یادداشت‌های کارکنان اینجا می‌آید.', 'Staff notes show here.')}
            />
          </Card>
        </Example>
      </Grid>
    )
  },
}

// ---- everywhere they are drawn -------------------------------------------------------------------

function Orders() {
  const t = useT()
  return (
    <Card>
      <Empty
        icon={Inbox}
        title={t('هنوز سفارشی نرسیده', 'No orders yet')}
        help={t('نخستین سفارش اینجا می‌آید.', 'The first one will show here.')}
      >
        <Button size="sm" variant="secondary">
          {t('رونوشت نشانی فروشگاه', 'Copy the shop’s address')}
        </Button>
      </Empty>
    </Card>
  )
}

/** In both themes. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Orders />
    </Themes>
  ),
}

/** On a Persian page and an English one. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Orders />
    </Directions>
  ),
}

/** On a phone. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Orders />
    </Device>
  ),
}
