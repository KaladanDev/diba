/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: The fill starts at the inline start, so it grows from the right in Persian,
 * where it had started from the left. A slider given a `step` draws a dot at each step, as
 * Flutter's does, when the dots are at least 6px apart; the track measures itself to tell. A
 * range's two thumbs are named its least and its most after the slider's label, «کمترین» and
 * «بیشترین», where both had been read as the label alone.
 */
"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {SliderVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";
import type {SliderRenderProps} from "react-aria-components/Slider";

import {sliderVariants} from "../../styles/recipes";
import {mergeRefs} from "@react-aria/utils";
import React, {createContext, use} from "react";
import {
  SliderOutput as SliderOutputPrimitive,
  Slider as SliderPrimitive,
  SliderThumb as SliderThumbPrimitive,
  SliderTrack as SliderTrackPrimitive,
} from "react-aria-components/Slider";

import {dataAttr} from "../../utils/assertion";
import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {useDibaStrings} from "../../i18n/strings";

/* -------------------------------------------------------------------------------------------------
 * Component Status: Preview
 * -----------------------------------------------------------------------------------------------*/

// TODO: marks support

/* -------------------------------------------------------------------------------------------------
 * Slider Context
 * -----------------------------------------------------------------------------------------------*/
interface SliderContext {
  slots?: ReturnType<typeof sliderVariants>;
  state?: SliderRenderProps;
  /** Whether a `step` was given, which is when Flutter's slider draws its step dots. */
  hasStep?: boolean;
}

const SliderContext = createContext<SliderContext>({});

/* -------------------------------------------------------------------------------------------------
 * Slider Root
 * -----------------------------------------------------------------------------------------------*/
interface SliderRootProps extends ComponentPropsWithRef<typeof SliderPrimitive>, SliderVariants {}

