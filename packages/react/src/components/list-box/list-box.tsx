/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import type {ListBoxVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";

import {listboxVariants} from "../../styles/recipes";
import React from "react";
import {ListBox as ListBoxPrimitive} from "react-aria-components/ListBox";

import {composeTwRenderProps} from "../../utils";

/* -------------------------------------------------------------------------------------------------
 * ListBox Root
 * -----------------------------------------------------------------------------------------------*/
interface ListBoxRootProps<T extends object>
  extends ComponentPropsWithRef<typeof ListBoxPrimitive<T>>, ListBoxVariants {
  className?: string;
}

function ListBoxRoot<T extends object>({className, variant, ...props}: ListBoxRootProps<T>) {
  const styles = React.useMemo(() => listboxVariants({variant}), [variant]);

  return (
    <ListBoxPrimitive
      className={composeTwRenderProps(className, styles)}
      data-slot="list-box"
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {ListBoxRoot};

export type {ListBoxRootProps};
