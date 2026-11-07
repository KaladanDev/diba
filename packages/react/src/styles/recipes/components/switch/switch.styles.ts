/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const switchVariants = tv({
  defaultVariants: {
    size: "md",
  },
  slots: {
    base: "switch",
    content: "switch__content",
    control: "switch__control",
    icon: "switch__icon",
    thumb: "switch__thumb",
  },
  variants: {
    size: {
      lg: {
        base: "switch--lg",
      },
      md: {
        base: "switch--md",
      },
      sm: {
        base: "switch--sm",
      },
    },
  },
});

export type SwitchVariants = VariantProps<typeof switchVariants>;
