/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import type {ComponentPropsWithRef} from "react";

import {menuSectionVariants} from "../../styles/recipes";
import React from "react";
import {MenuSection as MenuSectionPrimitive} from "react-aria-components/Menu";

/* -------------------------------------------------------------------------------------------------
 * Menu Section Root
 * -----------------------------------------------------------------------------------------------*/
interface MenuSectionRootProps extends ComponentPropsWithRef<typeof MenuSectionPrimitive> {
  className?: string;
}

const MenuSectionRoot = ({children, className, ...props}: MenuSectionRootProps) => {
  const styles = React.useMemo(
    () => menuSectionVariants({class: typeof className === "string" ? className : undefined}),
    [className],
  );

  return (
    <MenuSectionPrimitive className={styles} {...props}>
      {children}
    </MenuSectionPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {MenuSectionRoot};

export type {MenuSectionRootProps};
