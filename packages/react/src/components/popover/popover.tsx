/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: the content keeps 8 clear of the window's edges and turns only when it does
 * not fit.
 */
"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {SurfaceVariants} from "../surface";
import type {PopoverVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef, ReactNode} from "react";

import {popoverVariants} from "../../styles/recipes";
import React, {createContext, use} from "react";
import {
  Dialog as DialogPrimitive,
  Heading as HeadingPrimitive,
  DialogTrigger as PopoverTriggerPrimitive,
} from "react-aria-components/Dialog";
import {mergeRefs} from "@react-aria/utils";
import {useLocale} from "react-aria-components/I18nProvider";
import {
  OverlayArrow,
  Popover as PopoverPrimitive,
  PopoverContext as RACPopoverContext,
  Pressable as PressablePrimitive,
} from "react-aria-components/Popover";
import {useSlottedContext} from "react-aria-components/slots";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {SurfaceContext} from "../surface";

/* -------------------------------------------------------------------------------------------------
 * Popover Context
 * -----------------------------------------------------------------------------------------------*/
type PopoverContext = {
  slots?: ReturnType<typeof popoverVariants>;
};

const PopoverContext = createContext<PopoverContext>({});

const DEFAULT_SURFACE_CONTEXT = {variant: "default" as SurfaceVariants["variant"]};

/* -------------------------------------------------------------------------------------------------
 * Popover Root
 * -----------------------------------------------------------------------------------------------*/
type PopoverRootProps = ComponentPropsWithRef<typeof PopoverTriggerPrimitive>;

const PopoverRoot = ({
  children,
  ...props
}: ComponentPropsWithRef<typeof PopoverTriggerPrimitive>) => {
  const slots = React.useMemo(() => popoverVariants(), []);
  const contextValue = React.useMemo(() => ({slots}), [slots]);

  return (
    <PopoverContext value={contextValue}>
      <PopoverTriggerPrimitive data-slot="popover-root" {...props}>
        {children}
      </PopoverTriggerPrimitive>
    </PopoverContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Popover Content
 * -----------------------------------------------------------------------------------------------*/
interface PopoverContentProps
  extends Omit<ComponentPropsWithRef<typeof PopoverPrimitive>, "children">, PopoverVariants {
  children: React.ReactNode;
}

/**
 * Kaladan: how near the window's edges a popover comes, as Flutter's does. React Aria keeps
 * 12 clear and turns the popover to the other side of its trigger once it would come nearer.
 */
const EDGE = 8;

const PopoverContent = ({
  children,
  className,
  containerPadding = EDGE,
  offset = 8,
  placement = "bottom",
  ref,
  ...props
}: PopoverContentProps) => {
  const {slots} = use(PopoverContext);
  const contextValue = React.useMemo(() => ({slots}), [slots]);
  const racContext = useSlottedContext(RACPopoverContext);
  const triggerRef = props.triggerRef ?? racContext?.triggerRef;
  const popoverRef = React.useRef<HTMLElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, popoverRef), [ref]);
  // Kaladan: set while the panel fits on its own side only nearer the edge than the padding.
  const [tight, setTight] = React.useState(false);

  return (
    <PopoverContext value={contextValue}>
      <SurfaceContext value={DEFAULT_SURFACE_CONTEXT}>
        <PopoverPrimitive
          {...props}
          ref={mergedRef}
          className={composeTwRenderProps(className, slots?.base())}
          containerPadding={tight ? 0 : containerPadding}
          offset={offset}
          placement={placement}
        >
          {({placement: placed}) => (
            <>
              <StaysOnItsSide
                offset={offset}
                padding={containerPadding}
                placed={placed}
                placement={placement}
                popoverRef={popoverRef}
                triggerRef={triggerRef}
                onTight={setTight}
              />
              {children}
            </>
          )}
        </PopoverPrimitive>
      </SurfaceContext>
    </PopoverContext>
  );
};

/**
 * Kaladan: a popover turns to the other side of its trigger only when it does not fit on its own
 * side at all, as Flutter's does. React Aria turns it once it would come within the padding
 * of the window's edge, so when the panel fits only nearer than that, the padding is dropped while
 * it is open: React Aria then leaves it on its side. Run whenever React Aria places it.
 */
