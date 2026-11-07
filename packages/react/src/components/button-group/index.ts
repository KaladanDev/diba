/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {ButtonGroupRoot, ButtonGroupSeparator} from "./button-group";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const ButtonGroup = Object.assign(ButtonGroupRoot, {
  Root: ButtonGroupRoot,
  Separator: ButtonGroupSeparator,
});

export type ButtonGroup = {
  Props: ComponentProps<typeof ButtonGroupRoot>;
  RootProps: ComponentProps<typeof ButtonGroupRoot>;
  SeparatorProps: ComponentProps<typeof ButtonGroupSeparator>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {ButtonGroupRoot, ButtonGroupSeparator};

export type {
  ButtonGroupRootProps,
  ButtonGroupRootProps as ButtonGroupProps,
  ButtonGroupSeparatorProps,
} from "./button-group";

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/
export {ButtonGroupContext, BUTTON_GROUP_CHILD} from "./button-group";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {buttonGroupVariants} from "../../styles/recipes";

export type {ButtonGroupVariants} from "../../styles/recipes";
