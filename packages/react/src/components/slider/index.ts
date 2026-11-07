/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {
  SliderFill,
  SliderMarks,
  SliderOutput,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from "./slider";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Slider = Object.assign(SliderRoot, {
  Root: SliderRoot,
  Output: SliderOutput,
  Track: SliderTrack,
  Fill: SliderFill,
  Thumb: SliderThumb,
  Marks: SliderMarks,
});

export type Slider = {
  Props: ComponentProps<typeof SliderRoot>;
  RootProps: ComponentProps<typeof SliderRoot>;
  OutputProps: ComponentProps<typeof SliderOutput>;
  TrackProps: ComponentProps<typeof SliderTrack>;
  FillProps: ComponentProps<typeof SliderFill>;
  ThumbProps: ComponentProps<typeof SliderThumb>;
  MarksProps: ComponentProps<typeof SliderMarks>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {SliderRoot, SliderOutput, SliderTrack, SliderFill, SliderThumb, SliderMarks};

export type {
  SliderRootProps,
  SliderRootProps as SliderProps,
  SliderOutputProps,
  SliderTrackProps,
  SliderFillProps,
  SliderThumbProps,
  SliderMarksProps,
} from "./slider";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {sliderVariants} from "../../styles/recipes";

export type {SliderVariants} from "../../styles/recipes";
