import type { Meta, StoryObj } from '@storybook/react-vite'
import { useT } from '../stories/kit'
import { TreeDemo } from '../stories/sdui'

// What a server-driven surface is: a tree of Diba's blocks, sent as JSON, drawn by the host with
// its own components, on the web and in Flutter. The docs page is Introduction.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'SDUI/Introduction',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

/** A first tree: words, a field the merchant fills, and a button that tells the server. */
export const FirstTree: StoryObj = {
  name: 'A first tree',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 3 },
      children: [
        {
          type: 'Text',
          props: { size: 'lg', weight: 'semibold' },
          children: t('برچسب ارسال', 'Shipping label'),
        },
        {
          type: 'Text',
          props: { tone: 'muted', size: 'sm' },
          children: t('سفارش ۱۰۴۱ · تیپاکس', 'Order 1041 · Tipax'),
        },
        {
          type: 'NumberField',
          props: { label: t('وزن بسته (گرم)', 'Parcel weight (g)'), minValue: 1 },
          actions: { onChange: { do: 'setState', key: 'weight' } },
        },
        {
          type: 'Button',
          props: { variant: 'primary', fullWidth: true },
          children: t('چاپ برچسب', 'Print the label'),
          actions: {
            onPress: [
              { do: 'call', action: 'label.print', with: ['weight'] },
              { do: 'toast', status: 'success', title: t('برچسب چاپ شد', 'Label printed') },
            ],
          },
        },
      ],
    }
    return <TreeDemo tree={tree} />
  },
}
