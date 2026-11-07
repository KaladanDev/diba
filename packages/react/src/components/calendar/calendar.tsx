/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: takes useControlledState from Diba's own src/utils/controlled-state rather
 * than @react-stately/utils; a calendar in Persian heads its days with one letter each; a
 * month picker opens after the year picker, and closes with it, and a date picker's bounds reach
 * its calendar.
 */
"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {CalendarVariants} from "../../styles/recipes";
import type {CalendarIdentifier} from "@internationalized/date";
import type {ComponentPropsWithRef, ReactNode} from "react";
import type {
  CalendarSelectionMode,
  DateValue,
  CalendarProps as RACCalendarProps,
} from "react-aria-components/Calendar";

import {calendarVariants} from "../../styles/recipes";
import {CalendarDate, DateFormatter, createCalendar, toCalendar} from "@internationalized/date";
import {useControlledState} from "../../utils/controlled-state";
import React, {createContext, use} from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";
import {
  CalendarContext as RACCalendarContext,
  CalendarCell as CalendarCellPrimitive,
  CalendarGridBody as CalendarGridBodyPrimitive,
  CalendarGridHeader as CalendarGridHeaderPrimitive,
  CalendarGrid as CalendarGridPrimitive,
  CalendarHeaderCell as CalendarHeaderCellPrimitive,
  CalendarHeading as CalendarHeadingPrimitive,
  Calendar as CalendarPrimitive,
} from "react-aria-components/Calendar";
import {useLocale} from "react-aria-components/I18nProvider";
import {useSlottedContext} from "react-aria-components/slots";
import {cx} from "tailwind-variants";

import {getGregorianYearOffset} from "../../utils/calendar";
import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {YearPickerContext} from "../calendar-year-picker/year-picker-context";
import {IconChevronLeft, IconChevronRight} from "../icons";

import {CalendarDayViewGridBody} from "./calendar-day-view-grid-body";
import {CalendarDayViewGridHeader} from "./calendar-day-view-grid-header";

/* -------------------------------------------------------------------------------------------------
| * Calendar Context
| * -----------------------------------------------------------------------------------------------*/
interface CalendarDayViewContext {
  days: number;
  firstDayOfWeek?: CalendarRootProps["firstDayOfWeek"];
  timeZone: string;
  visibleRange: {end: DateValue; start: DateValue};
  weekdayStyle?: "narrow" | "short" | "long";
}

interface CalendarContext {
  dayView?: CalendarDayViewContext;
  slots?: ReturnType<typeof calendarVariants>;
}

const CalendarContext = createContext<CalendarContext>({});

interface CalendarContextProviderProps {
  children: ReactNode;
  dayViewBase?: Pick<CalendarDayViewContext, "days" | "firstDayOfWeek">;
  slots: ReturnType<typeof calendarVariants>;
  timeZone: string;
  visibleRange: {end: DateValue; start: DateValue};
}

/**
 * Provides CalendarContext from inside the Calendar render prop, where hooks
 * cannot be called directly.
 */
const CalendarContextProvider = ({
  children,
  dayViewBase,
  slots,
  timeZone,
  visibleRange,
}: CalendarContextProviderProps) => {
  // React Aria rebuilds visibleRange on every render, but the start/end dates it
  // holds are stable, so keying off those keeps the value stable in day view too.
  // Outside day view this collapses to undefined, which is stable either way.
  const {end, start} = visibleRange;
  const dayView = React.useMemo(
    () => (dayViewBase ? {...dayViewBase, timeZone, visibleRange: {end, start}} : undefined),
    [dayViewBase, timeZone, end, start],
  );
  const value = React.useMemo<CalendarContext>(() => ({dayView, slots}), [dayView, slots]);

  return <CalendarContext value={value}>{children}</CalendarContext>;
};

/* -------------------------------------------------------------------------------------------------
| * Calendar Root
| * -----------------------------------------------------------------------------------------------*/
interface CalendarRootProps<
  T extends DateValue = DateValue,
  M extends CalendarSelectionMode = "single",
>
  extends RACCalendarProps<T, M>, CalendarVariants {
  isYearPickerOpen?: boolean;
  onYearPickerOpenChange?: (isYearPickerOpen: boolean) => void;
  defaultYearPickerOpen?: boolean;
}

