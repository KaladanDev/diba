/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {TextFieldRoot} from "./textfield";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const TextField = Object.assign(TextFieldRoot, {
  Root: TextFieldRoot,
});

export type TextField = {
  Props: ComponentProps<typeof TextFieldRoot>;
  RootProps: ComponentProps<typeof TextFieldRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {TextFieldRoot};

export type {TextFieldRootProps, TextFieldRootProps as TextFieldProps} from "./textfield";

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/
export {TextFieldContext} from "./textfield";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {textFieldVariants} from "../../styles/recipes";

export type {TextFieldVariants} from "../../styles/recipes";
