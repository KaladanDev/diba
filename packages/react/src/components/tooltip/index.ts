/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {TooltipArrow, TooltipContent, TooltipRoot, TooltipTrigger} from "./tooltip";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Tooltip = Object.assign(TooltipRoot, {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
});

export type Tooltip = {
  Props: ComponentProps<typeof TooltipRoot>;
  RootProps: ComponentProps<typeof TooltipRoot>;
  TriggerProps: ComponentProps<typeof TooltipTrigger>;
  ContentProps: ComponentProps<typeof TooltipContent>;
  ArrowProps: ComponentProps<typeof TooltipArrow>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {TooltipRoot, TooltipTrigger, TooltipContent, TooltipArrow};

export type {
  TooltipRootProps,
  TooltipRootProps as TooltipProps,
  TooltipArrowProps,
  TooltipContentProps,
  TooltipTriggerProps,
} from "./tooltip";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {tooltipVariants} from "../../styles/recipes";

export type {TooltipVariants} from "../../styles/recipes";
