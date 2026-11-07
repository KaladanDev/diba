/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import type {RadioGroupVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";

import {radioGroupVariants} from "../../styles/recipes";
import React from "react";
import {RadioGroup as RadioGroupPrimitive} from "react-aria-components/RadioGroup";

import {composeTwRenderProps} from "../../utils/compose";

/* -------------------------------------------------------------------------------------------------
 * Radio Group Root
 * -----------------------------------------------------------------------------------------------*/
interface RadioGroupRootProps
  extends ComponentPropsWithRef<typeof RadioGroupPrimitive>, RadioGroupVariants {}

const RadioGroupRoot = ({children, className, variant, ...props}: RadioGroupRootProps) => {
  const styles = React.useMemo(() => radioGroupVariants({variant}), [variant]);

  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      {...props}
      className={composeTwRenderProps(className, styles)}
    >
      {(values) => <>{typeof children === "function" ? children(values) : children}</>}
    </RadioGroupPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {RadioGroupRoot};

export type {RadioGroupRootProps};
