/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {ListBoxSectionRoot} from "./list-box-section";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const ListBoxSection = ListBoxSectionRoot;

export type ListBoxSection = {
  Props: ComponentProps<typeof ListBoxSectionRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {ListBoxSectionRoot};

export type {
  ListBoxSectionRootProps,
  ListBoxSectionRootProps as ListBoxSectionProps,
} from "./list-box-section";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {listboxSectionVariants} from "../../styles/recipes";

export type {ListBoxSectionVariants} from "../../styles/recipes";