function CalendarRoot<T extends DateValue = DateValue, M extends CalendarSelectionMode = "single">({
  children,
  className,
  defaultYearPickerOpen: defaultYearPickerOpenProp = false,
  firstDayOfWeek,
  isYearPickerOpen: isYearPickerOpenProp,
  maxValue: maxValueProp,
  minValue: minValueProp,
  onYearPickerOpenChange: onYearPickerOpenChangeProp,
  visibleDuration,
  ...rest
}: CalendarRootProps<T, M>) {
  const isWeekView = visibleDuration?.weeks != null;
  const isDayView = visibleDuration?.days != null;
  const visibleDays = visibleDuration?.days;
  const {locale} = useLocale();
  const slots = React.useMemo(() => calendarVariants(), []);
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const [isYearPickerOpen, setYearPickerOpen] = useControlledState(
    isYearPickerOpenProp,
    defaultYearPickerOpenProp,
    onYearPickerOpenChangeProp,
  );
  // Kaladan: the months of the year just picked, until the picker closes.
  const [isMonthPickerOpen, setIsMonthPickerOpen] = React.useState(false);
  const setIsYearPickerOpen = React.useCallback(
    (open: boolean) => {
      if (!open) setIsMonthPickerOpen(false);
      setYearPickerOpen(open);
    },
    [setYearPickerOpen],
  );
  const calendarProp = React.useMemo(() => {
    const calendarIdentifier = new DateFormatter(locale).resolvedOptions()
      .calendar as CalendarIdentifier;

    return createCalendar(calendarIdentifier);
  }, [locale]);
  const gregorianYearOffset = React.useMemo(
    () => getGregorianYearOffset(calendarProp.identifier),
    [calendarProp.identifier],
  );
  // Kaladan: a date picker gives its bounds through React Aria's context, which the
  // defaults below, passed as props, would override; they stand in only when neither has one.
  const racContext = useSlottedContext(RACCalendarContext);
  const minValueGiven = minValueProp ?? (racContext?.minValue as T | null | undefined);
  const maxValueGiven = maxValueProp ?? (racContext?.maxValue as T | null | undefined);
  // React Aria memoizes calendar state against minValue/maxValue identity, so
  // these bounds must be stable across renders. Kaladan: a bound in another calendar, a
  // Gregorian one on a Persian page, is counted in this one's; a range calendar mixing the two
  // picked Gregorian days by the Persian numbers pressed.
  const minValue = React.useMemo(
    () =>
      (minValueGiven && (toCalendar(minValueGiven, calendarProp) as unknown as T)) ??
      (new CalendarDate(calendarProp, 1900 + gregorianYearOffset, 1, 1) as unknown as T),
    [minValueGiven, calendarProp, gregorianYearOffset],
  );
  const maxValue = React.useMemo(
    () =>
      (maxValueGiven && (toCalendar(maxValueGiven, calendarProp) as unknown as T)) ??
      (new CalendarDate(calendarProp, 2099 + gregorianYearOffset, 12, 31) as unknown as T),
    [maxValueGiven, calendarProp, gregorianYearOffset],
  );
  const dayViewBase = React.useMemo(
    () => (isDayView && visibleDays != null ? {days: visibleDays, firstDayOfWeek} : undefined),
    [isDayView, visibleDays, firstDayOfWeek],
  );
  const yearPickerContext = React.useMemo(
    () => ({
      calendarGridSlot: "calendar-grid" as const,
      isYearPickerOpen,
      setIsYearPickerOpen,
      isMonthPickerOpen,
      setIsMonthPickerOpen,
      calendarRef,
    }),
    [isYearPickerOpen, setIsYearPickerOpen, isMonthPickerOpen],
  );

  return (
    <YearPickerContext value={yearPickerContext}>
      <CalendarPrimitive
        ref={calendarRef}
        data-slot="calendar"
        firstDayOfWeek={firstDayOfWeek}
        maxValue={maxValue}
        minValue={minValue}
        visibleDuration={visibleDuration}
        {...rest}
        className={composeTwRenderProps(
          className,
          cx(slots.base(), isWeekView && "calendar--week-view", isDayView && "calendar--day-view"),
        )}
      >
        {(values) => (
          <CalendarContextProvider
            dayViewBase={dayViewBase}
            slots={slots}
            timeZone={values.state.timeZone}
            visibleRange={values.state.visibleRange}
          >
            {typeof children === "function" ? children(values) : children}
          </CalendarContextProvider>
        )}
      </CalendarPrimitive>
    </YearPickerContext>
  );
}

CalendarRoot.displayName = "Diba.Calendar";

