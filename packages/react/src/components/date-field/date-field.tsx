/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: what it says of a value outside its limits is in the page's language and
 * calendar (date-field/use-date-validation.ts).
 */
"use client";

import type {DateFieldVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";
import type {DateValue} from "react-aria-components/Calendar";

import {dateFieldVariants} from "../../styles/recipes";
import React from "react";
import {DateField as DateFieldPrimitive} from "react-aria-components/DateField";

import {dataAttr} from "../../utils/assertion";
import {composeTwRenderProps} from "../../utils/compose";
import {useDateValidate} from "./use-date-validation";

/* -------------------------------------------------------------------------------------------------
 * DateField Root
 * -----------------------------------------------------------------------------------------------*/
interface DateFieldRootProps<T extends DateValue>
  extends ComponentPropsWithRef<typeof DateFieldPrimitive<T>>, DateFieldVariants {}

function DateFieldRoot<T extends DateValue>({
  children,
  className,
  fullWidth,
  ...props
}: DateFieldRootProps<T>) {
  const styles = React.useMemo(() => dateFieldVariants({fullWidth}), [fullWidth]);
  const validate = useDateValidate(props as any);

  return (
    <DateFieldPrimitive
      data-required={dataAttr(props.isRequired)}
      data-slot="date-field"
      {...props}
      className={composeTwRenderProps(className, styles)}
      validate={validate as any}
    >
      {(values) => <>{typeof children === "function" ? children(values) : children}</>}
    </DateFieldPrimitive>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {DateFieldRoot};

export type {DateFieldRootProps};
