/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {LabelRoot} from "./label";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Label = Object.assign(LabelRoot, {
  Root: LabelRoot,
});

export type Label = {
  Props: ComponentProps<typeof LabelRoot>;
  RootProps: ComponentProps<typeof LabelRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {LabelRoot};

export type {LabelRootProps, LabelRootProps as LabelProps} from "./label";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {labelVariants} from "../../styles/recipes";

export type {LabelVariants} from "../../styles/recipes";
