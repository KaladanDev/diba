/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: takes useControlledState from Diba's own src/utils/controlled-state rather
 * than @react-stately/utils; a month picker opens after the year picker, and closes with it, a date
 * range picker's bounds reach its calendar, and a calendar in Persian heads its days with one
 * letter each, as Calendar's.
 */
"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {RangeCalendarVariants} from "../../styles/recipes";
import type {CalendarIdentifier} from "@internationalized/date";
import type {ComponentPropsWithRef, ReactNode} from "react";
import type {DateValue} from "react-aria-components/Calendar";

import {rangeCalendarVariants} from "../../styles/recipes";
import {CalendarDate, DateFormatter, createCalendar, toCalendar} from "@internationalized/date";
import {useControlledState} from "../../utils/controlled-state";
import React, {createContext, use} from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";
import {useLocale} from "react-aria-components/I18nProvider";
import {RangeCalendarContext as RACRangeCalendarContext} from "react-aria-components/RangeCalendar";
import {useSlottedContext} from "react-aria-components/slots";
import {
  CalendarCell as CalendarCellPrimitive,
  CalendarGridBody as CalendarGridBodyPrimitive,
  CalendarGridHeader as CalendarGridHeaderPrimitive,
  CalendarGrid as CalendarGridPrimitive,
  CalendarHeaderCell as CalendarHeaderCellPrimitive,
  CalendarHeading as CalendarHeadingPrimitive,
  RangeCalendar as RangeCalendarPrimitive,
} from "react-aria-components/RangeCalendar";
import {cx} from "tailwind-variants";

import {dataAttr} from "../../utils/assertion";
import {getGregorianYearOffset} from "../../utils/calendar";
import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {CalendarDayViewGridBody} from "../calendar/calendar-day-view-grid-body";
import {CalendarDayViewGridHeader} from "../calendar/calendar-day-view-grid-header";
import {YearPickerContext} from "../calendar-year-picker/year-picker-context";
import {IconChevronLeft, IconChevronRight} from "../icons";

/* -------------------------------------------------------------------------------------------------
| * RangeCalendar Context
| * -----------------------------------------------------------------------------------------------*/
interface RangeCalendarDayViewContext {
  days: number;
  firstDayOfWeek?: RangeCalendarRootProps["firstDayOfWeek"];
  timeZone: string;
  visibleRange: {end: DateValue; start: DateValue};
  weekdayStyle?: "narrow" | "short" | "long";
}

interface RangeCalendarContext {
  dayView?: RangeCalendarDayViewContext;
  slots?: ReturnType<typeof rangeCalendarVariants>;
}

const RangeCalendarContext = createContext<RangeCalendarContext>({});

interface RangeCalendarContextProviderProps {
  children: ReactNode;
  dayViewBase?: Pick<RangeCalendarDayViewContext, "days" | "firstDayOfWeek">;
  slots: ReturnType<typeof rangeCalendarVariants>;
  timeZone: string;
  visibleRange: {end: DateValue; start: DateValue};
}

/**
 * Provides RangeCalendarContext from inside the RangeCalendar render prop,
 * where hooks cannot be called directly.
 */
const RangeCalendarContextProvider = ({
  children,
  dayViewBase,
  slots,
  timeZone,
  visibleRange,
}: RangeCalendarContextProviderProps) => {
  // React Aria rebuilds visibleRange on every render, but the start/end dates it
  // holds are stable, so keying off those keeps the value stable in day view too.
  // Outside day view this collapses to undefined, which is stable either way.
  const {end, start} = visibleRange;
  const dayView = React.useMemo(
    () => (dayViewBase ? {...dayViewBase, timeZone, visibleRange: {end, start}} : undefined),
    [dayViewBase, timeZone, end, start],
  );
  const value = React.useMemo<RangeCalendarContext>(() => ({dayView, slots}), [dayView, slots]);

  return <RangeCalendarContext value={value}>{children}</RangeCalendarContext>;
};

