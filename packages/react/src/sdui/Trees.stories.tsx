import type { Meta, StoryObj } from '@storybook/react-vite'
import { useT } from '../stories/kit'
import { TreeDemo } from '../stories/sdui'

// What a tree is made of: a node's five keys, its children and slots, its props, and its words.
// The docs page is Trees.mdx. A line comment, not a doc comment: the docs plugin replaces a
// commented meta's parameters with one.
const meta = {
  title: 'SDUI/Trees',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

/** A node with all five keys: a card with its words as children and a button in a slot. */
export const Anatomy: StoryObj = {
  name: 'A node',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Card',
      props: { variant: 'secondary' },
      children: [
        {
          type: 'Text',
          props: { weight: 'semibold' },
          children: t('موجودی کم است', 'Stock is low'),
        },
        {
          type: 'Text',
          props: { size: 'sm', tone: 'muted' },
          children: t('۳ شال ابریشم مانده است.', '3 silk scarves left.'),
        },
      ],
      slots: {
        footer: {
          type: 'Button',
          props: { size: 'sm' },
          children: t('سفارش دوباره', 'Reorder'),
          actions: { onPress: { do: 'call', action: 'stock.reorder' } },
        },
      },
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** Words as children, blocks as children, and a cell that takes either. */
export const Children: StoryObj = {
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 3 },
      children: [
        { type: 'Text', children: t('متن، فرزند یک بلوک متنی', 'Words, a text block’s child') },
        {
          type: 'Stack',
          props: { direction: 'horizontal', gap: 2 },
          children: [
            { type: 'Chip', props: { color: 'success' }, children: t('پرداخت‌شده', 'Paid') },
            { type: 'Chip', props: { color: 'warning' }, children: t('در راه', 'On its way') },
          ],
        },
        {
          type: 'Table',
          props: { label: t('سفارش‌ها', 'Orders'), variant: 'secondary' },
          children: [
            {
              type: 'TableHeader',
              children: [
                {
                  type: 'Column',
                  props: { id: 'order', isRowHeader: true },
                  children: t('سفارش', 'Order'),
                },
                { type: 'Column', props: { id: 'state' }, children: t('وضعیت', 'State') },
              ],
            },
            {
              type: 'TableBody',
              children: [
                {
                  type: 'Row',
                  props: { id: '1041' },
                  children: [
                    { type: 'Cell', children: '۱۰۴۱' },
                    {
                      type: 'Cell',
                      children: [
                        {
                          type: 'Chip',
                          props: { color: 'success' },
                          children: t('ارسال شد', 'Sent'),
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** Props of each kind: an enum, a number, a flag, a list, a pair, a space and an icon. */
export const Props: StoryObj = {
  name: 'Props',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 4 },
      children: [
        {
          type: 'Button',
          props: { variant: 'secondary', size: 'sm', isDisabled: false, icon: 'printer' },
          children: t('چاپ', 'Print'),
        },
        {
          type: 'Slider',
          props: {
            label: t('بازهٔ قیمت', 'Price range'),
            isRange: true,
            defaultValue: [20, 80],
            step: 10,
          },
        },
        {
          type: 'ColorSwatchPicker',
          props: {
            label: t('رنگ', 'Colour'),
            colors: ['#c9821f', '#1f7a5c', '#2f78b5'],
            defaultValue: '#1f7a5c',
          },
        },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** A node the tree omits a prop of takes the manifest's default: a Button here is secondary, small. */
export const Defaults: StoryObj = {
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 2 },
      children: [
        { type: 'Button', children: t('بی ویژگی', 'No props') },
        {
          type: 'Button',
          props: { variant: 'primary', size: 'md' },
          children: t('با ویژگی', 'Given props'),
        },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** The server sends the words; Diba says its own in the page's language. */
export const Words: StoryObj = {
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Form',
      actions: { onSubmit: { do: 'call', action: 'customer.save' } },
      children: [
        {
          type: 'TextField',
          props: { label: t('ایمیل', 'Email'), name: 'email', type: 'email', isRequired: true },
        },
        {
          type: 'Button',
          props: { type: 'submit', variant: 'primary' },
          children: t('ذخیره', 'Save'),
        },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}
