/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {CheckboxContent, CheckboxControl, CheckboxIndicator, CheckboxRoot} from "./checkbox";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Checkbox = Object.assign(CheckboxRoot, {
  Root: CheckboxRoot,
  Content: CheckboxContent,
  Control: CheckboxControl,
  Indicator: CheckboxIndicator,
});

export type Checkbox = {
  Props: ComponentProps<typeof CheckboxRoot>;
  RootProps: ComponentProps<typeof CheckboxRoot>;
  ContentProps: ComponentProps<typeof CheckboxContent>;
  ControlProps: ComponentProps<typeof CheckboxControl>;
  IndicatorProps: ComponentProps<typeof CheckboxIndicator>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {CheckboxContent, CheckboxControl, CheckboxIndicator, CheckboxRoot};

export type {
  CheckboxRootProps,
  CheckboxRootProps as CheckboxProps,
  CheckboxContentProps,
  CheckboxControlProps,
  CheckboxIndicatorProps,
  CheckboxFieldRenderProps,
  CheckboxButtonRenderProps,
  /** @deprecated Use {@link CheckboxFieldRenderProps} for the root render prop, or {@link CheckboxButtonRenderProps} for content/control/indicator. */
  CheckboxFieldRenderProps as CheckboxRenderProps,
} from "./checkbox";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {checkboxVariants} from "../../styles/recipes";

export type {CheckboxVariants} from "../../styles/recipes";
