/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {
  NumberFieldDecrementButton,
  NumberFieldGroup,
  NumberFieldIncrementButton,
  NumberFieldInput,
  NumberFieldRoot,
} from "./number-field";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const NumberField = Object.assign(NumberFieldRoot, {
  Root: NumberFieldRoot,
  Group: NumberFieldGroup,
  Input: NumberFieldInput,
  IncrementButton: NumberFieldIncrementButton,
  DecrementButton: NumberFieldDecrementButton,
});

export type NumberField = {
  Props: ComponentProps<typeof NumberFieldRoot>;
  RootProps: ComponentProps<typeof NumberFieldRoot>;
  GroupProps: ComponentProps<typeof NumberFieldGroup>;
  InputProps: ComponentProps<typeof NumberFieldInput>;
  IncrementButtonProps: ComponentProps<typeof NumberFieldIncrementButton>;
  DecrementButtonProps: ComponentProps<typeof NumberFieldDecrementButton>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {
  NumberFieldDecrementButton,
  NumberFieldGroup,
  NumberFieldIncrementButton,
  NumberFieldInput,
  NumberFieldRoot,
};

export type {
  NumberFieldRootProps,
  NumberFieldRootProps as NumberFieldProps,
  NumberFieldGroupProps,
  NumberFieldInputProps,
  NumberFieldIncrementButtonProps,
  NumberFieldDecrementButtonProps,
} from "./number-field";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {numberFieldVariants} from "../../styles/recipes";

export type {NumberFieldVariants} from "../../styles/recipes";
