/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {HeaderRoot} from "./header";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Header = HeaderRoot;

export type Header = {
  Props: ComponentProps<typeof HeaderRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {HeaderRoot};

export type {HeaderRootProps, HeaderRootProps as HeaderProps} from "./header";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {headerVariants} from "../../styles/recipes";
