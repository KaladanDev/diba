/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import type {ErrorMessageVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";
import type {TextProps} from "react-aria-components/Text";

import {errorMessageVariants} from "../../styles/recipes";
import {Text} from "react-aria-components/Text";

import {useHasTextSlot} from "../../utils/use-has-text-slot";

/* -------------------------------------------------------------------------------------------------
 * Error Message Root
 * -----------------------------------------------------------------------------------------------*/
interface ErrorMessageRootProps
  extends ComponentPropsWithRef<typeof Text>, TextProps, ErrorMessageVariants {}

const ErrorMessageRoot = ({children, className, ...rest}: ErrorMessageRootProps) => {
  if (!useHasTextSlot("errorMessage")) {
    return null;
  }

  return (
    <Text
      className={errorMessageVariants({className})}
      data-slot="error-message"
      slot="errorMessage"
      {...rest}
    >
      {children}
    </Text>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {ErrorMessageRoot};

export type {ErrorMessageRootProps};
