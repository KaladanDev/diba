/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {InputRoot} from "./input";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Input = Object.assign(InputRoot, {
  Root: InputRoot,
});

export type Input = {
  Props: ComponentProps<typeof InputRoot>;
  RootProps: ComponentProps<typeof InputRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {InputRoot};

export type {InputRootProps, InputRootProps as InputProps} from "./input";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {inputVariants} from "../../styles/recipes";

export type {InputVariants} from "../../styles/recipes";
