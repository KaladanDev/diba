/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: Left empty, it says the browser's own "required" in the page's language,
 * «این فیلد الزامی است.»: a required checkbox, switch or radio group left empty showed "Please
 * check this box if you want to proceed." or "Please select one of these options." in the browser's
 * language. A check's own error, the app's or Diba's (use-text-validation.ts), is never the
 * browser's "required".
 */
"use client";

import type {FieldErrorVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";

import {fieldErrorVariants} from "../../styles/recipes";
import {FieldError as FieldErrorPrimitive} from "react-aria-components/FieldError";

import {useDibaStrings} from "../../i18n/strings";
import {composeTwRenderProps} from "../../utils/compose";

/* -------------------------------------------------------------------------------------------------
 * Field Error Root
 * -----------------------------------------------------------------------------------------------*/
interface FieldErrorRootProps
  extends ComponentPropsWithRef<typeof FieldErrorPrimitive>, FieldErrorVariants {}

const FieldErrorRoot = ({children, className, ...rest}: FieldErrorRootProps) => {
  const t = useDibaStrings();

  return (
    <FieldErrorPrimitive
      data-visible
      className={composeTwRenderProps(className, fieldErrorVariants())}
      data-slot="field-error"
      {...rest}
    >
      {(renderProps) => {
        if (typeof children === "function") return children(renderProps);
        if (children != null) return children;
        // React Aria reports a check's own error as a custom one, never as a missing value.
        return renderProps.validationDetails?.valueMissing ? t.required : undefined;
      }}
    </FieldErrorPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {FieldErrorRoot};

export type {FieldErrorRootProps};