/* -------------------------------------------------------------------------------------------------
| * RangeCalendar Root
| * -----------------------------------------------------------------------------------------------*/
interface RangeCalendarRootProps<T extends DateValue = DateValue>
  extends ComponentPropsWithRef<typeof RangeCalendarPrimitive<T>>, RangeCalendarVariants {
  isYearPickerOpen?: boolean;
  onYearPickerOpenChange?: (isYearPickerOpen: boolean) => void;
  defaultYearPickerOpen?: boolean;
}

function RangeCalendarRoot<T extends DateValue = DateValue>({
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
}: RangeCalendarRootProps<T>) {
  const isWeekView = visibleDuration?.weeks != null;
  const isDayView = visibleDuration?.days != null;
  const visibleDays = visibleDuration?.days;
  const {locale} = useLocale();
  const slots = React.useMemo(() => rangeCalendarVariants(), []);
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
  // Kaladan: a date range picker gives its bounds through React Aria's context, which the
  // defaults below, passed as props, would override; they stand in only when neither has one.
  const racContext = useSlottedContext(RACRangeCalendarContext);
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
      calendarGridSlot: "range-calendar-grid" as const,
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
      <RangeCalendarPrimitive
        ref={calendarRef}
        data-slot="range-calendar"
        firstDayOfWeek={firstDayOfWeek}
        maxValue={maxValue}
        minValue={minValue}
        visibleDuration={visibleDuration}
        {...rest}
        className={composeTwRenderProps(
          className,
          cx(
            slots.base(),
            isWeekView && "range-calendar--week-view",
            isDayView && "range-calendar--day-view",
          ),
        )}
      >
        {(values) => (
          <RangeCalendarContextProvider
            dayViewBase={dayViewBase}
            slots={slots}
            timeZone={values.state.timeZone}
            visibleRange={values.state.visibleRange}
          >
            {typeof children === "function" ? children(values) : children}
          </RangeCalendarContextProvider>
        )}
      </RangeCalendarPrimitive>
    </YearPickerContext>
  );
}

RangeCalendarRoot.displayName = "Diba.RangeCalendar";

/* -------------------------------------------------------------------------------------------------
| * RangeCalendar Header
| * -----------------------------------------------------------------------------------------------*/
interface RangeCalendarHeaderProps<
  E extends keyof React.JSX.IntrinsicElements = "header",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const RangeCalendarHeader = <E extends keyof React.JSX.IntrinsicElements = "header">({
  children,
  className,
  ...props
}: RangeCalendarHeaderProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof RangeCalendarHeaderProps<E>>) => {
  const {slots} = use(RangeCalendarContext);

  return (
    <dom.header
      className={composeSlotClassName(slots?.header, className)}
      data-slot="range-calendar-header"
      {...(props as any)}
    >
      {children}
    </dom.header>
  );
};

RangeCalendarHeader.displayName = "Diba.RangeCalendar.Header";

/* -------------------------------------------------------------------------------------------------
| * RangeCalendar Heading
| * -----------------------------------------------------------------------------------------------*/
interface RangeCalendarHeadingProps extends ComponentPropsWithRef<
  typeof CalendarHeadingPrimitive
> {}

const RangeCalendarHeading = ({className, ...props}: RangeCalendarHeadingProps) => {
  const {slots} = use(RangeCalendarContext);

  return (
    <CalendarHeadingPrimitive
      data-slot="range-calendar-heading"
      {...props}
      className={composeSlotClassName(slots?.heading, className)}
    />
  );
};

RangeCalendarHeading.displayName = "Diba.RangeCalendar.Heading";

/* -------------------------------------------------------------------------------------------------
| * RangeCalendar Nav Button
| * -----------------------------------------------------------------------------------------------*/
interface RangeCalendarNavButtonProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {
  slot?: "previous" | "next";
}

