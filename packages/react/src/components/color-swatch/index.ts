/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {ColorSwatchRoot} from "./color-swatch";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const ColorSwatch = Object.assign(ColorSwatchRoot, {
  Root: ColorSwatchRoot,
});

export type ColorSwatch = {
  Props: ComponentProps<typeof ColorSwatchRoot>;
  RootProps: ComponentProps<typeof ColorSwatchRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {ColorSwatchRoot};

export type {ColorSwatchRootProps, ColorSwatchRootProps as ColorSwatchProps} from "./color-swatch";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {colorSwatchVariants} from "../../styles/recipes";

export type {ColorSwatchVariants} from "../../styles/recipes";
