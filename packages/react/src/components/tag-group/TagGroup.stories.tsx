import type { Meta, StoryObj } from '@storybook/react-vite'
import { Flame, Gift, Leaf } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Key, Selection } from 'react-aria-components'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { Description } from '../description'
import { ErrorMessage } from '../error-message'
import { Input } from '../input'
import { Label } from '../label'
import { Tag } from '../tag'
import { TextField } from '../textfield'
import { TagGroup } from './index'

// The TagGroup and its Tag, every option they have and what they are built into. The docs page is
// TagGroup.mdx. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta: Meta = {
  title: 'Components/Collections/TagGroup',
  component: TagGroup,
  parameters: { layout: 'fullscreen' },
}

export default meta

/** Examples down the page, 20 apart, as wide as a form's column. */
function Column({ children, width = 420 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

const FILTERS = [
  { id: 'new', fa: 'تازه', en: 'New' },
  { id: 'sale', fa: 'حراج', en: 'On sale' },
  { id: 'handmade', fa: 'دست‌ساز', en: 'Handmade' },
  { id: 'gift', fa: 'هدیه', en: 'Gift' },
  { id: 'organic', fa: 'ارگانیک', en: 'Organic' },
]

const keys = (selection: Selection) => (selection === 'all' ? ['all'] : [...selection].map(String))

/** The filters, each a tag. */
function Filters({ disabled }: { disabled?: string }) {
  const t = useT()
  return (
    <TagGroup.List>
      {FILTERS.map((f) => (
        <Tag key={f.id} id={f.id} textValue={t(f.fa, f.en)} isDisabled={f.id === disabled}>
          {t(f.fa, f.en)}
        </Tag>
      ))}
    </TagGroup.List>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  selectionMode: 'none' | 'single' | 'multiple'
  removable: boolean
  size: 'sm' | 'md' | 'lg'
  variant: 'default' | 'surface'
  disallowEmptySelection: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    selectionMode: 'multiple',
    removable: false,
    size: 'md',
    variant: 'default',
    disallowEmptySelection: false,
  },
  argTypes: {
    selectionMode: {
      control: 'inline-radio',
      options: ['none', 'single', 'multiple'],
      description: 'Tags that only show, or one chosen, or several.',
      table: { category: 'TagGroup', defaultValue: { summary: 'none' } },
    },
    removable: {
      description: 'onRemove given: each tag takes a remove button.',
      table: { category: 'Example' },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: '28, 32 or 36 tall.',
      table: { category: 'TagGroup', defaultValue: { summary: 'md' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'surface'],
      description: 'surface for tags on a grey card: the surface, outlined.',
      table: { category: 'TagGroup', defaultValue: { summary: 'default' } },
    },
    disallowEmptySelection: { table: { category: 'TagGroup', defaultValue: { summary: 'false' } } },
  },
  render: function Render(args) {
    const t = useT()
    const [tags, setTags] = useState(FILTERS)
    const [selected, setSelected] = useState<Selection>(new Set(['sale']))
    return (
      <Stage width={480} surface={args.variant === 'surface'}>
        <Column>
          <TagGroup
            selectionMode={args.selectionMode}
            selectedKeys={selected}
            onSelectionChange={setSelected}
            disallowEmptySelection={args.disallowEmptySelection}
            size={args.size}
            variant={args.variant}
            onRemove={
              args.removable
                ? (removed) => setTags((now) => now.filter((f) => !removed.has(f.id)))
                : undefined
            }
          >
            <Label>{t('فیلترها', 'Filters')}</Label>
            <TagGroup.List>
              {tags.map((f) => (
                <Tag key={f.id} id={f.id} textValue={t(f.fa, f.en)}>
                  {t(f.fa, f.en)}
                </Tag>
              ))}
            </TagGroup.List>
          </TagGroup>
          <Value label="selectedKeys" value={keys(selected)} />
          <Value label="tags" value={tags.map((f) => f.id)} />
        </Column>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Small, medium and large. */
export const Sizes: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Column>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <TagGroup
            key={size}
            aria-label={t('فیلترها', 'Filters')}
            size={size}
            selectionMode="multiple"
            defaultSelectedKeys={['sale']}
          >
            <Filters />
          </TagGroup>
        ))}
      </Column>
    )
  },
}

/** Only shown; one chosen; several chosen, each with a tick. */
export const Choosing: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <Example title={t('فقط نمایش', 'Only shown')} note='selectionMode="none"'>
          <TagGroup aria-label={t('ویژگی‌ها', 'Features')}>
            <Filters />
          </TagGroup>
        </Example>
        <Example title={t('یکی', 'One')} note='selectionMode="single"'>
          <TagGroup
            aria-label={t('فیلترها', 'Filters')}
            selectionMode="single"
            defaultSelectedKeys={['new']}
          >
            <Filters />
          </TagGroup>
        </Example>
        <Example title={t('چندتا', 'Several')} note='selectionMode="multiple"'>
          <TagGroup
            aria-label={t('فیلترها', 'Filters')}
            selectionMode="multiple"
            defaultSelectedKeys={['sale', 'gift']}
          >
            <Filters disabled="organic" />
          </TagGroup>
        </Example>
      </Column>
    )
  },
}

