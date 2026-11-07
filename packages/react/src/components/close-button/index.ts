/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {CloseButtonRoot} from "./close-button";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const CloseButton = Object.assign(CloseButtonRoot, {
  Root: CloseButtonRoot,
});

export type CloseButton = {
  Props: ComponentProps<typeof CloseButtonRoot>;
  RootProps: ComponentProps<typeof CloseButtonRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {CloseButtonRoot};

export type {CloseButtonRootProps, CloseButtonRootProps as CloseButtonProps} from "./close-button";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {closeButtonVariants} from "../../styles/recipes";

export type {CloseButtonVariants} from "../../styles/recipes";
