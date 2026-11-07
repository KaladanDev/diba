import type { DibaNode } from '../dist/index'

/**
 * A sample SDUI document, typed by the GENERATED contract. This file exists to
 * prove the codegen output is sound: if a manifest change breaks the types,
 * `tsc` fails here. It also doubles as a usage example.
 *
 * An app server would emit a tree like this; the host validates it
 * against the generated JSON Schema, then renders it with the platform renderer.
 */
export const productCta: DibaNode = {
  type: 'Stack',
  props: { direction: 'vertical', gap: 4, align: 'stretch' },
  children: [
    { type: 'Text', props: { size: '2xl', weight: 'bold' }, children: 'شال ابریشمی دیبا' },
    { type: 'Text', props: { tone: 'muted' }, children: 'نقش جهان · ابریشم خالص' },
    {
      type: 'Button',
      props: { variant: 'primary', size: 'lg', fullWidth: true },
      children: 'افزودن به سبد',
      actions: {
        onPress: [
          { do: 'call', action: 'cart.add' },
          { do: 'toast', status: 'success', title: 'به سبد افزوده شد' },
        ],
      },
    },
  ],
}