const SliderRoot = ({
  children,
  className,
  orientation = "horizontal",
  ...props
}: SliderRootProps) => {
  const slots = React.useMemo(() => sliderVariants({}), []);

  return (
    <SliderPrimitive
      data-slot="slider"
      orientation={orientation}
      {...props}
      className={composeTwRenderProps(className, slots.base())}
    >
      {(values) => (
        <SliderContext value={{slots, state: values, hasStep: props.step !== undefined}}>
          {typeof children === "function" ? children(values) : children}
        </SliderContext>
      )}
    </SliderPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Slider Output
 * -----------------------------------------------------------------------------------------------*/
interface SliderOutputProps extends ComponentPropsWithRef<typeof SliderOutputPrimitive> {}

const SliderOutput = ({children, className, ...props}: SliderOutputProps) => {
  const {slots} = use(SliderContext);

  return (
    <SliderOutputPrimitive
      className={composeTwRenderProps(className, slots?.output())}
      data-slot="slider-output"
      {...props}
    >
      {children
        ? (values) => <>{typeof children === "function" ? children(values) : children}</>
        : ({state}) => state.values.map((_, i) => state.getThumbValueLabel(i)).join(" – ")}
    </SliderOutputPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Slider Track
 * -----------------------------------------------------------------------------------------------*/
interface SliderTrackProps extends ComponentPropsWithRef<typeof SliderTrackPrimitive> {}

/**
 * Flutter leaves out a discrete slider's dots when they would be closer than three dot widths
 * (2px each); so does this.
 */
const STEP_MIN_SPACING = 6;

const SliderTrack = ({children, className, ref, ...props}: SliderTrackProps) => {
  const {hasStep, slots, state} = use(SliderContext);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [length, setLength] = React.useState(0);
  const isVertical = state?.orientation === "vertical";

  React.useLayoutEffect(() => {
    const track = trackRef.current;

    if (!hasStep || !track || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setLength(isVertical ? entry.contentRect.height : entry.contentRect.width);
    });

    observer.observe(track);

    return () => observer.disconnect();
  }, [hasStep, isVertical]);

  const {getThumbPercent, values} = state?.state || {};

  const singleThumb = values?.length && values.length === 1;

  const [startOffset, endOffset] = [
    values?.length && values.length > 1 ? getThumbPercent?.(0) : 0,
    getThumbPercent?.(values?.length ? values.length - 1 : 0),
  ].sort();

  const fillWidth = (endOffset! - startOffset!) * 100;

  const sliderState = state?.state;
  const min = sliderState?.getThumbMinValue(0) ?? 0;
  const max = sliderState?.getThumbMaxValue(values?.length ? values.length - 1 : 0) ?? 0;
  const divisions = sliderState?.step ? Math.round((max - min) / sliderState.step) : 0;
  const showSteps =
    hasStep && divisions > 0 && length > 0 && length / divisions >= STEP_MIN_SPACING;
  const [fillStart, fillEnd] = [startOffset ?? 0, endOffset ?? 0];

  return (
    <SliderTrackPrimitive
      ref={mergeRefs(ref, trackRef)}
      className={composeTwRenderProps(className, slots?.track())}
      data-disabled={dataAttr(state?.isDisabled)}
      data-slot="slider-track"
      {...(singleThumb
        ? {
            "data-fill-start": dataAttr(fillWidth > 0),
            "data-fill-end": dataAttr(fillWidth == 100),
          }
        : {
            "data-fill-start": dataAttr(startOffset == 0),
            "data-fill-end": dataAttr(startOffset! * 100 + fillWidth == 100),
          })}
      {...props}
    >
      {(values) => (
        <>
          {showSteps ? (
            <div aria-hidden className="slider__steps" data-slot="slider-steps">
              {Array.from({length: divisions + 1}, (_, i) => {
                const at = i / divisions;

                return (
                  <span
                    key={i}
                    className="slider__step"
                    data-active={dataAttr(at >= fillStart - 1e-9 && at <= fillEnd + 1e-9)}
                    style={{[isVertical ? "bottom" : "insetInlineStart"]: `${at * 100}%`}}
                  />
                );
              })}
            </div>
          ) : null}
          {typeof children === "function" ? children(values) : children}
        </>
      )}
    </SliderTrackPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Slider Fill
 * -----------------------------------------------------------------------------------------------*/
interface SliderFillProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  className?: string;
}

const SliderFill = <E extends keyof React.JSX.IntrinsicElements = "div">({
  className,
  style,
  ...props
}: SliderFillProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof SliderFillProps<E>>) => {
  const {slots, state} = use(SliderContext);

  const {getThumbPercent, orientation, values} = state?.state || {};

  const [startOffset, endOffset] = [
    values?.length && values.length > 1 ? getThumbPercent?.(0) : 0,
    getThumbPercent?.(values?.length ? values.length - 1 : 0),
  ].sort();

  const isVertical = orientation === "vertical";

  return (
    <dom.div
      className={composeSlotClassName(slots?.fill, className)}
      data-disabled={dataAttr(state?.isDisabled)}
      data-slot="slider-fill"
      style={{
        ...style,
        [isVertical ? "bottom" : "insetInlineStart"]: `${startOffset! * 100}%`,
        ...(isVertical
          ? {
              height: `${(endOffset! - startOffset!) * 100}%`,
            }
          : {
              width: `${(endOffset! - startOffset!) * 100}%`,
            }),
      }}
      {...(props as any)}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Slider Thumb
 * -----------------------------------------------------------------------------------------------*/
interface SliderThumbProps extends ComponentPropsWithRef<typeof SliderThumbPrimitive> {}

const SliderThumb = ({children, className, ...props}: SliderThumbProps) => {
  const {slots, state} = use(SliderContext);
  const t = useDibaStrings();
  const index = props.index ?? 0;
  // A range's thumbs say which end each is; one thumb is the slider's label alone.
  const end =
    state?.state.values.length === 2 ? (index === 0 ? t.minimum : t.maximum) : undefined;

  return (
    <SliderThumbPrimitive
      className={composeTwRenderProps(className, slots?.thumb())}
      data-slot="slider-thumb"
      {...props}
      aria-label={props["aria-label"] ?? end}
    >
      {(values) => <>{typeof children === "function" ? children(values) : children}</>}
    </SliderThumbPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * TODO: Slider Marks
 * -----------------------------------------------------------------------------------------------*/
interface SliderMarksProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  className?: string;
}

const SliderMarks = <E extends keyof React.JSX.IntrinsicElements = "div">({
  className,
  ...props
}: SliderMarksProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof SliderMarksProps<E>>) => {
  const {slots} = use(SliderContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.marks, className)}
      data-slot="slider-marks"
      {...(props as any)}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {SliderRoot, SliderOutput, SliderTrack, SliderFill, SliderThumb, SliderMarks};

export type {
  SliderRootProps,
  SliderOutputProps,
  SliderTrackProps,
  SliderFillProps,
  SliderThumbProps,
  SliderMarksProps,
};
