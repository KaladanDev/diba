/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {
  ColorSwatchPickerIndicator,
  ColorSwatchPickerItem,
  ColorSwatchPickerRoot,
  ColorSwatchPickerSwatch,
} from "./color-swatch-picker";

/* -------------------------------------------------------------------------------------------------
| * Compound Component
| * -----------------------------------------------------------------------------------------------*/
export const ColorSwatchPicker = Object.assign(ColorSwatchPickerRoot, {
  Root: ColorSwatchPickerRoot,
  Item: ColorSwatchPickerItem,
  Swatch: ColorSwatchPickerSwatch,
  Indicator: ColorSwatchPickerIndicator,
});

export type ColorSwatchPicker = {
  Props: ComponentProps<typeof ColorSwatchPickerRoot>;
  RootProps: ComponentProps<typeof ColorSwatchPickerRoot>;
  ItemProps: ComponentProps<typeof ColorSwatchPickerItem>;
  SwatchProps: ComponentProps<typeof ColorSwatchPickerSwatch>;
  IndicatorProps: ComponentProps<typeof ColorSwatchPickerIndicator>;
};

/* -------------------------------------------------------------------------------------------------
| * Named Component
| * -----------------------------------------------------------------------------------------------*/
export {
  ColorSwatchPickerRoot,
  ColorSwatchPickerItem,
  ColorSwatchPickerSwatch,
  ColorSwatchPickerIndicator,
};

export type {
  ColorSwatchPickerRootProps,
  ColorSwatchPickerRootProps as ColorSwatchPickerProps,
  ColorSwatchPickerItemProps,
  ColorSwatchPickerSwatchProps,
  ColorSwatchPickerIndicatorProps,
} from "./color-swatch-picker";

/* -------------------------------------------------------------------------------------------------
| * Variants
| * -----------------------------------------------------------------------------------------------*/
export {colorSwatchPickerVariants} from "../../styles/recipes";

export type {ColorSwatchPickerVariants} from "../../styles/recipes";
