/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {RadioGroupRoot} from "./radio-group";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const RadioGroup = Object.assign(RadioGroupRoot, {
  Root: RadioGroupRoot,
});

export type RadioGroup = {
  Props: ComponentProps<typeof RadioGroupRoot>;
  RootProps: ComponentProps<typeof RadioGroupRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {RadioGroupRoot};

export type {RadioGroupRootProps, RadioGroupRootProps as RadioGroupProps} from "./radio-group";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {radioGroupVariants} from "../../styles/recipes";

export type {RadioGroupVariants} from "../../styles/recipes";
