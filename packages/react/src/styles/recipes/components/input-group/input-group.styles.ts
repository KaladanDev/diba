/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const inputGroupVariants = tv({
  defaultVariants: {
    fullWidth: false,
    variant: "primary",
  },
  slots: {
    base: "input-group",
    input: "input-group__input",
    prefix: "input-group__prefix",
    suffix: "input-group__suffix",
  },
  variants: {
    fullWidth: {
      false: {},
      true: {
        base: "input-group--full-width",
      },
    },
    variant: {
      primary: {
        base: "input-group--primary",
      },
      secondary: {
        base: "input-group--secondary",
      },
    },
  },
});

export type InputGroupVariants = VariantProps<typeof inputGroupVariants>;
