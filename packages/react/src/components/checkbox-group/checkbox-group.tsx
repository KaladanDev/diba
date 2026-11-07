/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: A required group with none on says «دست‌کم یکی را انتخاب کنید.», in the
 * page's language, not the browser's "Please check this box" (use-text-validation.ts).
 */
"use client";

import type {CheckboxVariants} from "../checkbox";
import type {CheckboxGroupVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";

import {checkboxGroupVariants} from "../../styles/recipes";
import React, {createContext} from "react";
import {CheckboxGroup as CheckboxGroupPrimitive} from "react-aria-components/CheckboxGroup";

import {composeTwRenderProps} from "../../utils/compose";
import {useChoiceValidate} from "../textfield/use-text-validation";

/* -------------------------------------------------------------------------------------------------
 * CheckboxGroup Context
 * -----------------------------------------------------------------------------------------------*/
interface CheckboxGroupContext {
  variant?: CheckboxVariants["variant"];
}

const CheckboxGroupContext = createContext<CheckboxGroupContext>({});

interface CheckboxGroupProps
  extends ComponentPropsWithRef<typeof CheckboxGroupPrimitive>, CheckboxGroupVariants {}

const CheckboxGroup = ({children, className, variant, ...props}: CheckboxGroupProps) => {
  const styles = React.useMemo(() => checkboxGroupVariants({variant}), [variant]);
  const validate = useChoiceValidate(props, (value: string[]) => value.length === 0, "chooseOne");

  return (
    <CheckboxGroupContext.Provider value={{variant}}>
      <CheckboxGroupPrimitive
        className={composeTwRenderProps(className, styles)}
        data-slot="checkbox-group"
        {...props}
        validate={validate as any}
      >
        {(values) => <>{typeof children === "function" ? children(values) : children}</>}
      </CheckboxGroupPrimitive>
    </CheckboxGroupContext.Provider>
  );
};

export {CheckboxGroup, CheckboxGroupContext};
export type {CheckboxGroupProps};
