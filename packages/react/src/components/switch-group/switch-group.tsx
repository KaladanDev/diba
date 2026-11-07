/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: It is a group, so the name an aria-label gives it is read; it had had no
 * role, and its name went unheard.
 */
"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {SwitchGroupVariants} from "../../styles/recipes";
import type {ReactNode} from "react";

import {switchGroupVariants} from "../../styles/recipes";
import React from "react";

import {dom} from "../../utils/dom";

/* -------------------------------------------------------------------------------------------------
 * Switch Group Root
 * -----------------------------------------------------------------------------------------------*/
interface SwitchGroupRootProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
  /** Layout orientation. */
  orientation?: SwitchGroupVariants["orientation"];
}

const SwitchGroupRoot = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  orientation,
  ...props
}: SwitchGroupRootProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof SwitchGroupRootProps<E>>) => {
  const slots = React.useMemo(() => switchGroupVariants({orientation}), [orientation]);

  return (
    <dom.div
      data-slot="switch-group"
      role="group"
      {...(props as any)}
      className={slots.base({className})}
    >
      <dom.div className={slots.items()} data-slot="switch-group-items">
        {children}
      </dom.div>
    </dom.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {SwitchGroupRoot};

export type {SwitchGroupRootProps};
