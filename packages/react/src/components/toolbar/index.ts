/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {ToolbarRoot} from "./toolbar";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Toolbar = Object.assign(ToolbarRoot, {
  Root: ToolbarRoot,
});

export type Toolbar = {
  Props: ComponentProps<typeof ToolbarRoot>;
  RootProps: ComponentProps<typeof ToolbarRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {ToolbarRoot} from "./toolbar";

export type {ToolbarRootProps, ToolbarRootProps as ToolbarProps} from "./toolbar";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {toolbarVariants} from "../../styles/recipes";

export type {ToolbarVariants} from "../../styles/recipes";
