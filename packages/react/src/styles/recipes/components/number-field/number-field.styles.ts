/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const numberFieldVariants = tv({
  defaultVariants: {
    fullWidth: false,
    variant: "primary",
  },
  slots: {
    base: "number-field",
    decrementButton: "number-field__decrement-button",
    group: "number-field__group",
    incrementButton: "number-field__increment-button",
    input: "number-field__input",
  },
  variants: {
    fullWidth: {
      false: {},
      true: {
        base: "number-field--full-width",
        group: "number-field__group--full-width",
      },
    },
    variant: {
      primary: {
        base: "number-field--primary",
      },
      secondary: {
        base: "number-field--secondary",
      },
    },
  },
});

export type NumberFieldVariants = VariantProps<typeof numberFieldVariants>;