/* -------------------------------------------------------------------------------------------------
| * Calendar Header
| * -----------------------------------------------------------------------------------------------*/
interface CalendarHeaderProps<
  E extends keyof React.JSX.IntrinsicElements = "header",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const CalendarHeader = <E extends keyof React.JSX.IntrinsicElements = "header">({
  children,
  className,
  ...props
}: CalendarHeaderProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof CalendarHeaderProps<E>>) => {
  const {slots} = use(CalendarContext);

  return (
    <dom.header
      className={composeSlotClassName(slots?.header, className)}
      data-slot="calendar-header"
      {...(props as any)}
    >
      {children}
    </dom.header>
  );
};

CalendarHeader.displayName = "Diba.Calendar.Header";

/* -------------------------------------------------------------------------------------------------
| * Calendar Heading
| * -----------------------------------------------------------------------------------------------*/
interface CalendarHeadingProps extends ComponentPropsWithRef<typeof CalendarHeadingPrimitive> {}

const CalendarHeading = ({className, ...props}: CalendarHeadingProps) => {
  const {slots} = use(CalendarContext);

  return (
    <CalendarHeadingPrimitive
      data-slot="calendar-heading"
      {...props}
      className={composeSlotClassName(slots?.heading, className)}
    />
  );
};

CalendarHeading.displayName = "Diba.Calendar.Heading";

/* -------------------------------------------------------------------------------------------------
| * Calendar Nav Button
| * -----------------------------------------------------------------------------------------------*/
interface CalendarNavButtonProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {
  slot?: "previous" | "next";
}

const CalendarNavButton = ({children, className, slot, ...props}: CalendarNavButtonProps) => {
  const {slots} = use(CalendarContext);

  return (
    <ButtonPrimitive
      data-slot="calendar-nav-button"
      slot={slot}
      {...props}
      className={composeTwRenderProps(className, slots?.navButton())}
    >
      {children ||
        (slot === "previous" ? (
          <IconChevronLeft
            className={slots?.navButtonIcon()}
            data-slot="calendar-nav-button-icon"
          />
        ) : (
          <IconChevronRight
            className={slots?.navButtonIcon()}
            data-slot="calendar-nav-button-icon"
          />
        ))}
    </ButtonPrimitive>
  );
};

CalendarNavButton.displayName = "Diba.Calendar.NavButton";

/* -------------------------------------------------------------------------------------------------
| * Calendar Grid
| * -----------------------------------------------------------------------------------------------*/
interface CalendarGridProps extends ComponentPropsWithRef<typeof CalendarGridPrimitive> {}

const CalendarGrid = ({
  children,
  className,
  weekdayStyle: weekdayStyleProp,
  ...props
}: CalendarGridProps) => {
  const {locale} = useLocale();
  // Persian's short weekday names are its full names («چهارشنبه»), seven of which do not fit a
  // calendar's width; its narrow ones are one letter each («چ»), as Flutter's calendar shows them.
  const weekdayStyle = weekdayStyleProp ?? (locale.split("-")[0] === "fa" ? "narrow" : "short");
  const calendarContext = use(CalendarContext);
  const {dayView, slots} = calendarContext;
  const contextValue = React.useMemo(
    () => ({
      ...calendarContext,
      dayView: dayView ? {...dayView, weekdayStyle} : undefined,
    }),
    [calendarContext, dayView, weekdayStyle],
  );

  return (
    <CalendarContext value={contextValue}>
      <CalendarGridPrimitive
        data-slot="calendar-grid"
        weekdayStyle={weekdayStyle}
        {...props}
        className={composeSlotClassName(slots?.grid, className)}
      >
        {children}
      </CalendarGridPrimitive>
    </CalendarContext>
  );
};

CalendarGrid.displayName = "Diba.Calendar.Grid";

/* -------------------------------------------------------------------------------------------------
| * Calendar Grid Header
| * -----------------------------------------------------------------------------------------------*/
interface CalendarGridHeaderProps extends ComponentPropsWithRef<
  typeof CalendarGridHeaderPrimitive
> {}

const CalendarGridHeader = ({children, className, ...props}: CalendarGridHeaderProps) => {
  const {dayView, slots} = use(CalendarContext);

  if (dayView && dayView.days >= 7 && typeof children === "function") {
    return (
      <CalendarDayViewGridHeader
        className={composeSlotClassName(slots?.gridHeader, className)}
        data-slot="calendar-grid-header"
        firstDayOfWeek={dayView.firstDayOfWeek}
        timeZone={dayView.timeZone}
        visibleRange={dayView.visibleRange}
        weekdayStyle={dayView.weekdayStyle}
      >
        {children}
      </CalendarDayViewGridHeader>
    );
  }

  return (
    <CalendarGridHeaderPrimitive
      data-slot="calendar-grid-header"
      {...props}
      className={composeSlotClassName(slots?.gridHeader, className)}
    >
      {children}
    </CalendarGridHeaderPrimitive>
  );
};

