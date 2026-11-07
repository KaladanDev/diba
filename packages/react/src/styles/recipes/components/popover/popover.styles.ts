/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const popoverVariants = tv({
  slots: {
    base: "popover",
    dialog: "popover__dialog",
    heading: "popover__heading",
    trigger: "popover__trigger",
  },
});

export type PopoverVariants = VariantProps<typeof popoverVariants>;
