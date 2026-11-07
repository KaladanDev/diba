/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const selectVariants = tv({
  defaultVariants: {
    fullWidth: false,
    variant: "primary",
  },
  slots: {
    base: "select",
    clearButton: "select__clear-button",
    indicator: "select__indicator",
    popover: "select__popover",
    trigger: "select__trigger",
    value: "select__value",
  },
  variants: {
    fullWidth: {
      false: {},
      true: {
        base: "select--full-width",
        trigger: "select__trigger--full-width",
      },
    },
    variant: {
      primary: {
        base: "select--primary",
      },
      secondary: {
        base: "select--secondary",
      },
    },
  },
});

export type SelectVariants = VariantProps<typeof selectVariants>;
