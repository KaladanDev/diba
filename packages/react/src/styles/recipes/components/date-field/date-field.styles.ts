/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const dateFieldVariants = tv({
  base: "date-field",
  defaultVariants: {
    fullWidth: false,
  },
  variants: {
    fullWidth: {
      false: "",
      true: "date-field--full-width",
    },
  },
});

export type DateFieldVariants = VariantProps<typeof dateFieldVariants>;
