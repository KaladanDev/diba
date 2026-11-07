/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const radioGroupVariants = tv({
  base: "radio-group",
  defaultVariants: {
    variant: "primary",
  },
  variants: {
    variant: {
      primary: "radio-group--primary",
      secondary: "radio-group--secondary",
    },
  },
});

export type RadioGroupVariants = VariantProps<typeof radioGroupVariants>;