/** A remove button on each, when the group takes onRemove. */
export const Removing: StoryObj = {
  render: function Render() {
    const t = useT()
    const [words, setWords] = useState([
      { id: 'silk', fa: 'ابریشم', en: 'silk' },
      { id: 'yazd', fa: 'یزد', en: 'Yazd' },
      { id: 'termeh', fa: 'ترمه', en: 'termeh' },
    ])
    return (
      <Column>
        <TagGroup
          aria-label={t('کلیدواژه‌ها', 'Keywords')}
          onRemove={(removed) => setWords((now) => now.filter((w) => !removed.has(w.id)))}
        >
          <TagGroup.List
            renderEmptyState={() => (
              <span className="text-muted" style={{ fontSize: 14 }}>
                {t('هنوز کلیدواژه‌ای نیست.', 'No keywords yet.')}
              </span>
            )}
          >
            {words.map((w) => (
              <Tag key={w.id} id={w.id} textValue={t(w.fa, w.en)}>
                {t(w.fa, w.en)}
              </Tag>
            ))}
          </TagGroup.List>
        </TagGroup>
        <Value label="tags" value={words.map((w) => w.id)} />
      </Column>
    )
  },
}

/** An icon before the words; and a tag that opens a page. */
export const IconsAndLinks: StoryObj = {
  name: 'Icons and links',
  render: function Render() {
    const t = useT()
    return (
      <Column>
        <TagGroup
          aria-label={t('برچسب‌های محصول', 'Product labels')}
          selectionMode="multiple"
          defaultSelectedKeys={['gift']}
        >
          <TagGroup.List>
            <Tag id="hot" textValue={t('پرفروش', 'Best-selling')}>
              <Flame />
              {t('پرفروش', 'Best-selling')}
            </Tag>
            <Tag id="gift" textValue={t('هدیه', 'Gift')}>
              <Gift />
              {t('هدیه', 'Gift')}
            </Tag>
            <Tag id="organic" textValue={t('ارگانیک', 'Organic')}>
              <Leaf />
              {t('ارگانیک', 'Organic')}
            </Tag>
          </TagGroup.List>
        </TagGroup>
        <TagGroup aria-label={t('دسته‌ها', 'Categories')}>
          <TagGroup.List>
            <Tag id="scarves" href="#scarves" textValue={t('شال و روسری', 'Scarves')}>
              {t('شال و روسری', 'Scarves')}
            </Tag>
            <Tag id="tea" href="#tea" textValue={t('چای', 'Tea')}>
              {t('چای', 'Tea')}
            </Tag>
          </TagGroup.List>
        </TagGroup>
      </Column>
    )
  },
}

/** Help under the group, and an error in its place. */
export const HelpAndError: StoryObj = {
  name: 'Help and an error',
  render: function Render() {
    const t = useT()
    const [selected, setSelected] = useState<Selection>(new Set())
    const none = selected !== 'all' && selected.size === 0
    return (
      <Column>
        <TagGroup selectionMode="multiple" selectedKeys={selected} onSelectionChange={setSelected}>
          <Label>{t('دسته‌ها', 'Categories')}</Label>
          <Filters />
          <Description>
            {t('محصول در این‌ها دیده می‌شود.', 'The product shows under these.')}
          </Description>
          {none ? (
            <ErrorMessage>{t('دست‌کم یکی را برگزینید.', 'Choose one at least.')}</ErrorMessage>
          ) : null}
        </TagGroup>
      </Column>
    )
  },
}

/** On a grey card, the surface variant: the surface, outlined. */
export const OnASurface: StoryObj = {
  name: 'On a grey surface',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={480} surface>
        <TagGroup
          aria-label={t('فیلترها', 'Filters')}
          variant="surface"
          selectionMode="multiple"
          defaultSelectedKeys={['new']}
        >
          <Filters />
        </TagGroup>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** A product's keywords: typed and added with Enter, removed from their tags. */
export const Keywords: StoryObj = {
  name: 'Example: a product’s keywords',
  render: function Render() {
    const t = useT()
    const [words, setWords] = useState<string[]>([t('ابریشم', 'silk'), t('دست‌باف', 'hand-woven')])
    const [draft, setDraft] = useState('')
    const add = () => {
      const word = draft.trim()
      if (word && !words.includes(word)) setWords((now) => [...now, word])
      setDraft('')
    }
    return (
      <Stage width={480} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
          <TextField
            value={draft}
            onChange={setDraft}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          >
            <Label>{t('کلیدواژه‌ها', 'Keywords')}</Label>
            <Input placeholder={t('بنویسید و Enter بزنید', 'Type and press Enter')} />
          </TextField>
          <TagGroup
            aria-label={t('کلیدواژه‌ها', 'Keywords')}
            onRemove={(removed: Set<Key>) => setWords((now) => now.filter((w) => !removed.has(w)))}
          >
            <TagGroup.List>
              {words.map((w) => (
                <Tag key={w} id={w} textValue={w}>
                  {w}
                </Tag>
              ))}
            </TagGroup.List>
          </TagGroup>
          <Value label="keywords" value={words} />
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <div style={{ width: 300, maxWidth: '100%' }}>
      <TagGroup selectionMode="multiple" defaultSelectedKeys={['sale', 'gift']}>
        <Label>{t('فیلترها', 'Filters')}</Label>
        <Filters />
      </TagGroup>
    </div>
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

/** A Persian page and an English one: the tags from the page's start, wrapping. */
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

/** The same group as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'TagGroup',
      props: {
        label: t('فیلترها', 'Filters'),
        selectionMode: 'multiple',
        defaultSelectedKeys: ['sale'],
        description: t('محصول در این‌ها دیده می‌شود.', 'The product shows under these.'),
      },
      children: FILTERS.slice(0, 4).map((f) => ({
        type: 'Tag',
        props: { id: f.id },
        children: t(f.fa, f.en),
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
