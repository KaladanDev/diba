/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {ChipLabel, ChipRoot} from "./chip";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Chip = Object.assign(ChipRoot, {
  Root: ChipRoot,
  Label: ChipLabel,
});

export type Chip = {
  Props: ComponentProps<typeof ChipRoot>;
  RootProps: ComponentProps<typeof ChipRoot>;
  LabelProps: ComponentProps<typeof ChipLabel>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {ChipRoot, ChipLabel};

export type {ChipRootProps, ChipRootProps as ChipProps, ChipLabelProps} from "./chip";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {chipVariants} from "../../styles/recipes";

export type {ChipVariants} from "../../styles/recipes";