const RangeCalendarNavButton = ({
  children,
  className,
  slot,
  ...props
}: RangeCalendarNavButtonProps) => {
  const {slots} = use(RangeCalendarContext);

  return (
    <ButtonPrimitive
      data-slot="range-calendar-nav-button"
      slot={slot}
      {...props}
      className={composeTwRenderProps(className, slots?.navButton())}
    >
      {children ||
        (slot === "previous" ? (
          <IconChevronLeft
            className={slots?.navButtonIcon()}
            data-slot="range-calendar-nav-button-icon"
          />
        ) : (
          <IconChevronRight
            className={slots?.navButtonIcon()}
            data-slot="range-calendar-nav-button-icon"
          />
        ))}
    </ButtonPrimitive>
  );
};

RangeCalendarNavButton.displayName = "Diba.RangeCalendar.NavButton";

/* -------------------------------------------------------------------------------------------------
| * RangeCalendar Grid
| * -----------------------------------------------------------------------------------------------*/
interface RangeCalendarGridProps extends ComponentPropsWithRef<typeof CalendarGridPrimitive> {}

const RangeCalendarGrid = ({
  children,
  className,
  weekdayStyle: weekdayStyleProp,
  ...props
}: RangeCalendarGridProps) => {
  const {locale} = useLocale();
  // Persian's short weekday names are its full names («چهارشنبه»), seven of which do not fit a
  // calendar's width; its narrow ones are one letter each («چ»), as Flutter's calendar shows them.
  const weekdayStyle = weekdayStyleProp ?? (locale.split("-")[0] === "fa" ? "narrow" : "short");
  const rangeCalendarContext = use(RangeCalendarContext);
  const {dayView, slots} = rangeCalendarContext;
  const contextValue = React.useMemo(
    () => ({
      ...rangeCalendarContext,
      dayView: dayView ? {...dayView, weekdayStyle} : undefined,
    }),
    [dayView, rangeCalendarContext, weekdayStyle],
  );

  return (
    <RangeCalendarContext value={contextValue}>
      <CalendarGridPrimitive
        data-slot="range-calendar-grid"
        weekdayStyle={weekdayStyle}
        {...props}
        className={composeSlotClassName(slots?.grid, className)}
      >
        {children}
      </CalendarGridPrimitive>
    </RangeCalendarContext>
  );
};

RangeCalendarGrid.displayName = "Diba.RangeCalendar.Grid";

/* -------------------------------------------------------------------------------------------------
| * RangeCalendar Grid Header
| * -----------------------------------------------------------------------------------------------*/
interface RangeCalendarGridHeaderProps extends ComponentPropsWithRef<
  typeof CalendarGridHeaderPrimitive
> {}

