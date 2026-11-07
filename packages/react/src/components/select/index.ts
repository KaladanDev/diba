/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {
  SelectClearButton,
  SelectIndicator,
  SelectPopover,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "./select";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Select = Object.assign(SelectRoot, {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Indicator: SelectIndicator,
  ClearButton: SelectClearButton,
  Popover: SelectPopover,
});

export type Select<T extends object = object> = {
  Props: ComponentProps<typeof SelectRoot<T>>;
  RootProps: ComponentProps<typeof SelectRoot<T>>;
  TriggerProps: ComponentProps<typeof SelectTrigger>;
  ValueProps: ComponentProps<typeof SelectValue>;
  IndicatorProps: ComponentProps<typeof SelectIndicator>;
  ClearButtonProps: ComponentProps<typeof SelectClearButton>;
  PopoverProps: ComponentProps<typeof SelectPopover>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {SelectClearButton, SelectIndicator, SelectPopover, SelectRoot, SelectTrigger, SelectValue};

export type {
  SelectRootProps,
  SelectRootProps as SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectIndicatorProps,
  SelectClearButtonProps,
  SelectPopoverProps,
} from "./select";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {selectVariants} from "../../styles/recipes";

export type {SelectVariants} from "../../styles/recipes";
