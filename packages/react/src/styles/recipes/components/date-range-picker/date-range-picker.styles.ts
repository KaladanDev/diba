/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const dateRangePickerVariants = tv({
  slots: {
    base: "date-range-picker",
    popover: "date-range-picker__popover",
    rangeSeparator: "date-range-picker__range-separator",
    trigger: "date-range-picker__trigger",
    triggerIndicator: "date-range-picker__trigger-indicator",
  },
});

export type DateRangePickerVariants = VariantProps<typeof dateRangePickerVariants>;
