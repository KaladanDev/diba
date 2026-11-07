/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const timeFieldVariants = tv({
  base: "time-field",
  defaultVariants: {
    fullWidth: false,
  },
  variants: {
    fullWidth: {
      false: "",
      true: "time-field--full-width",
    },
  },
});

export type TimeFieldVariants = VariantProps<typeof timeFieldVariants>;
