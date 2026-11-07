/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const skeletonVariants = tv({
  defaultVariants: {
    animationType: "shimmer",
  },
  slots: {
    base: "skeleton",
  },
  variants: {
    animationType: {
      none: "skeleton--none",
      pulse: "skeleton--pulse",
      shimmer: "skeleton--shimmer",
    },
  },
});

export type SkeletonVariants = VariantProps<typeof skeletonVariants>;
