/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {
  DateInputGroupInput,
  DateInputGroupInputContainer,
  DateInputGroupPrefix,
  DateInputGroupRoot,
  DateInputGroupSegment,
  DateInputGroupSuffix,
} from "../date-input-group";

import {TimeFieldRoot} from "./time-field";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const TimeField = Object.assign(TimeFieldRoot, {
  Root: TimeFieldRoot,
  Group: DateInputGroupRoot,
  Input: DateInputGroupInput,
  InputContainer: DateInputGroupInputContainer,
  Segment: DateInputGroupSegment,
  Prefix: DateInputGroupPrefix,
  Suffix: DateInputGroupSuffix,
});

export type TimeField = {
  Props: ComponentProps<typeof TimeFieldRoot>;
  RootProps: ComponentProps<typeof TimeFieldRoot>;
  GroupProps: ComponentProps<typeof DateInputGroupRoot>;
  InputProps: ComponentProps<typeof DateInputGroupInput>;
  InputContainerProps: ComponentProps<typeof DateInputGroupInputContainer>;
  SegmentProps: ComponentProps<typeof DateInputGroupSegment>;
  PrefixProps: ComponentProps<typeof DateInputGroupPrefix>;
  SuffixProps: ComponentProps<typeof DateInputGroupSuffix>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {TimeFieldRoot};

export type {TimeFieldRootProps, TimeFieldRootProps as TimeFieldProps} from "./time-field";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {timeFieldVariants} from "../../styles/recipes";

export type {TimeFieldVariants} from "../../styles/recipes";
