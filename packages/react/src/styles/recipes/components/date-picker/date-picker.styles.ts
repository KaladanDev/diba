/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const datePickerVariants = tv({
  slots: {
    base: "date-picker",
    popover: "date-picker__popover",
    trigger: "date-picker__trigger",
    triggerIndicator: "date-picker__trigger-indicator",
  },
});

export type DatePickerVariants = VariantProps<typeof datePickerVariants>;
