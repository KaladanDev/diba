/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: The default indicator is Flutter's checkbox: one SVG drawn each frame
 * by a port of Flutter's `_CheckboxPainter` (src/utils/toggle-motion.ts), the box, its edge and the
 * tick together, so the check, the squeeze at mid-turn and the colours move as Flutter's do.
 */
"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {CheckboxVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef, ReactNode} from "react";
import type {
  CheckboxButtonRenderProps,
  CheckboxFieldRenderProps,
} from "react-aria-components/Checkbox";

import {checkboxVariants} from "../../styles/recipes";
import React, {createContext, use} from "react";
import {
  CheckboxButton as CheckboxButtonPrimitive,
  CheckboxField as CheckboxFieldPrimitive,
} from "react-aria-components/Checkbox";
import {LabelContext} from "react-aria-components/Label";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {
  CHECKBOX,
  checkboxAttributes,
  paintCheckbox,
  useToggleMotion,
} from "../../utils/toggle-motion";
import {CheckboxGroupContext} from "../checkbox-group/checkbox-group";

const LABEL_SPAN_CONTEXT = {elementType: "span" as const};

interface CheckboxContext {
  slots?: ReturnType<typeof checkboxVariants>;
  state?: CheckboxFieldRenderProps;
}

const CheckboxContext = createContext<CheckboxContext>({});

/* -------------------------------------------------------------------------------------------------
 * Checkbox (Field) — React Aria `CheckboxField`.
 * -----------------------------------------------------------------------------------------------*/
interface CheckboxRootProps
  extends ComponentPropsWithRef<typeof CheckboxFieldPrimitive>, CheckboxVariants {
  /** The name of the checkbox, used when submitting an HTML form. */
  name?: string;
}

const CheckboxRoot = ({children, className, variant, ...props}: CheckboxRootProps) => {
  const checkboxGroupContext = use(CheckboxGroupContext);
  const effectiveVariant = variant ?? checkboxGroupContext.variant;
  const slots = React.useMemo(
    () => checkboxVariants({variant: effectiveVariant}),
    [effectiveVariant],
  );

  return (
    <CheckboxFieldPrimitive
      data-slot="checkbox"
      {...props}
      className={composeTwRenderProps(className, slots.base())}
    >
      {(state) => (
        <CheckboxContext value={{slots, state}}>
          {typeof children === "function" ? children(state) : children}
        </CheckboxContext>
      )}
    </CheckboxFieldPrimitive>
  );
};

CheckboxRoot.displayName = "Diba.Checkbox";

/* -------------------------------------------------------------------------------------------------
 * Checkbox.Content — the clickable `CheckboxButton` label wrapping the control + `Label`.
 * Keep `Description`/`FieldError` as siblings of `Checkbox.Content`.
 * -----------------------------------------------------------------------------------------------*/
interface CheckboxContentProps extends ComponentPropsWithRef<typeof CheckboxButtonPrimitive> {}

const CheckboxContent = ({children, className, ...props}: CheckboxContentProps) => {
  const {slots} = use(CheckboxContext);

  return (
    <CheckboxButtonPrimitive
      data-slot="checkbox-content"
      {...props}
      className={composeTwRenderProps(className, slots?.content())}
    >
      {(state) => (
        <LabelContext value={LABEL_SPAN_CONTEXT}>
          {typeof children === "function" ? children(state) : children}
        </LabelContext>
      )}
    </CheckboxButtonPrimitive>
  );
};

CheckboxContent.displayName = "Diba.Checkbox.Content";

/* -----------------------------------------------------------------------------------------------*/

interface CheckboxControlProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const CheckboxControl = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  ...props
}: CheckboxControlProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof CheckboxControlProps<E>>) => {
  const {slots} = use(CheckboxContext);

  return (
    <dom.span
      className={composeSlotClassName(slots?.control, className)}
      data-slot="checkbox-control"
      {...(props as any)}
    >
      {children}
    </dom.span>
  );
};

CheckboxControl.displayName = "Diba.Checkbox.Control";

/* -----------------------------------------------------------------------------------------------*/

interface CheckboxIndicatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode | ((props: CheckboxFieldRenderProps) => ReactNode);
  className?: string;
}

