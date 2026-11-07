/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import type {DescriptionVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";
import type {TextProps} from "react-aria-components/Text";

import {descriptionVariants} from "../../styles/recipes";
import {Text} from "react-aria-components/Text";

import {useHasTextSlot} from "../../utils/use-has-text-slot";

/* -------------------------------------------------------------------------------------------------
 * Description Root
 * -----------------------------------------------------------------------------------------------*/
interface DescriptionRootProps
  extends ComponentPropsWithRef<typeof Text>, TextProps, DescriptionVariants {}

const DescriptionRoot = ({children, className, ...rest}: DescriptionRootProps) => {
  if (!useHasTextSlot("description")) {
    return null;
  }

  return (
    <Text
      className={descriptionVariants({className})}
      data-slot="description"
      slot="description"
      {...rest}
    >
      {children}
    </Text>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {DescriptionRoot};

export type {DescriptionRootProps};
