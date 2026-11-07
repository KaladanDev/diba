/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const radioVariants = tv({
  slots: {
    base: "radio",
    content: "radio__content",
    control: "radio__control",
    indicator: "radio__indicator",
  },
});

export type RadioVariants = VariantProps<typeof radioVariants>;
