/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import type {DisclosureGroupVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";

import {disclosureGroupVariants} from "../../styles/recipes";
import React, {createContext} from "react";
import {DisclosureGroup as DisclosureGroupPrimitive} from "react-aria-components/DisclosureGroup";

import {composeTwRenderProps} from "../../utils/compose";

/* -------------------------------------------------------------------------------------------------
 * Disclosure Group Context
 * -----------------------------------------------------------------------------------------------*/
type DisclosureGroupContext = {
  slots?: ReturnType<typeof disclosureGroupVariants>;
};

const DisclosureGroupContext = createContext<DisclosureGroupContext>({});

/* -------------------------------------------------------------------------------------------------
 * Disclosure Group Root
 * -----------------------------------------------------------------------------------------------*/
interface DisclosureGroupRootProps
  extends ComponentPropsWithRef<typeof DisclosureGroupPrimitive>, DisclosureGroupVariants {}

const DisclosureGroupRoot = ({children, className, ...props}: DisclosureGroupRootProps) => {
  const slots = React.useMemo(() => disclosureGroupVariants({}), []);

  const contextValue = React.useMemo(() => ({slots}), [slots]);

  return (
    <DisclosureGroupContext value={contextValue}>
      <DisclosureGroupPrimitive
        data-slot="disclosure-group"
        {...props}
        className={composeTwRenderProps(className, slots.base())}
      >
        {(values) => <>{typeof children === "function" ? children(values) : children}</>}
      </DisclosureGroupPrimitive>
    </DisclosureGroupContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {DisclosureGroupRoot};

export type {DisclosureGroupRootProps};