CalendarGridHeader.displayName = "Diba.Calendar.GridHeader";

/* -------------------------------------------------------------------------------------------------
| * Calendar Grid Body
| * -----------------------------------------------------------------------------------------------*/
interface CalendarGridBodyProps extends ComponentPropsWithRef<typeof CalendarGridBodyPrimitive> {}

const CalendarGridBody = ({children, className, ...props}: CalendarGridBodyProps) => {
  const {dayView, slots} = use(CalendarContext);

  if (dayView && dayView.days >= 7 && typeof children === "function") {
    return (
      <CalendarDayViewGridBody
        className={composeSlotClassName(slots?.gridBody, className)}
        data-slot="calendar-grid-body"
        firstDayOfWeek={dayView.firstDayOfWeek}
        visibleRange={dayView.visibleRange}
      >
        {children}
      </CalendarDayViewGridBody>
    );
  }

  return (
    <CalendarGridBodyPrimitive
      data-slot="calendar-grid-body"
      {...props}
      className={composeSlotClassName(slots?.gridBody, className)}
    >
      {children}
    </CalendarGridBodyPrimitive>
  );
};

CalendarGridBody.displayName = "Diba.Calendar.GridBody";

/* -------------------------------------------------------------------------------------------------
| * Calendar Header Cell
| * -----------------------------------------------------------------------------------------------*/
interface CalendarHeaderCellProps extends ComponentPropsWithRef<
  typeof CalendarHeaderCellPrimitive
> {}

const CalendarHeaderCell = ({className, ...props}: CalendarHeaderCellProps) => {
  const {slots} = use(CalendarContext);

  return (
    <CalendarHeaderCellPrimitive
      data-slot="calendar-header-cell"
      {...props}
      className={composeSlotClassName(slots?.headerCell, className)}
    />
  );
};

CalendarHeaderCell.displayName = "Diba.Calendar.HeaderCell";

/* -------------------------------------------------------------------------------------------------
| * Calendar Cell
| * -----------------------------------------------------------------------------------------------*/
interface CalendarCellProps extends ComponentPropsWithRef<typeof CalendarCellPrimitive> {}

const CalendarCell = ({children, className, ...props}: CalendarCellProps) => {
  const {slots} = use(CalendarContext);

  return (
    <CalendarCellPrimitive
      data-slot="calendar-cell"
      {...props}
      className={composeTwRenderProps(className, slots?.cell())}
    >
      {(values) => {
        const {formattedDate} = values;

        return typeof children === "function" ? children(values) : children || formattedDate;
      }}
    </CalendarCellPrimitive>
  );
};

CalendarCell.displayName = "Diba.Calendar.Cell";

/* -------------------------------------------------------------------------------------------------
| * Calendar Cell Indicator
| * -----------------------------------------------------------------------------------------------*/
interface CalendarCellIndicatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const CalendarCellIndicator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  className,
  ...props
}: CalendarCellIndicatorProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof CalendarCellIndicatorProps<E>>) => {
  const {slots} = use(CalendarContext);

  return (
    <dom.span
      aria-hidden="true"
      className={composeSlotClassName(slots?.cellIndicator, className)}
      data-slot="calendar-cell-indicator"
      {...(props as any)}
    />
  );
};

CalendarCellIndicator.displayName = "Diba.Calendar.CellIndicator";

/* -------------------------------------------------------------------------------------------------
| * Exports
| * -----------------------------------------------------------------------------------------------*/
export {
  CalendarRoot,
  CalendarHeader,
  CalendarHeading,
  CalendarNavButton,
  CalendarGrid,
  CalendarGridHeader,
  CalendarGridBody,
  CalendarHeaderCell,
  CalendarCell,
  CalendarCellIndicator,
};
export type {
  CalendarRootProps,
  CalendarHeaderProps,
  CalendarHeadingProps,
  CalendarNavButtonProps,
  CalendarGridProps,
  CalendarGridHeaderProps,
  CalendarGridBodyProps,
  CalendarHeaderCellProps,
  CalendarCellProps,
  CalendarCellIndicatorProps,
};
