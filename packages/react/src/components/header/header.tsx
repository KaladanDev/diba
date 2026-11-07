/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import type {ComponentPropsWithRef} from "react";

import {headerVariants} from "../../styles/recipes";
import {Header as HeaderPrimitive} from "react-aria-components/Header";

/* -------------------------------------------------------------------------------------------------
 * Header Root
 * -----------------------------------------------------------------------------------------------*/
interface HeaderRootProps extends ComponentPropsWithRef<typeof HeaderPrimitive> {}

const HeaderRoot = ({children, className, ...rest}: HeaderRootProps) => {
  return (
    <HeaderPrimitive className={headerVariants({className})} data-slot="header" {...rest}>
      {children}
    </HeaderPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {HeaderRoot};

export type {HeaderRootProps};
