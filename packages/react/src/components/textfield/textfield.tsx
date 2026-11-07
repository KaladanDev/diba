/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: what a value its own checks refuse is said in the page's language, as a
 * tree's fields say it, not the browser's (use-text-validation.ts).
 */
"use client";

import type {TextFieldVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";

import {textFieldVariants} from "../../styles/recipes";
import React, {createContext} from "react";
import {TextField as TextFieldPrimitive} from "react-aria-components/TextField";

import {composeTwRenderProps} from "../../utils/compose";

import {useTextValidate} from "./use-text-validation";

/* ------------------------------------------------------------------------------------------------
 * TextField Context
 * --------------------------------------------------------------------------------------------- */
type TextFieldContext = {
  variant?: "primary" | "secondary";
};

const TextFieldContext = createContext<TextFieldContext>({});

/* -------------------------------------------------------------------------------------------------
 * TextField Root
 * -----------------------------------------------------------------------------------------------*/
interface TextFieldRootProps
  extends ComponentPropsWithRef<typeof TextFieldPrimitive>, TextFieldVariants {
  /**
   * The variant of the text field.
   * @default "primary"
   */
  variant?: "primary" | "secondary";
}

const TextFieldRoot = ({children, className, fullWidth, variant, ...props}: TextFieldRootProps) => {
  const styles = React.useMemo(() => textFieldVariants({fullWidth}), [fullWidth]);
  const contextValue = React.useMemo(() => ({variant}), [variant]);
  const validate = useTextValidate(props);

  return (
    <TextFieldPrimitive
      data-slot="textfield"
      {...props}
      validate={validate as any}
      className={composeTwRenderProps(className, styles)}
    >
      {(values) => (
        <TextFieldContext value={contextValue}>
          <>{typeof children === "function" ? children(values) : children}</>
        </TextFieldContext>
      )}
    </TextFieldPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {TextFieldRoot, TextFieldContext};

export type {TextFieldRootProps};
