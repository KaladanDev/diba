/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {
  ProgressBarFill,
  ProgressBarOutput,
  ProgressBarRoot,
  ProgressBarTrack,
} from "./progress-bar";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const ProgressBar = Object.assign(ProgressBarRoot, {
  Root: ProgressBarRoot,
  Output: ProgressBarOutput,
  Track: ProgressBarTrack,
  Fill: ProgressBarFill,
});

export type ProgressBar = {
  Props: ComponentProps<typeof ProgressBarRoot>;
  RootProps: ComponentProps<typeof ProgressBarRoot>;
  OutputProps: ComponentProps<typeof ProgressBarOutput>;
  TrackProps: ComponentProps<typeof ProgressBarTrack>;
  FillProps: ComponentProps<typeof ProgressBarFill>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {ProgressBarRoot, ProgressBarOutput, ProgressBarTrack, ProgressBarFill};

export type {
  ProgressBarRootProps,
  ProgressBarRootProps as ProgressBarProps,
  ProgressBarOutputProps,
  ProgressBarTrackProps,
  ProgressBarFillProps,
} from "./progress-bar";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {progressBarVariants} from "../../styles/recipes";

export type {ProgressBarVariants} from "../../styles/recipes";
