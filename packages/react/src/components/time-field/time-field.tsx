/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: what it says of a value outside its limits is in the page's language and
 * calendar (date-field/use-date-validation.ts).
 */
"use client";

import type {TimeFieldVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";
import type {TimeValue} from "react-aria-components/TimeField";

import {timeFieldVariants} from "../../styles/recipes";
import React from "react";
import {TimeField as TimeFieldPrimitive} from "react-aria-components/TimeField";

import {dataAttr} from "../../utils/assertion";
import {composeTwRenderProps} from "../../utils/compose";
import {useTimeValidate} from "../date-field/use-date-validation";

/* -------------------------------------------------------------------------------------------------
 * TimeField Root
 * -----------------------------------------------------------------------------------------------*/
interface TimeFieldRootProps<T extends TimeValue>
  extends ComponentPropsWithRef<typeof TimeFieldPrimitive<T>>, TimeFieldVariants {}

function TimeFieldRoot<T extends TimeValue>({
  children,
  className,
  fullWidth,
  ...props
}: TimeFieldRootProps<T>) {
  const styles = React.useMemo(() => timeFieldVariants({fullWidth}), [fullWidth]);
  const validate = useTimeValidate(props as any);

  return (
    <TimeFieldPrimitive
      data-required={dataAttr(props.isRequired)}
      data-slot="time-field"
      {...props}
      className={composeTwRenderProps(className, styles)}
      validate={validate as any}
    >
      {(values) => <>{typeof children === "function" ? children(values) : children}</>}
    </TimeFieldPrimitive>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {TimeFieldRoot};

export type {TimeFieldRootProps};
