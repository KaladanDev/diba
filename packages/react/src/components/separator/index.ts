/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {SeparatorRoot} from "./separator";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Separator = Object.assign(SeparatorRoot, {
  Root: SeparatorRoot,
});

export type Separator = {
  Props: ComponentProps<typeof SeparatorRoot>;
  RootProps: ComponentProps<typeof SeparatorRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {SeparatorRoot};

export type {SeparatorRootProps, SeparatorRootProps as SeparatorProps} from "./separator";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {separatorVariants} from "../../styles/recipes";

export type {SeparatorVariants} from "../../styles/recipes";
