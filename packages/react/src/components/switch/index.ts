/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {SwitchContent, SwitchControl, SwitchIcon, SwitchRoot, SwitchThumb} from "./switch";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Switch = Object.assign(SwitchRoot, {
  Root: SwitchRoot,
  Content: SwitchContent,
  Control: SwitchControl,
  Thumb: SwitchThumb,
  Icon: SwitchIcon,
});

export type Switch = {
  Props: ComponentProps<typeof SwitchRoot>;
  RootProps: ComponentProps<typeof SwitchRoot>;
  ContentProps: ComponentProps<typeof SwitchContent>;
  ControlProps: ComponentProps<typeof SwitchControl>;
  ThumbProps: ComponentProps<typeof SwitchThumb>;
  IconProps: ComponentProps<typeof SwitchIcon>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {SwitchContent, SwitchControl, SwitchIcon, SwitchRoot, SwitchThumb};

export type {
  SwitchRootProps,
  SwitchRootProps as SwitchProps,
  SwitchContentProps,
  SwitchControlProps,
  SwitchThumbProps,
  SwitchIconProps,
  SwitchFieldRenderProps,
  SwitchButtonRenderProps,
  /** @deprecated Use {@link SwitchFieldRenderProps} for the root render prop, or {@link SwitchButtonRenderProps} for control. */
  SwitchFieldRenderProps as SwitchRenderProps,
} from "./switch";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {switchVariants} from "../../styles/recipes";

export type {SwitchVariants} from "../../styles/recipes";
