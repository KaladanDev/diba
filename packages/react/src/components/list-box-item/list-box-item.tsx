/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: the indicator takes `kind="choice"`, which draws Flutter's radio for a
 * single choice or its checkbox for several, at the item's start, as Flutter's list tiles do.
 * Its words are its textValue when it is given words alone: the root had handed React Aria a render
 * function, so React Aria could not read them, and a combo box chose nothing and typing found
 * nothing without one.
 */
"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {ListBoxItemVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";
import type {ListBoxItemRenderProps} from "react-aria-components/ListBox";

import {listboxItemVariants} from "../../styles/recipes";
import React, {createContext, use} from "react";
import {ListBoxItem as ListBoxItemPrimitive} from "react-aria-components/ListBox";

import {composeSlotClassName, composeTwRenderProps} from "../../utils";
import {FlutterCheckbox} from "../checkbox/checkbox";
import {FlutterRadio} from "../radio/radio";
import {dom} from "../../utils/dom";

/* -------------------------------------------------------------------------------------------------
 * ListBox Item Context
 * -----------------------------------------------------------------------------------------------*/
interface ListBoxItemContext {
  slots?: ReturnType<typeof listboxItemVariants>;
  state?: ListBoxItemRenderProps;
}

const ListBoxItemContext = createContext<ListBoxItemContext>({});

/* -------------------------------------------------------------------------------------------------
 * ListBox Item Root
 * -----------------------------------------------------------------------------------------------*/
interface ListBoxItemRootProps
  extends ComponentPropsWithRef<typeof ListBoxItemPrimitive>, ListBoxItemVariants {
  className?: string;
}

const ListBoxItemRoot = ({children, className, variant, ...props}: ListBoxItemRootProps) => {
  const slots = React.useMemo(() => listboxItemVariants({variant}), [variant]);

  return (
    <ListBoxItemPrimitive
      className={composeTwRenderProps(className, slots.item())}
      data-slot="list-box-item"
      {...props}
      textValue={props.textValue ?? (typeof children === "string" ? children : undefined)}
    >
      {(values) => (
        <ListBoxItemContext value={{slots, state: values}}>
          {typeof children === "function" ? children(values) : children}
        </ListBoxItemContext>
      )}
    </ListBoxItemPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ListBox Item Indicator
 * -----------------------------------------------------------------------------------------------*/
interface ListBoxItemIndicatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: React.ReactNode | ((props: ListBoxItemRenderProps) => React.ReactNode);
  className?: string;
  /**
   * Diba's. `check` (the default) is the copied tick at the item's end, as a select's menu shows it.
   * `choice` is Flutter's radio when the list takes one choice and its checkbox when it takes
   * several, at the item's start, as a list on a page shows it. Put it first in the item.
   */
  kind?: "check" | "choice";
}

const ListBoxItemIndicator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  kind = "check",
  ...props
}: ListBoxItemIndicatorProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof ListBoxItemIndicatorProps<E>>) => {
  const {slots, state} = use(ListBoxItemContext);
  const isSelected = state?.isSelected;
  const ref = React.useRef<HTMLSpanElement>(null);
  const choice = kind === "choice" ? state?.selectionMode : undefined;

  const content =
    typeof children === "function" ? (
      children(state ?? ({} as ListBoxItemRenderProps))
    ) : children ? (
      children
    ) : choice === "multiple" ? (
      <FlutterCheckbox element={ref} isInvalid={false} value={Boolean(isSelected)} />
    ) : choice === "single" ? (
      <FlutterRadio element={ref} isInvalid={false} isSelected={Boolean(isSelected)} />
    ) : kind === "choice" ? null : (
      <svg
        aria-hidden="true"
        data-slot="list-box-item-indicator--checkmark"
        fill="none"
        role="presentation"
        stroke="currentColor"
        strokeDasharray={22}
        strokeDashoffset={isSelected ? 44 : 66}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 17 18"
      >
        <polyline points="1 9 7 14 15 4" />
      </svg>
    );

  return (
    <dom.span
      ref={ref}
      aria-hidden="true"
      className={composeSlotClassName(slots?.indicator, className)}
      data-kind={kind === "choice" ? (choice ?? "none") : undefined}
      data-slot="list-box-item-indicator"
      data-visible={isSelected || undefined}
      {...(props as any)}
    >
      {content}
    </dom.span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {ListBoxItemRoot, ListBoxItemIndicator};

export type {ListBoxItemRootProps, ListBoxItemIndicatorProps};
