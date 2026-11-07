/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const inputVariants = tv({
  base: "input",
  defaultVariants: {
    fullWidth: false,
    variant: "primary",
  },
  variants: {
    fullWidth: {
      false: "",
      true: "input--full-width",
    },
    variant: {
      primary: "input--primary",
      secondary: "input--secondary",
    },
  },
});

export type InputVariants = VariantProps<typeof inputVariants>;
