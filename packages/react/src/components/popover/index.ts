/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {
  PopoverArrow,
  PopoverContent,
  PopoverDialog,
  PopoverHeading,
  PopoverRoot,
  PopoverTrigger,
} from "./popover";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Dialog: PopoverDialog,
  Arrow: PopoverArrow,
  Content: PopoverContent,
  Heading: PopoverHeading,
});

export type Popover = {
  Props: ComponentProps<typeof PopoverRoot>;
  RootProps: ComponentProps<typeof PopoverRoot>;
  TriggerProps: ComponentProps<typeof PopoverTrigger>;
  DialogProps: ComponentProps<typeof PopoverDialog>;
  ArrowProps: ComponentProps<typeof PopoverArrow>;
  ContentProps: ComponentProps<typeof PopoverContent>;
  HeadingProps: ComponentProps<typeof PopoverHeading>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {PopoverArrow, PopoverContent, PopoverDialog, PopoverHeading, PopoverRoot, PopoverTrigger};

export type {
  PopoverRootProps,
  PopoverRootProps as PopoverProps,
  PopoverTriggerProps,
  PopoverDialogProps,
  PopoverArrowProps,
  PopoverContentProps,
  PopoverHeadingProps,
} from "./popover";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {popoverVariants} from "../../styles/recipes";

export type {PopoverVariants} from "../../styles/recipes";
