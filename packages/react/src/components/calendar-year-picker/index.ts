/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {
  CalendarYearPickerCell,
  CalendarYearPickerGrid,
  CalendarYearPickerGridBody,
  CalendarYearPickerTrigger,
  CalendarYearPickerTriggerHeading,
  CalendarYearPickerTriggerIndicator,
} from "./calendar-year-picker";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const CalendarYearPicker = {
  Trigger: CalendarYearPickerTrigger,
  TriggerHeading: CalendarYearPickerTriggerHeading,
  TriggerIndicator: CalendarYearPickerTriggerIndicator,
  Grid: CalendarYearPickerGrid,
  GridBody: CalendarYearPickerGridBody,
  Cell: CalendarYearPickerCell,
};

export type CalendarYearPicker = {
  TriggerProps: ComponentProps<typeof CalendarYearPickerTrigger>;
  TriggerHeadingProps: ComponentProps<typeof CalendarYearPickerTriggerHeading>;
  TriggerIndicatorProps: ComponentProps<typeof CalendarYearPickerTriggerIndicator>;
  GridProps: ComponentProps<typeof CalendarYearPickerGrid>;
  GridBodyProps: ComponentProps<typeof CalendarYearPickerGridBody>;
  CellProps: ComponentProps<typeof CalendarYearPickerCell>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {
  CalendarYearPickerTrigger,
  CalendarYearPickerTriggerHeading,
  CalendarYearPickerTriggerIndicator,
  CalendarYearPickerGrid,
  CalendarYearPickerGridBody,
  CalendarYearPickerCell,
};

export type {
  CalendarYearPickerTriggerProps,
  CalendarYearPickerTriggerHeadingProps,
  CalendarYearPickerTriggerIndicatorProps,
  CalendarYearPickerTriggerRenderProps,
  CalendarYearPickerGridProps,
  CalendarYearPickerGridBodyProps,
  CalendarYearPickerCellProps,
  CalendarYearPickerCellRenderProps,
} from "./calendar-year-picker";

/* -------------------------------------------------------------------------------------------------
 * YearPickerContext
 * -----------------------------------------------------------------------------------------------*/
export {YearPickerContext, useYearPicker} from "./year-picker-context";
export type {YearPickerContextValue} from "./year-picker-context";
export {useCalendarOrRangeState} from "./use-calendar-state";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {calendarYearPickerVariants} from "../../styles/recipes";

export type {CalendarYearPickerVariants} from "../../styles/recipes";
