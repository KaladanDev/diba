/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: the input shows a date at rest as Flutter does, with the month's name and
 * the time as hours and minutes («۲۴ مهر ۱۴۰۵، ۱۴:۰۰»), and its typed segments only while it has
 * focus; a time field's shows its time so, «۰۹:۳۰».
 */
"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {DateInputGroupVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef, ReactNode} from "react";
import type {
  DateInputProps as DateInputPrimitiveProps,
  DateSegmentProps as DateSegmentPrimitiveProps,
  DateInputProps as TimeInputPrimitiveProps,
  DateSegmentProps as TimeSegmentPrimitiveProps,
} from "react-aria-components/DateField";

import {dateInputGroupVariants} from "../../styles/recipes";
import {DateFormatter, getLocalTimeZone} from "@internationalized/date";
import React, {createContext, use, useContext} from "react";
import {
  DateFieldStateContext,
  DateInput as DateInputPrimitive,
  DateSegment as DateSegmentPrimitive,
} from "react-aria-components/DateField";
import {useLocale} from "react-aria-components/I18nProvider";
import {TimeFieldStateContext} from "react-aria-components/TimeField";
import {Group as GroupPrimitive} from "react-aria-components/Group";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup Context
 * -----------------------------------------------------------------------------------------------*/
type DateInputGroupContext = {
  slots?: ReturnType<typeof dateInputGroupVariants>;
};

const DateInputGroupContext = createContext<DateInputGroupContext>({});

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup Root
 * -----------------------------------------------------------------------------------------------*/
interface DateInputGroupRootProps
  extends ComponentPropsWithRef<typeof GroupPrimitive>, DateInputGroupVariants {}

const DateInputGroupRoot = ({
  children,
  className,
  fullWidth,
  variant,
  ...props
}: DateInputGroupRootProps) => {
  const slots = React.useMemo(
    () => dateInputGroupVariants({fullWidth, variant}),
    [fullWidth, variant],
  );
  const contextValue = React.useMemo(() => ({slots}), [slots]);

  return (
    <DateInputGroupContext value={contextValue}>
      <GroupPrimitive
        className={composeTwRenderProps(className, slots?.base())}
        data-slot="date-input-group"
        {...props}
      >
        {(values) => <>{typeof children === "function" ? children(values) : children}</>}
      </GroupPrimitive>
    </DateInputGroupContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup Prefix
 * -----------------------------------------------------------------------------------------------*/
interface DateInputGroupPrefixProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const DateInputGroupPrefix = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  ...props
}: DateInputGroupPrefixProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof DateInputGroupPrefixProps<E>>) => {
  const {slots} = use(DateInputGroupContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.prefix, className)}
      data-slot="date-input-group-prefix"
      {...(props as any)}
    >
      {children}
    </dom.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup Input
 * -----------------------------------------------------------------------------------------------*/
interface DateInputGroupInputProps
  extends
    DateInputPrimitiveProps,
    Partial<Omit<TimeInputPrimitiveProps, keyof DateInputPrimitiveProps>> {}

const DateInputGroupInput = ({children, className, ...props}: DateInputGroupInputProps) => {
  const {slots} = use(DateInputGroupContext);

  // TimeInput and DateInput have compatible interfaces
  // React Aria Components will handle the correct primitive based on parent context (TimeField vs DateField)
  // We use DateInputPrimitive as the default, but it will work with TimeField context
  // The wrapper is always there, so a value arriving while the user types does not remount the
  // input and take its focus away. The resting date is drawn from inside the input, where a date
  // picker's field state lives.
  return (
    <span className="date-input-group__resting" data-slot="date-input-group-resting">
      <DateInputPrimitive
        className={composeTwRenderProps(className, slots?.input())}
        data-slot="date-input-group-input"
        {...(props as Omit<DateInputPrimitiveProps, "children">)}
      >
        {(segment) => (
          <>
            {children(segment)}
            <RestingDate segment={segment} />
            <RestingTime segment={segment} />
          </>
        )}
      </DateInputPrimitive>
    </span>
  );
};

type DateSegmentType = Parameters<DateInputPrimitiveProps["children"]>[0];

/**
 * A date field's value as Flutter's field shows it: the day, the month's name and the year in
 * the field's own calendar, then the time as hours and minutes when the field has one. Segments
 * cannot spell a month, so this is drawn over them at rest; the segments are what a screen reader
 * reads, and what the user types into once the field has focus. Drawn once, beside the first
 * segment. A time field draws {@link RestingTime} instead.
 */
