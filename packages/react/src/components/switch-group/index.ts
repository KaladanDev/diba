/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {SwitchGroupRoot} from "./switch-group";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const SwitchGroup = Object.assign(SwitchGroupRoot, {
  Root: SwitchGroupRoot,
});

export type SwitchGroup = {
  Props: ComponentProps<typeof SwitchGroupRoot>;
  RootProps: ComponentProps<typeof SwitchGroupRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {SwitchGroupRoot};

export type {SwitchGroupRootProps, SwitchGroupRootProps as SwitchGroupProps} from "./switch-group";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {switchGroupVariants} from "../../styles/recipes";

export type {SwitchGroupVariants} from "../../styles/recipes";
