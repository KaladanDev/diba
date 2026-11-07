/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: the tick is dark on a colour it is clearer on, by relative luminance, as
 * Flutter's.
 */
"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {ColorSwatchPickerVariants} from "../../styles/recipes";
import type {CSSProperties, ComponentPropsWithRef} from "react";
import type {ColorSwatchPickerItemRenderProps} from "react-aria-components/ColorSwatchPicker";

import {colorSwatchPickerVariants} from "../../styles/recipes";
import React, {createContext, use} from "react";
import {
  ColorSwatchPickerItem as ColorSwatchPickerItemPrimitive,
  ColorSwatchPicker as ColorSwatchPickerPrimitive,
  ColorSwatch as ColorSwatchPrimitive,
} from "react-aria-components/ColorSwatchPicker";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";

/* -------------------------------------------------------------------------------------------------
| * ColorSwatchPicker Context
| * -----------------------------------------------------------------------------------------------*/
interface ColorSwatchPickerContext {
  slots?: ReturnType<typeof colorSwatchPickerVariants>;
}

const ColorSwatchPickerContext = createContext<ColorSwatchPickerContext>({});

/* -------------------------------------------------------------------------------------------------
| * ColorSwatchPickerItem Context
| * -----------------------------------------------------------------------------------------------*/
interface ColorSwatchPickerItemContext {
  state?: ColorSwatchPickerItemRenderProps;
}

const ColorSwatchPickerItemContext = createContext<ColorSwatchPickerItemContext>({});

/* -------------------------------------------------------------------------------------------------
| * ColorSwatchPicker Root
| * -----------------------------------------------------------------------------------------------*/
interface ColorSwatchPickerRootProps
  extends ComponentPropsWithRef<typeof ColorSwatchPickerPrimitive>, ColorSwatchPickerVariants {}

const ColorSwatchPickerRoot = ({
  children,
  className,
  layout,
  size,
  variant,
  ...props
}: ColorSwatchPickerRootProps) => {
  const slots = React.useMemo(
    () => colorSwatchPickerVariants({layout, size, variant}),
    [layout, size, variant],
  );
  const contextValue = React.useMemo(() => ({slots}), [slots]);

  return (
    <ColorSwatchPickerContext value={contextValue}>
      <ColorSwatchPickerPrimitive
        data-slot="color-swatch-picker"
        {...props}
        className={composeTwRenderProps(className, slots.base())}
      >
        {children}
      </ColorSwatchPickerPrimitive>
    </ColorSwatchPickerContext>
  );
};

/* -------------------------------------------------------------------------------------------------
| * ColorSwatchPicker Item
| * -----------------------------------------------------------------------------------------------*/
interface ColorSwatchPickerItemProps extends ComponentPropsWithRef<
  typeof ColorSwatchPickerItemPrimitive
> {}

const ColorSwatchPickerItem = ({children, className, ...props}: ColorSwatchPickerItemProps) => {
  const {slots} = use(ColorSwatchPickerContext);

  return (
    <ColorSwatchPickerItemPrimitive
      data-slot="color-swatch-picker-item"
      {...props}
      className={composeTwRenderProps(className, slots?.item())}
      style={(renderProps) =>
        ({
          "--color-swatch-current": renderProps.color.toString("css"),
        }) as CSSProperties
      }
    >
      {(renderProps) => (
        <ColorSwatchPickerItemContext value={{state: renderProps}}>
          {typeof children === "function" ? children(renderProps) : children}
        </ColorSwatchPickerItemContext>
      )}
    </ColorSwatchPickerItemPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
| * ColorSwatchPicker Swatch
| * -----------------------------------------------------------------------------------------------*/
interface ColorSwatchPickerSwatchProps extends ComponentPropsWithRef<typeof ColorSwatchPrimitive> {}

const ColorSwatchPickerSwatch = ({className, ...props}: ColorSwatchPickerSwatchProps) => {
  const {slots} = use(ColorSwatchPickerContext);

  return (
    <ColorSwatchPrimitive
      className={composeTwRenderProps(className, slots?.swatch())}
      data-slot="color-swatch-picker-swatch"
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
| * ColorSwatchPicker Indicator
| * -----------------------------------------------------------------------------------------------*/
interface ColorSwatchPickerIndicatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: React.ReactNode | ((props: ColorSwatchPickerItemRenderProps) => React.ReactNode);
  className?: string;
}

/**
 * A colour's relative luminance, as WCAG and Flutter's `computeLuminance` reckon it: each channel
 * made linear, then weighted. Between 0 (black) and 1 (white).
 */
function getColorLuminance(color: ColorSwatchPickerItemRenderProps["color"]): number {
  const rgb = color.toFormat("rgb");
  const linear = (channel: "red" | "green" | "blue") => {
    const c = rgb.getChannelValue(channel) / 255;

    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * linear("red") + 0.7152 * linear("green") + 0.0722 * linear("blue");
}

/**
 * Above this, a black tick is clearer on the colour than a white one: where (L + 0.05) / 0.05
 * passes 1.05 / (L + 0.05). Either is at least 4.5 from the colour.
 */
const DARK_TICK_ABOVE = 0.179;

const ColorSwatchPickerIndicator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  ...props
}: ColorSwatchPickerIndicatorProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof ColorSwatchPickerIndicatorProps<E>>) => {
  const {slots} = use(ColorSwatchPickerContext);
  const {state} = use(ColorSwatchPickerItemContext);

  // A black tick on a colour it is clearer on, a white one on the rest.
  const isLightColor = state?.color ? getColorLuminance(state.color) > DARK_TICK_ABOVE : false;

  const content =
    typeof children === "function" ? (
      children(state ?? ({} as ColorSwatchPickerItemRenderProps))
    ) : children ? (
      children
    ) : (
      <svg
        aria-hidden="true"
        data-slot="color-swatch-picker-checkmark"
        fill="none"
        role="presentation"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        viewBox="0 0 12 12"
      >
        <polyline points="2.5 6 5 8.5 9.5 3" />
      </svg>
    );

  return (
    <dom.span
      aria-hidden="true"
      className={composeSlotClassName(slots?.indicator, className)}
      data-light-color={isLightColor ? "true" : undefined}
      data-slot="color-swatch-picker-indicator"
      {...(props as any)}
    >
      {content}
    </dom.span>
  );
};

/* -------------------------------------------------------------------------------------------------
| * Exports
| * -----------------------------------------------------------------------------------------------*/
export {
  ColorSwatchPickerRoot,
  ColorSwatchPickerItem,
  ColorSwatchPickerSwatch,
  ColorSwatchPickerIndicator,
};

export type {
  ColorSwatchPickerRootProps,
  ColorSwatchPickerItemProps,
  ColorSwatchPickerSwatchProps,
  ColorSwatchPickerIndicatorProps,
};
