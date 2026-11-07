/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import type {InputVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";

import {inputVariants} from "../../styles/recipes";
import React, {use} from "react";
import {Input as InputPrimitive} from "react-aria-components/Input";

import {composeTwRenderProps} from "../../utils";
import {ComboBoxContext} from "../combo-box";
import {TextFieldContext} from "../textfield";

/* -------------------------------------------------------------------------------------------------
 * Input Root
 * -----------------------------------------------------------------------------------------------*/
interface InputRootProps extends ComponentPropsWithRef<typeof InputPrimitive>, InputVariants {}

const InputRoot = ({className, fullWidth, variant: variantProp, ...rest}: InputRootProps) => {
  const textFieldContext = use(TextFieldContext);
  const comboBoxContext = use(ComboBoxContext);

  // Use variant from context if not explicitly provided
  const variant = variantProp ?? textFieldContext.variant ?? comboBoxContext.variant;

  return (
    <InputPrimitive
      className={composeTwRenderProps(className, inputVariants({fullWidth, variant}))}
      data-slot="input"
      {...rest}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {InputRoot};

export type {InputRootProps};
