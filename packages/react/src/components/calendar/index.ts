/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: adds MonthPickerGrid, the months of the year just picked, and TodayButton.
 */
import type {CalendarRootProps} from "./calendar";
import type {ComponentProps, ReactElement} from "react";
import type {CalendarSelectionMode, DateValue} from "react-aria-components/Calendar";

import {
  CalendarYearPickerCell,
  CalendarYearPickerGrid,
  CalendarYearPickerGridBody,
  CalendarYearPickerTrigger,
  CalendarYearPickerTriggerHeading,
  CalendarYearPickerTriggerIndicator,
} from "../calendar-year-picker";
import {CalendarMonthPickerGrid} from "../calendar-year-picker/calendar-month-picker";

import {CalendarTodayButton} from "./calendar-today-button";

import {
  CalendarCell,
  CalendarCellIndicator,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeader,
  CalendarHeaderCell,
  CalendarHeading,
  CalendarNavButton,
  CalendarRoot,
} from "./calendar";

type CalendarComponent = <
  T extends DateValue = DateValue,
  M extends CalendarSelectionMode = "single",
>(
  props: CalendarRootProps<T, M>,
) => ReactElement | null;

/* -------------------------------------------------------------------------------------------------
| * Compound Component
| * -----------------------------------------------------------------------------------------------*/
const CalendarCompound = Object.assign(CalendarRoot, {
  Root: CalendarRoot,
  Header: CalendarHeader,
  Heading: CalendarHeading,
  NavButton: CalendarNavButton,
  Grid: CalendarGrid,
  GridHeader: CalendarGridHeader,
  GridBody: CalendarGridBody,
  HeaderCell: CalendarHeaderCell,
  Cell: CalendarCell,
  CellIndicator: CalendarCellIndicator,
  YearPickerTrigger: CalendarYearPickerTrigger,
  YearPickerTriggerHeading: CalendarYearPickerTriggerHeading,
  YearPickerTriggerIndicator: CalendarYearPickerTriggerIndicator,
  YearPickerGrid: CalendarYearPickerGrid,
  YearPickerGridBody: CalendarYearPickerGridBody,
  YearPickerCell: CalendarYearPickerCell,
  MonthPickerGrid: CalendarMonthPickerGrid,
  TodayButton: CalendarTodayButton,
});

export const Calendar = CalendarCompound as CalendarComponent & typeof CalendarCompound;

export type Calendar = {
  Props: ComponentProps<typeof CalendarRoot>;
  RootProps: ComponentProps<typeof CalendarRoot>;
  HeaderProps: ComponentProps<typeof CalendarHeader>;
  HeadingProps: ComponentProps<typeof CalendarHeading>;
  NavButtonProps: ComponentProps<typeof CalendarNavButton>;
  GridProps: ComponentProps<typeof CalendarGrid>;
  GridHeaderProps: ComponentProps<typeof CalendarGridHeader>;
  GridBodyProps: ComponentProps<typeof CalendarGridBody>;
  HeaderCellProps: ComponentProps<typeof CalendarHeaderCell>;
  CellProps: ComponentProps<typeof CalendarCell>;
  CellIndicatorProps: ComponentProps<typeof CalendarCellIndicator>;
  YearPickerTriggerProps: ComponentProps<typeof CalendarYearPickerTrigger>;
  YearPickerTriggerHeadingProps: ComponentProps<typeof CalendarYearPickerTriggerHeading>;
  YearPickerTriggerIndicatorProps: ComponentProps<typeof CalendarYearPickerTriggerIndicator>;
  YearPickerGridProps: ComponentProps<typeof CalendarYearPickerGrid>;
  YearPickerGridBodyProps: ComponentProps<typeof CalendarYearPickerGridBody>;
  YearPickerCellProps: ComponentProps<typeof CalendarYearPickerCell>;
};

/* -------------------------------------------------------------------------------------------------
| * Named Component
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
  CalendarRootProps as CalendarProps,
  CalendarHeaderProps,
  CalendarHeadingProps,
  CalendarNavButtonProps,
  CalendarGridProps,
  CalendarGridHeaderProps,
  CalendarGridBodyProps,
  CalendarHeaderCellProps,
  CalendarCellProps,
  CalendarCellIndicatorProps,
} from "./calendar";

/* -------------------------------------------------------------------------------------------------
| * YearPickerContext (re-exported from calendar-year-picker for convenience)
| * -----------------------------------------------------------------------------------------------*/
export {YearPickerContext, useYearPicker, useCalendarOrRangeState} from "../calendar-year-picker";
export type {YearPickerContextValue} from "../calendar-year-picker";

/* -------------------------------------------------------------------------------------------------
| * Variants
| * -----------------------------------------------------------------------------------------------*/
export {calendarVariants} from "../../styles/recipes";

export type {CalendarVariants} from "../../styles/recipes";

export type {CalendarSelectionMode} from "react-aria-components/Calendar";
