import type { Meta, StoryObj } from '@storybook/react-vite'
import { useT } from '../stories/kit'
import { TreeDemo } from '../stories/sdui'

// What the renderer refuses, the rule for addresses, the limits, and what only the schema sees. The
// docs page is Safety.mdx. A line comment, not a doc comment: the docs plugin replaces a commented
// meta's parameters with one.
const meta = {
  title: 'SDUI/Safety',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

/** A panel written with worse intentions: four things the renderer will not do. */
export const WhatItRefuses: StoryObj = {
  name: 'What the renderer refuses',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 4, className: 'fixed inset-0 z-50 bg-white' },
      children: [
        {
          type: 'Text',
          props: { weight: 'bold' },
          children: t('به‌روزرسانی حساب', 'Update your account'),
        },
        {
          type: 'Button',
          props: { variant: 'danger' },
          children: t('تأیید', 'Confirm'),
          actions: { onPress: { do: 'navigate', to: 'javascript:steal(document.cookie)' } },
        },
        { type: 'ScriptTag', props: { src: 'https://evil.example/x.js' } },
        {
          type: 'Text',
          children: t('متن', 'Words'),
          actions: { onPress: { do: 'call', action: 'exfiltrate' } },
        },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** Every prop is a real one; only the values are wrong, which the renderer cannot see. */
export const WhatOnlyValidationCatches: StoryObj = {
  name: 'What only the schema sees',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 4 },
      children: [
        {
          type: 'Text',
          props: { size: 'enormous' },
          children: t('اندازهٔ نادرست', 'A size that is not one'),
        },
        {
          type: 'Button',
          props: { variant: 'nonsense' },
          children: t('دکمهٔ بی‌رنگ', 'A colourless button'),
        },
        { type: 'TextField', props: { placeholder: t('بی برچسب', 'No label') } },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** Addresses, each held to the rule: a link, a picture and a place to go. */
export const Addresses: StoryObj = {
  name: 'The address rule',
  render: function Render() {
    const t = useT()
    const link = (href: string) => ({
      type: 'Link',
      props: { href },
      children: href,
    })
    const tree = {
      type: 'Stack',
      props: { gap: 2 },
      children: [
        link('https://kaladan.shop/help'),
        link('/orders/1041'),
        link('mailto:help@kaladan.shop'),
        link('tel:+982100000000'),
        link('javascript:alert(1)'),
        link('ftp://files.example/x'),
        {
          type: 'Image',
          props: {
            src: 'javascript:alert(1)',
            alt: t('عکسی که رد شد', 'A refused picture'),
            ratio: '4/1',
          },
        },
        {
          type: 'Button',
          props: { size: 'sm' },
          children: t('رفتن به data:', 'Go to data:'),
          actions: { onPress: { do: 'navigate', to: 'data:text/html,<script>alert(1)</script>' } },
        },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** A tree past the host's limit: refused whole, nothing drawn. */
export const Limits: StoryObj = {
  render: function Render() {
    const t = useT()
    let node: Record<string, unknown> = { type: 'Text', children: t('ته درخت', 'The bottom') }
    for (let i = 0; i < 6; i++) node = { type: 'Stack', children: [node] }
    return <TreeDemo tree={node} limits={{ depth: 4, nodes: 500 }} />
  },
}
