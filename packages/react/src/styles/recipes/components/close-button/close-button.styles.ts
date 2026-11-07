/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const closeButtonVariants = tv({
  base: "close-button",
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "close-button--default",
    },
  },
});

export type CloseButtonVariants = VariantProps<typeof closeButtonVariants>;
