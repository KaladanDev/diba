/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: a month picker opens after the year picker, sharing its state.
 */
"use client";

import {createContext, use} from "react";

/* -------------------------------------------------------------------------------------------------
 * YearPickerContext
 *
 * Context provided by Calendar (and RangeCalendar) to control year-picker visibility.
 * Internal child components consume this to toggle the year-picker open/close state,
 * keeping the public API clean and wrapper-free.
 * -----------------------------------------------------------------------------------------------*/
interface YearPickerContextValue {
  isYearPickerOpen: boolean;
  setIsYearPickerOpen: (open: boolean) => void;
  /** Kaladan: the year is picked and its months show, while `isYearPickerOpen` holds. */
  isMonthPickerOpen: boolean;
  setIsMonthPickerOpen: (open: boolean) => void;
  calendarRef: React.RefObject<HTMLDivElement | null>;
  calendarGridSlot: "calendar-grid" | "range-calendar-grid";
}

const YearPickerContext = createContext<YearPickerContextValue | null>(null);

/**
 * Hook to consume YearPickerContext.
 * Must be used inside Calendar or RangeCalendar.
 */
function useYearPicker(): YearPickerContextValue {
  const context = use(YearPickerContext);

  if (!context) {
    throw new Error("useYearPicker must be used within a <Calendar> or <RangeCalendar> component.");
  }

  return context;
}

export {YearPickerContext, useYearPicker};
export type {YearPickerContextValue};