function RestingDate({segment}: {segment: DateSegmentType}) {
  const state = useContext(DateFieldStateContext);
  const {locale} = useLocale();
  const value = state?.value;

  if (!state || !value || state.segments[0] !== segment) return null;
  const timeZone = "timeZone" in value ? value.timeZone : getLocalTimeZone();
  const date = value.toDate(timeZone);
  const day = new DateFormatter(locale, {
    calendar: state.calendar.identifier,
    day: "numeric",
    month: "long",
    timeZone,
    year: "numeric",
  }).format(date);
  let text = day;

  if (state.granularity !== "day") {
    const hour12 = state.segments.some((part) => part.type === "dayPeriod");
    const clock = new DateFormatter(locale, {
      hour: hour12 ? "numeric" : "2-digit",
      hour12,
      minute: "2-digit",
      timeZone,
    }).format(date);
    const zone = state.segments.find((part) => part.type === "timeZoneName")?.text;
    const persian = locale.split("-")[0] === "fa";

    text = `${day}${persian ? "، " : ", "}${clock}${zone ? ` ${zone}` : ""}`;
  }

  return (
    <span
      aria-hidden="true"
      className="date-input-group__display"
      data-slot="date-input-group-display"
    >
      {text}
    </span>
  );
}

/**
 * A time field's value as Flutter's field shows it: hours and minutes, «۰۹:۳۰», or «۹:۳۰ ب.ظ»
 * on a 12-hour clock, with seconds when the field counts them. A right-to-left page lays the typed
 * segments out hour first from the right, «۳۰:۰۹»; the drawn time reads as a clock does.
 */
function RestingTime({segment}: {segment: DateSegmentType}) {
  const state = useContext(TimeFieldStateContext);
  const {locale} = useLocale();
  const value = state?.value;

  if (!state || !value || state.segments[0] !== segment) return null;
  // A Time, or the time of a date and time: either has these three.
  const time = value as unknown as {hour: number; minute: number; second: number};
  const hour12 = state.segments.some((part) => part.type === "dayPeriod");
  const seconds = state.segments.some((part) => part.type === "second");
  const text = new DateFormatter(locale, {
    hour: hour12 ? "numeric" : "2-digit",
    hour12,
    minute: "2-digit",
    second: seconds ? "2-digit" : undefined,
  }).format(new Date(2000, 0, 1, time.hour, time.minute, time.second));

  return (
    <span
      aria-hidden="true"
      className="date-input-group__display"
      data-slot="date-input-group-display"
    >
      {text}
    </span>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup Segment
 * -----------------------------------------------------------------------------------------------*/

interface DateInputGroupSegmentProps
  extends
    DateSegmentPrimitiveProps,
    Partial<Omit<TimeSegmentPrimitiveProps, keyof DateSegmentPrimitiveProps>> {
  className?: string;
}

const DateInputGroupSegment = ({className, segment, ...props}: DateInputGroupSegmentProps) => {
  const {slots} = use(DateInputGroupContext);

  // TimeSegment and DateSegment have compatible interfaces
  // React Aria Components will handle the correct primitive based on parent context
  // We use DateSegmentPrimitive as the default, but it will work with TimeField context
  return (
    <DateSegmentPrimitive
      className={composeSlotClassName(slots?.segment, className)}
      data-slot="date-input-group-segment"
      segment={segment}
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup InputContainer
 * -----------------------------------------------------------------------------------------------*/
interface DateInputGroupInputContainerProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const DateInputGroupInputContainer = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  ...props
}: DateInputGroupInputContainerProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof DateInputGroupInputContainerProps<E>>) => {
  const {slots} = use(DateInputGroupContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.inputContainer, className)}
      data-slot="date-input-group-input-container"
      {...(props as any)}
    >
      {children}
    </dom.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup Suffix
 * -----------------------------------------------------------------------------------------------*/
interface DateInputGroupSuffixProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const DateInputGroupSuffix = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  ...props
}: DateInputGroupSuffixProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof DateInputGroupSuffixProps<E>>) => {
  const {slots} = use(DateInputGroupContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.suffix, className)}
      data-slot="date-input-group-suffix"
      {...(props as any)}
    >
      {children}
    </dom.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {
  DateInputGroupRoot,
  DateInputGroupInput,
  DateInputGroupInputContainer,
  DateInputGroupSegment,
  DateInputGroupPrefix,
  DateInputGroupSuffix,
};

export type {
  DateInputGroupRootProps,
  DateInputGroupInputProps,
  DateInputGroupInputContainerProps,
  DateInputGroupSegmentProps,
  DateInputGroupPrefixProps,
  DateInputGroupSuffixProps,
};
