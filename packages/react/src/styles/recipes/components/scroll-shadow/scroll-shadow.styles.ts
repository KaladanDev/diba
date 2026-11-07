/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const scrollShadowVariants = tv({
  defaultVariants: {
    hideScrollBar: false,
    orientation: "vertical",
    variant: "fade",
  },
  slots: {
    base: "scroll-shadow",
  },
  variants: {
    hideScrollBar: {
      false: {},
      true: {
        base: "scroll-shadow--hide-scrollbar",
      },
    },
    orientation: {
      horizontal: {
        base: "scroll-shadow--horizontal",
      },
      vertical: {
        base: "scroll-shadow--vertical",
      },
    },
    variant: {
      fade: {
        base: "scroll-shadow--fade",
      },
    },
  },
});

export type ScrollShadowVariants = VariantProps<typeof scrollShadowVariants>;
