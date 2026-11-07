/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: a chip is soft unless it is told otherwise, as the Chip block is; it
 * had been secondary, so a status chip written by hand was grey where a tree's was tinted.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const chipVariants = tv({
  defaultVariants: {
    color: "default",
    variant: "soft",
  },
  slots: {
    base: "chip",
    label: "chip__label",
  },
  variants: {
    color: {
      accent: {
        base: "chip--accent",
      },
      danger: {
        base: "chip--danger",
      },
      default: {
        base: "chip--default",
      },
      success: {
        base: "chip--success",
      },
      warning: {
        base: "chip--warning",
      },
    },
    size: {
      lg: {
        base: "chip--lg",
      },
      md: {
        base: "chip--md",
      },
      sm: {
        base: "chip--sm",
      },
    },
    variant: {
      primary: {
        base: "chip--primary",
      },
      secondary: {
        base: "chip--secondary",
      },
      soft: {
        base: "chip--soft",
      },
      tertiary: {
        base: "chip--tertiary",
      },
    },
  },
});

export type ChipVariants = VariantProps<typeof chipVariants>;
