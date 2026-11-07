/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {SpinnerRoot} from "./spinner";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Spinner = Object.assign(SpinnerRoot, {
  Root: SpinnerRoot,
});

export type Spinner = {
  Props: ComponentProps<typeof SpinnerRoot>;
  RootProps: ComponentProps<typeof SpinnerRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {SpinnerRoot};

export type {SpinnerRootProps, SpinnerRootProps as SpinnerProps} from "./spinner";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {spinnerVariants} from "../../styles/recipes";

export type {SpinnerVariants} from "../../styles/recipes";
