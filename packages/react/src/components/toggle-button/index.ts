/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {ToggleButtonRoot} from "./toggle-button";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const ToggleButton = Object.assign(ToggleButtonRoot, {
  Root: ToggleButtonRoot,
});

export type ToggleButton = {
  Props: ComponentProps<typeof ToggleButtonRoot>;
  RootProps: ComponentProps<typeof ToggleButtonRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {ToggleButtonRoot};

export type {
  ToggleButtonRootProps,
  ToggleButtonRootProps as ToggleButtonProps,
} from "./toggle-button";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {toggleButtonVariants} from "../../styles/recipes";

export type {ToggleButtonVariants} from "../../styles/recipes";
