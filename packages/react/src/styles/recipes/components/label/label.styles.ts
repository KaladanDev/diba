/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const labelVariants = tv({
  base: "label",
  defaultVariants: {
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
  },
  variants: {
    isDisabled: {
      true: "label--disabled",
    },
    isInvalid: {
      true: "label--invalid",
    },
    isRequired: {
      true: "label--required",
    },
  },
});

export type LabelVariants = VariantProps<typeof labelVariants>;
