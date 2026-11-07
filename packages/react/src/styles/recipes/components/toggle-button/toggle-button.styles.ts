/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const toggleButtonVariants = tv({
  base: "toggle-button",
  defaultVariants: {
    isIconOnly: false,
    size: "md",
    variant: "default",
  },
  variants: {
    isIconOnly: {
      true: "toggle-button--icon-only",
    },
    size: {
      lg: "toggle-button--lg",
      md: "toggle-button--md",
      sm: "toggle-button--sm",
    },
    variant: {
      default: "toggle-button--default",
      ghost: "toggle-button--ghost",
    },
  },
});

export type ToggleButtonVariants = VariantProps<typeof toggleButtonVariants>;
