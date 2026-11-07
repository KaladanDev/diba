/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {FieldErrorRoot} from "./field-error";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const FieldError = Object.assign(FieldErrorRoot, {
  Root: FieldErrorRoot,
});

export type FieldError = {
  Props: ComponentProps<typeof FieldErrorRoot>;
  RootProps: ComponentProps<typeof FieldErrorRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {FieldErrorRoot};

export type {FieldErrorRootProps, FieldErrorRootProps as FieldErrorProps} from "./field-error";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {fieldErrorVariants} from "../../styles/recipes";

export type {FieldErrorVariants} from "../../styles/recipes";
