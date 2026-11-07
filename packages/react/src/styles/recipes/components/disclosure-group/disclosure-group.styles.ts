/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const disclosureGroupVariants = tv({
  defaultVariants: {},
  slots: {
    base: "disclosure-group",
  },
  variants: {},
});

export type DisclosureGroupVariants = VariantProps<typeof disclosureGroupVariants>;
