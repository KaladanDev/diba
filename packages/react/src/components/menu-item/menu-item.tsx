/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: A chosen item's tick is Lucide's check, 16 across, as Diba's other marks are
 * (the 10px one it had was too small to read); it still draws itself in. Its words are its
 * textValue when it is given words alone: the root had handed React Aria a render function, so
 * React Aria could not read them, and a combo box chose nothing and typing found nothing without
 * one.
 */
"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {MenuItemVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";
import type {MenuItemRenderProps} from "react-aria-components/Menu";

import {menuItemVariants} from "../../styles/recipes";
import React, {createContext, use} from "react";
import {Check} from "lucide-react";
import {MenuItem as MenuItemPrimitive} from "react-aria-components/Menu";

import {composeSlotClassName, composeTwRenderProps} from "../../utils";
import {dom} from "../../utils/dom";
import {IconChevronRight} from "../icons";

/* -------------------------------------------------------------------------------------------------
 * Menu Item Context
 * -----------------------------------------------------------------------------------------------*/
interface MenuItemContext {
  slots?: ReturnType<typeof menuItemVariants>;
  state?: MenuItemRenderProps;
}

const MenuItemContext = createContext<MenuItemContext>({});

/* -------------------------------------------------------------------------------------------------
 * Menu Item Root
 * -----------------------------------------------------------------------------------------------*/
interface MenuItemRootProps
  extends ComponentPropsWithRef<typeof MenuItemPrimitive>, MenuItemVariants {
  className?: string;
}

const MenuItemRoot = ({children, className, variant, ...props}: MenuItemRootProps) => {
  const slots = React.useMemo(() => menuItemVariants({variant}), [variant]);

  return (
    <MenuItemPrimitive
      className={composeTwRenderProps(className, slots.item())}
      data-slot="menu-item"
      {...props}
      textValue={props.textValue ?? (typeof children === "string" ? children : undefined)}
    >
      {(values) => (
        <MenuItemContext value={{slots, state: values}}>
          {typeof children === "function" ? children(values) : children}
        </MenuItemContext>
      )}
    </MenuItemPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Menu Item Indicator
 * -----------------------------------------------------------------------------------------------*/
interface MenuItemIndicatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: React.ReactNode | ((props: MenuItemRenderProps) => React.ReactNode);
  className?: string;
  type?: "checkmark" | "dot";
}

const MenuItemIndicator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  type = "checkmark",
  ...props
}: MenuItemIndicatorProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof MenuItemIndicatorProps<E>>) => {
  const {slots, state} = use(MenuItemContext);
  const isSelected = state?.isSelected;

  const content =
    typeof children === "function" ? (
      children(state ?? ({} as MenuItemRenderProps))
    ) : children ? (
      children
    ) : type === "dot" ? (
      <svg
        aria-hidden="true"
        data-slot="menu-item-indicator--dot"
        fill="currentColor"
        fillRule="evenodd"
        role="presentation"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path clipRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14" fillRule="evenodd" />
      </svg>
    ) : (
      // Lucide's path is 22.6 long: a 24 dash shows it whole, and moved 24 along, none of it.
      <Check
        aria-hidden="true"
        data-slot="menu-item-indicator--checkmark"
        role="presentation"
        strokeDasharray={24}
        strokeDashoffset={isSelected ? 0 : 24}
      />
    );

  return (
    <dom.span
      aria-hidden="true"
      className={composeSlotClassName(slots?.indicator, className)}
      data-slot="menu-item-indicator"
      data-type={type}
      data-visible={isSelected || undefined}
      {...(props as any)}
    >
      {content}
    </dom.span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Menu Item Submenu Indicator
 * -----------------------------------------------------------------------------------------------*/
interface MenuItemSubmenuIndicatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: React.ReactNode;
  className?: string;
}

const MenuItemSubmenuIndicator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  ...props
}: MenuItemSubmenuIndicatorProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof MenuItemSubmenuIndicatorProps<E>>) => {
  const {slots, state} = use(MenuItemContext);
  const hasSubmenu = state?.hasSubmenu;

  if (!hasSubmenu) {
    return null;
  }

  const defaultContent = <IconChevronRight />;
  const content = children ?? defaultContent;

  return (
    <dom.span
      aria-hidden="true"
      className={composeSlotClassName(slots?.submenuIndicator, className)}
      data-slot="submenu-indicator"
      {...(props as any)}
    >
      {content}
    </dom.span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {MenuItemRoot, MenuItemIndicator, MenuItemSubmenuIndicator};

export type {MenuItemRootProps, MenuItemIndicatorProps, MenuItemSubmenuIndicatorProps};
