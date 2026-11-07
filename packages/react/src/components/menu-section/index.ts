/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {MenuSectionRoot} from "./menu-section";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const MenuSection = MenuSectionRoot;

export type MenuSection = {
  Props: ComponentProps<typeof MenuSectionRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {MenuSectionRoot};

export type {MenuSectionRootProps, MenuSectionRootProps as MenuSectionProps} from "./menu-section";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {menuSectionVariants} from "../../styles/recipes";

export type {MenuSectionVariants} from "../../styles/recipes";
