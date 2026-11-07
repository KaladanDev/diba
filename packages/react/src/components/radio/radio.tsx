/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: An empty indicator is Flutter's radio: one SVG drawn each frame as
 * Flutter's `_RadioPainter` draws it, from the same toggle position (src/utils/toggle-motion.ts).
 */
"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {ComponentPropsWithRef, ReactNode} from "react";
import type {RadioButtonRenderProps, RadioFieldRenderProps} from "react-aria-components/RadioGroup";

import {radioVariants} from "../../styles/recipes";
import React, {createContext, use} from "react";
import {LabelContext} from "react-aria-components/Label";
import {
  RadioButton as RadioButtonPrimitive,
  RadioField as RadioFieldPrimitive,
} from "react-aria-components/RadioGroup";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {RADIO, radioAttributes, useToggleMotion} from "../../utils/toggle-motion";

const LABEL_SPAN_CONTEXT = {elementType: "span" as const};

interface RadioContext {
  slots?: ReturnType<typeof radioVariants>;
  state?: RadioFieldRenderProps;
}

const RadioContext = createContext<RadioContext>({});

/* -------------------------------------------------------------------------------------------------
 * Radio (Field) — React Aria `RadioField`.
 * -----------------------------------------------------------------------------------------------*/
interface RadioRootProps extends ComponentPropsWithRef<typeof RadioFieldPrimitive> {
  /** The name of the radio button, used when submitting an HTML form. */
  name?: string;
}

const RadioRoot = ({children, className, ...props}: RadioRootProps) => {
  const slots = React.useMemo(() => radioVariants(), []);

  return (
    <RadioFieldPrimitive
      data-slot="radio"
      {...props}
      className={composeTwRenderProps(className, slots.base())}
    >
      {(state) => (
        <RadioContext value={{slots, state}}>
          {typeof children === "function" ? children(state) : children}
        </RadioContext>
      )}
    </RadioFieldPrimitive>
  );
};

RadioRoot.displayName = "Diba.Radio";

/* -------------------------------------------------------------------------------------------------
 * Radio.Content — the clickable `RadioButton` label wrapping the control + `Label`.
 * Keep `Description`/`FieldError` as siblings of `Radio.Content`.
 * -----------------------------------------------------------------------------------------------*/
interface RadioContentProps extends ComponentPropsWithRef<typeof RadioButtonPrimitive> {}

const RadioContent = ({children, className, ...props}: RadioContentProps) => {
  const {slots} = use(RadioContext);

  return (
    <RadioButtonPrimitive
      data-slot="radio-content"
      {...props}
      className={composeTwRenderProps(className, slots?.content())}
    >
      {(state) => (
        <LabelContext value={LABEL_SPAN_CONTEXT}>
          {typeof children === "function" ? children(state) : children}
        </LabelContext>
      )}
    </RadioButtonPrimitive>
  );
};

RadioContent.displayName = "Diba.Radio.Content";

/* -----------------------------------------------------------------------------------------------*/

interface RadioControlProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const RadioControl = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  ...props
}: RadioControlProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof RadioControlProps<E>>) => {
  const {slots} = use(RadioContext);

  return (
    <dom.span
      className={composeSlotClassName(slots?.control, className)}
      data-slot="radio-control"
      {...(props as any)}
    >
      {children}
    </dom.span>
  );
};

RadioControl.displayName = "Diba.Radio.Control";

/* -----------------------------------------------------------------------------------------------*/

interface RadioIndicatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode | ((props: RadioFieldRenderProps) => ReactNode);
  className?: string;
}

const RadioIndicator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  ...props
}: RadioIndicatorProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof RadioIndicatorProps<E>>) => {
  const {slots, state} = use(RadioContext);
  const ref = React.useRef<HTMLSpanElement>(null);

  const content =
    typeof children === "function" ? (
      children(state ?? ({} as RadioFieldRenderProps))
    ) : children != null ? (
      children
    ) : (
      <FlutterRadio
        element={ref}
        isInvalid={Boolean(state?.isInvalid)}
        isSelected={Boolean(state?.isSelected)}
      />
    );

  return (
    <dom.span
      ref={ref}
      aria-hidden="true"
      className={composeSlotClassName(slots?.indicator, className)}
      data-slot="radio-indicator"
      {...(props as any)}
    >
      {content}
    </dom.span>
  );
};

/**
 * Flutter's radio, drawn as `_RadioPainter` draws it: the background, the ring and the dot each
 * lerp with the toggle position, the dot growing to 4.5 from the centre. React renders it at rest;
 * each frame of a change is written straight to the SVG. The colours are the choices' roles: a
 * slate-500 ring that turns gilt over a gilt disc, and a slate-700 dot.
 */
const FlutterRadio = ({
  element,
  isInvalid,
  isSelected,
}: {
  element: {current: Element | null};
  isInvalid: boolean;
  isSelected: boolean;
}) => {
  const colours = {
    ring: isInvalid ? "var(--db-danger)" : "var(--db-slate-500)",
    fill: "var(--db-control-fill)",
    dot: "var(--db-control-on-fill)",
  };
  const discRef = React.useRef<SVGCircleElement>(null);
  const ringRef = React.useRef<SVGCircleElement>(null);
  const dotRef = React.useRef<SVGCircleElement>(null);
  const {INNER, OUTER, STROKE} = RADIO;

  useToggleMotion(
    isSelected,
    ({position}) => {
      const a = radioAttributes(position, colours);

      if (!discRef.current || !ringRef.current || !dotRef.current) return;
      discRef.current.style.fill = a.disc;
      ringRef.current.style.stroke = a.ring;
      dotRef.current.setAttribute("r", String(a.dot.r));
      dotRef.current.style.fill = a.dot.fill;
      dotRef.current.style.display = a.dot.r > 0 ? "" : "none";
    },
    {element},
  );

  const rest = radioAttributes(isSelected ? 1 : 0, colours);

  return (
    <svg
      aria-hidden="true"
      data-slot="radio-default-indicator--flutter"
      fill="none"
      role="presentation"
      viewBox={`0 0 ${OUTER * 2} ${OUTER * 2}`}
    >
      <circle ref={discRef} cx={OUTER} cy={OUTER} r={OUTER} style={{fill: rest.disc}} />
      <circle
        ref={ringRef}
        cx={OUTER}
        cy={OUTER}
        r={OUTER - STROKE / 2}
        strokeWidth={STROKE}
        style={{stroke: rest.ring}}
      />
      <circle
        ref={dotRef}
        cx={OUTER}
        cy={OUTER}
        data-slot="radio-default-indicator--dot"
        r={INNER * (isSelected ? 1 : 0)}
        style={{fill: rest.dot.fill, display: isSelected ? undefined : "none"}}
      />
    </svg>
  );
};

RadioIndicator.displayName = "Diba.Radio.Indicator";

/* ----------------------------------------------------------------------------------------------*/

export {RadioRoot, RadioContent, RadioControl, RadioIndicator, FlutterRadio};
export type {
  RadioRootProps,
  RadioContentProps,
  RadioControlProps,
  RadioIndicatorProps,
  RadioFieldRenderProps,
  RadioButtonRenderProps,
};
