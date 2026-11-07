/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const buttonGroupVariants = tv({
  defaultVariants: {
    fullWidth: false,
    orientation: "horizontal",
  },
  slots: {
    base: "button-group",
    separator: "button-group__separator",
  },
  variants: {
    fullWidth: {
      false: {},
      true: {
        base: "button-group--full-width",
      },
    },
    orientation: {
      horizontal: {
        base: "button-group--horizontal",
      },
      vertical: {
        base: "button-group--vertical",
      },
    },
  },
});

export type ButtonGroupVariants = VariantProps<typeof buttonGroupVariants>;