function StaysOnItsSide({
  offset,
  padding,
  placed,
  placement,
  popoverRef,
  triggerRef,
  onTight,
}: {
  offset: number;
  padding: number;
  placed: string | null;
  placement: string;
  popoverRef: React.RefObject<HTMLElement | null>;
  triggerRef: React.RefObject<Element | null> | undefined;
  onTight: (tight: boolean) => void;
}) {
  const {direction} = useLocale();

  React.useLayoutEffect(() => {
    const panel = popoverRef.current;
    const trigger = triggerRef?.current;

    if (!placed || !panel || !trigger) return;
    const rtl = direction === "rtl";
    const word = placement.split(" ")[0] ?? placement;
    const mirrored: Record<string, string> = {
      start: rtl ? "right" : "left",
      end: rtl ? "left" : "right",
    };
    const side = mirrored[word] ?? word;
    const t = trigger.getBoundingClientRect();
    const view = window.visualViewport;
    const top = view?.offsetTop ?? 0;
    const left = view?.offsetLeft ?? 0;
    const height = view?.height ?? document.documentElement.clientHeight;
    const width = view?.width ?? document.documentElement.clientWidth;
    const rooms: Record<string, number> = {
      top: t.top - top,
      bottom: top + height - t.bottom,
      left: t.left - left,
      right: left + width - t.right,
    };
    const room = rooms[side];

    if (room === undefined) return;
    // Its own size, not the height React Aria may have held it to.
    const extent =
      side === "top" || side === "bottom"
        ? Math.max(panel.offsetHeight, panel.scrollHeight)
        : Math.max(panel.offsetWidth, panel.scrollWidth);

    if (extent + offset <= room && extent + offset + padding > room) onTight(true);
  }, [direction, offset, padding, placed, placement, popoverRef, triggerRef, onTight]);

  // Closed: the next opening starts from the padding again.
  React.useLayoutEffect(() => () => onTight(false), [onTight]);

  return null;
}

/* -------------------------------------------------------------------------------------------------
 * Popover Arrow
 * -----------------------------------------------------------------------------------------------*/
type PopoverArrowProps = Omit<ComponentPropsWithRef<typeof OverlayArrow>, "children"> & {
  children?: React.ReactNode;
};

const PopoverArrow = ({children, className, ...props}: PopoverArrowProps) => {
  const defaultArrow = (
    <svg
      data-slot="popover-overlay-arrow"
      fill="none"
      height="12"
      viewBox="0 0 12 12"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0C5.48483 8 6.5 8 12 0Z" />
    </svg>
  );

  const arrow = React.isValidElement(children)
    ? React.cloneElement(
        children as React.ReactElement<{
          className?: string;
          "data-slot"?: "popover-overlay-arrow";
        }>,
        {
          "data-slot": "popover-overlay-arrow",
        },
      )
    : defaultArrow;

  return (
    <OverlayArrow data-slot="popover-overlay-arrow-group" {...props} className={className}>
      {arrow}
    </OverlayArrow>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Popover Dialog
 * -----------------------------------------------------------------------------------------------*/
type PopoverDialogProps = Omit<ComponentPropsWithRef<typeof DialogPrimitive>, "children"> & {
  children: React.ReactNode;
};

const PopoverDialog = ({children, className, ...props}: PopoverDialogProps) => {
  const {slots} = use(PopoverContext);

  return (
    <DialogPrimitive
      data-slot="popover-dialog"
      {...props}
      className={composeSlotClassName(slots?.dialog, className)}
    >
      {children}
    </DialogPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Popover Trigger
 * -----------------------------------------------------------------------------------------------*/
interface PopoverTriggerProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const PopoverTrigger = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  ...props
}: PopoverTriggerProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof PopoverTriggerProps<E>>) => {
  const {slots} = use(PopoverContext);

  return (
    <PressablePrimitive>
      <dom.div
        className={composeSlotClassName(slots?.trigger, className)}
        data-slot="popover-trigger"
        role="button"
        {...(props as any)}
      >
        {children}
      </dom.div>
    </PressablePrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Popover Heading
 * -----------------------------------------------------------------------------------------------*/
type PopoverHeadingProps = ComponentPropsWithRef<typeof HeadingPrimitive> & {};

const PopoverHeading = ({children, className, ...props}: PopoverHeadingProps) => {
  const {slots} = use(PopoverContext);

  return (
    <HeadingPrimitive
      slot="title"
      {...props}
      className={composeSlotClassName(slots?.heading, className)}
    >
      {children}
    </HeadingPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {PopoverRoot, PopoverTrigger, PopoverDialog, PopoverArrow, PopoverContent, PopoverHeading};

export type {
  PopoverRootProps,
  PopoverTriggerProps,
  PopoverDialogProps,
  PopoverArrowProps,
  PopoverContentProps,
  PopoverHeadingProps,
};
