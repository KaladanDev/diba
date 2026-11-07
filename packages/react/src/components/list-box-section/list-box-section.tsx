/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import type {ComponentPropsWithRef} from "react";

import {listboxSectionVariants} from "../../styles/recipes";
import React from "react";
import {ListBoxSection as ListBoxSectionPrimitive} from "react-aria-components/ListBox";

/* -------------------------------------------------------------------------------------------------
 * ListBox Section Root
 * -----------------------------------------------------------------------------------------------*/
interface ListBoxSectionRootProps extends ComponentPropsWithRef<typeof ListBoxSectionPrimitive> {
  className?: string;
}

const ListBoxSectionRoot = ({children, className, ...props}: ListBoxSectionRootProps) => {
  const styles = React.useMemo(
    () => listboxSectionVariants({class: typeof className === "string" ? className : undefined}),
    [className],
  );

  return (
    <ListBoxSectionPrimitive className={styles} {...props}>
      {children}
    </ListBoxSectionPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {ListBoxSectionRoot};

export type {ListBoxSectionRootProps};
