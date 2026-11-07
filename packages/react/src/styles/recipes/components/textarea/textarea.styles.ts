/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const textAreaVariants = tv({
  base: "textarea",
  defaultVariants: {
    fullWidth: false,
    variant: "primary",
  },
  variants: {
    fullWidth: {
      false: "",
      true: "textarea--full-width",
    },
    variant: {
      primary: "textarea--primary",
      secondary: "textarea--secondary",
    },
  },
});

export type TextAreaVariants = VariantProps<typeof textAreaVariants>;