const RangeCalendarGridHeader = ({children, className, ...props}: RangeCalendarGridHeaderProps) => {
  const {dayView, slots} = use(RangeCalendarContext);

  if (dayView && dayView.days >= 7 && typeof children === "function") {
    return (
      <CalendarDayViewGridHeader
        className={composeSlotClassName(slots?.gridHeader, className)}
        data-slot="range-calendar-grid-header"
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
      data-slot="range-calendar-grid-header"
      {...props}
      className={composeSlotClassName(slots?.gridHeader, className)}
    >
      {children}
    </CalendarGridHeaderPrimitive>
  );
};

RangeCalendarGridHeader.displayName = "Diba.RangeCalendar.GridHeader";

/* -------------------------------------------------------------------------------------------------
| * RangeCalendar Grid Body
| * -----------------------------------------------------------------------------------------------*/
interface RangeCalendarGridBodyProps extends ComponentPropsWithRef<
  typeof CalendarGridBodyPrimitive
> {}

const RangeCalendarGridBody = ({children, className, ...props}: RangeCalendarGridBodyProps) => {
  const {dayView, slots} = use(RangeCalendarContext);

  if (dayView && dayView.days >= 7 && typeof children === "function") {
    return (
      <CalendarDayViewGridBody
        className={composeSlotClassName(slots?.gridBody, className)}
        data-slot="range-calendar-grid-body"
        firstDayOfWeek={dayView.firstDayOfWeek}
        visibleRange={dayView.visibleRange}
      >
        {children}
      </CalendarDayViewGridBody>
    );
  }

  return (
    <CalendarGridBodyPrimitive
      data-slot="range-calendar-grid-body"
      {...props}
      className={composeSlotClassName(slots?.gridBody, className)}
    >
      {children}
    </CalendarGridBodyPrimitive>
  );
};

RangeCalendarGridBody.displayName = "Diba.RangeCalendar.GridBody";

/* -------------------------------------------------------------------------------------------------
| * RangeCalendar Header Cell
| * -----------------------------------------------------------------------------------------------*/
interface RangeCalendarHeaderCellProps extends ComponentPropsWithRef<
  typeof CalendarHeaderCellPrimitive
> {}

const RangeCalendarHeaderCell = ({className, ...props}: RangeCalendarHeaderCellProps) => {
  const {slots} = use(RangeCalendarContext);

  return (
    <CalendarHeaderCellPrimitive
      data-slot="range-calendar-header-cell"
      {...props}
      className={composeSlotClassName(slots?.headerCell, className)}
    />
  );
};

RangeCalendarHeaderCell.displayName = "Diba.RangeCalendar.HeaderCell";

/* -------------------------------------------------------------------------------------------------
| * RangeCalendar Cell
| * -----------------------------------------------------------------------------------------------*/
interface RangeCalendarCellProps extends ComponentPropsWithRef<typeof CalendarCellPrimitive> {}

const RangeCalendarCell = ({children, className, ...props}: RangeCalendarCellProps) => {
  const {slots} = use(RangeCalendarContext);

  return (
    <CalendarCellPrimitive
      data-slot="range-calendar-cell"
      {...props}
      className={composeTwRenderProps(className, slots?.cell())}
    >
      {(values) => {
        const {formattedDate, isDisabled, isHovered, isPressed, isSelectionEnd, isSelectionStart} =
          values;

        const content =
          typeof children === "function" ? children(values) : children || formattedDate;

        return (
          <span
            className="range-calendar__cell-button"
            data-disabled={dataAttr(isDisabled)}
            data-hovered={dataAttr(isHovered)}
            data-pressed={dataAttr(isPressed)}
            data-selected={dataAttr(isSelectionStart || isSelectionEnd)}
            data-slot="range-calendar-cell-button"
          >
            {content}
          </span>
        );
      }}
    </CalendarCellPrimitive>
  );
};

RangeCalendarCell.displayName = "Diba.RangeCalendar.Cell";

/* -------------------------------------------------------------------------------------------------
| * RangeCalendar Cell Indicator
| * -----------------------------------------------------------------------------------------------*/
interface RangeCalendarCellIndicatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  className?: string;
}

const RangeCalendarCellIndicator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  className,
  ...props
}: RangeCalendarCellIndicatorProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof RangeCalendarCellIndicatorProps<E>>) => {
  const {slots} = use(RangeCalendarContext);

  return (
    <dom.span
      aria-hidden="true"
      className={composeSlotClassName(slots?.cellIndicator, className)}
      data-slot="range-calendar-cell-indicator"
      {...(props as any)}
    />
  );
};

RangeCalendarCellIndicator.displayName = "Diba.RangeCalendar.CellIndicator";

/* -------------------------------------------------------------------------------------------------
| * Exports
| * -----------------------------------------------------------------------------------------------*/
export {
  RangeCalendarRoot,
  RangeCalendarHeader,
  RangeCalendarHeading,
  RangeCalendarNavButton,
  RangeCalendarGrid,
  RangeCalendarGridHeader,
  RangeCalendarGridBody,
  RangeCalendarHeaderCell,
  RangeCalendarCell,
  RangeCalendarCellIndicator,
};
export type {
  RangeCalendarRootProps,
  RangeCalendarHeaderProps,
  RangeCalendarHeadingProps,
  RangeCalendarNavButtonProps,
  RangeCalendarGridProps,
  RangeCalendarGridHeaderProps,
  RangeCalendarGridBodyProps,
  RangeCalendarHeaderCellProps,
  RangeCalendarCellProps,
  RangeCalendarCellIndicatorProps,
};
