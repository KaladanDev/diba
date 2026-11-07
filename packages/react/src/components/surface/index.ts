/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {SurfaceRoot} from "./surface";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Surface = Object.assign(SurfaceRoot, {
  Root: SurfaceRoot,
});

export type Surface = {
  Props: ComponentProps<typeof SurfaceRoot>;
  RootProps: ComponentProps<typeof SurfaceRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {SurfaceRoot} from "./surface";

export type {SurfaceRootProps, SurfaceRootProps as SurfaceProps} from "./surface";

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/
export {SurfaceContext} from "./surface";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {surfaceVariants} from "../../styles/recipes";

export type {SurfaceVariants} from "../../styles/recipes";
