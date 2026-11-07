/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {ScrollShadowRoot} from "./scroll-shadow";

/* -------------------------------------------------------------------------------------------------
 * Component
 * -----------------------------------------------------------------------------------------------*/
export const ScrollShadow = Object.assign(ScrollShadowRoot, {
  Root: ScrollShadowRoot,
});

export type ScrollShadow = {
  Props: ComponentProps<typeof ScrollShadowRoot>;
  RootProps: ComponentProps<typeof ScrollShadowRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {ScrollShadowRoot};

export type {
  ScrollShadowRootProps,
  ScrollShadowRootProps as ScrollShadowProps,
  ScrollShadowVisibility,
} from "./scroll-shadow";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {scrollShadowVariants} from "../../styles/recipes";

export type {ScrollShadowVariants} from "../../styles/recipes";

/* -------------------------------------------------------------------------------------------------
 * Hooks
 * -----------------------------------------------------------------------------------------------*/
export {useScrollShadow} from "./use-scroll-shadow";

export type {UseScrollShadowProps} from "./use-scroll-shadow";
