/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const menuVariants = tv({
  base: "menu",
});

export type MenuVariants = VariantProps<typeof menuVariants>;