const CheckboxIndicator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  ...props
}: CheckboxIndicatorProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof CheckboxIndicatorProps<E>>) => {
  const {slots, state} = use(CheckboxContext);
  const ref = React.useRef<HTMLSpanElement>(null);

  const content =
    typeof children === "function" ? (
      children(state ?? ({} as CheckboxFieldRenderProps))
    ) : children ? (
      children
    ) : (
      <FlutterCheckbox
        element={ref}
        isInvalid={Boolean(state?.isInvalid)}
        value={state?.isIndeterminate ? null : Boolean(state?.isSelected)}
      />
    );

  return (
    <dom.span
      ref={ref}
      aria-hidden="true"
      className={composeSlotClassName(slots?.indicator, className)}
      data-slot="checkbox-indicator"
      {...(props as any)}
    >
      {content}
    </dom.span>
  );
};

/**
 * Flutter's checkbox, drawn as `_CheckboxPainter` draws it, from the same toggle position. React
 * renders it at rest; each frame of a change is written straight to the SVG. The colours are
 * the choices' roles: the edge in the muted text colour (the text colour under a hover, a press or
 * focus, as `--choice-outline` says), the fill gilt, the tick slate-700; danger when invalid.
 */
const FlutterCheckbox = ({
  element,
  isInvalid,
  value,
}: {
  element: {current: Element | null};
  isInvalid: boolean;
  value: boolean | null;
}) => {
  const colours = {
    edge: isInvalid ? "var(--db-danger)" : "var(--choice-outline, var(--muted))",
    fill: isInvalid ? "var(--db-danger)" : "var(--db-control-fill)",
    mark: isInvalid ? "var(--db-danger-fg)" : "var(--db-control-on-fill)",
  };
  const svg = React.useRef<SVGSVGElement>(null);
  const fillRef = React.useRef<SVGRectElement>(null);
  const edgeRef = React.useRef<SVGRectElement>(null);
  const markRef = React.useRef<SVGPathElement>(null);

  useToggleMotion(
    value,
    (frame) => {
      const a = checkboxAttributes(paintCheckbox(frame.previous, value, frame), colours);
      const fill = fillRef.current;
      const edge = edgeRef.current;
      const mark = markRef.current;

      if (!svg.current || !fill || !edge || !mark) return;
      svg.current.setAttribute("data-mark", a.mark.kind);
      for (const key of ["x", "y", "width", "height"] as const) {
        fill.setAttribute(key, String(a.fill[key]));
        edge.setAttribute(key, String(a.edge[key]));
      }
      fill.style.fill = a.fill.fill;
      edge.setAttribute("rx", String(a.edge.rx));
      edge.setAttribute("stroke-width", String(a.edge.strokeWidth));
      edge.style.stroke = a.edge.stroke;
      edge.style.display = a.edge.visible ? "" : "none";
      mark.setAttribute("d", a.mark.d);
      mark.style.display = a.mark.d ? "" : "none";
    },
    {element, tristate: true},
  );

  const rest = checkboxAttributes(
    paintCheckbox(value, value, {position: value === false ? 0 : 1, status: value === false ? "dismissed" : "completed"}),
    colours,
  );

  return (
    <svg
      ref={svg}
      aria-hidden="true"
      data-mark={rest.mark.kind}
      data-slot="checkbox-default-indicator--flutter"
      fill="none"
      role="presentation"
      viewBox={`0 0 ${CHECKBOX.EDGE} ${CHECKBOX.EDGE}`}
    >
      <rect
        ref={fillRef}
        data-slot="checkbox-flutter-fill"
        height={rest.fill.height}
        rx={CHECKBOX.RADIUS}
        style={{fill: rest.fill.fill}}
        width={rest.fill.width}
        x={rest.fill.x}
        y={rest.fill.y}
      />
      <rect
        ref={edgeRef}
        data-slot="checkbox-flutter-edge"
        height={rest.edge.height}
        rx={rest.edge.rx}
        strokeWidth={rest.edge.strokeWidth}
        style={{stroke: rest.edge.stroke, display: rest.edge.visible ? undefined : "none"}}
        width={rest.edge.width}
        x={rest.edge.x}
        y={rest.edge.y}
      />
      <path
        ref={markRef}
        d={rest.mark.d}
        data-slot="checkbox-flutter-mark"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeWidth={CHECKBOX.STROKE}
        style={{stroke: rest.mark.stroke, display: rest.mark.d ? undefined : "none"}}
      />
    </svg>
  );
};

CheckboxIndicator.displayName = "Diba.Checkbox.Indicator";

/* ----------------------------------------------------------------------------------------------*/

export {CheckboxRoot, CheckboxContent, CheckboxControl, CheckboxIndicator, FlutterCheckbox};
export type {
  CheckboxRootProps,
  CheckboxContentProps,
  CheckboxControlProps,
  CheckboxIndicatorProps,
  CheckboxFieldRenderProps,
  CheckboxButtonRenderProps,
};
