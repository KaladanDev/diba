/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import type {MenuVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";

import {menuVariants} from "../../styles/recipes";
import React from "react";
import {Menu as MenuPrimitive} from "react-aria-components/Menu";

import {composeTwRenderProps} from "../../utils";

/* -------------------------------------------------------------------------------------------------
 * Menu Root
 * -----------------------------------------------------------------------------------------------*/
interface MenuRootProps<T extends object>
  extends ComponentPropsWithRef<typeof MenuPrimitive<T>>, MenuVariants {
  className?: string;
}

function MenuRoot<T extends object>({className, ...props}: MenuRootProps<T>) {
  const styles = React.useMemo(() => menuVariants(), []);

  return (
    <MenuPrimitive
      className={composeTwRenderProps(className, styles)}
      data-slot="menu"
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {MenuRoot};

export type {MenuRootProps};
