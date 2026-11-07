/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const alertVariants = tv({
  defaultVariants: {
    status: "default",
  },
  slots: {
    base: "alert",
    content: "alert__content",
    description: "alert__description",
    indicator: "alert__indicator",
    title: "alert__title",
  },
  variants: {
    status: {
      accent: {
        base: "alert--accent",
      },
      danger: {
        base: "alert--danger",
      },
      default: {
        base: "alert--default",
      },
      success: {
        base: "alert--success",
      },
      warning: {
        base: "alert--warning",
      },
    },
  },
});

export type AlertVariants = VariantProps<typeof alertVariants>;
