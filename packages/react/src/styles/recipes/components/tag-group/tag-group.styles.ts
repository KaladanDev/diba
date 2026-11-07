/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const tagGroupVariants = tv({
  slots: {
    base: "tag-group",
    list: "tag-group__list",
  },
});

export type TagGroupVariants = VariantProps<typeof tagGroupVariants>;
