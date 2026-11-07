/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {TextAreaRoot} from "./textarea";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const TextArea = Object.assign(TextAreaRoot, {
  Root: TextAreaRoot,
});

export type TextArea = {
  Props: ComponentProps<typeof TextAreaRoot>;
  RootProps: ComponentProps<typeof TextAreaRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {TextAreaRoot};

export type {TextAreaRootProps, TextAreaRootProps as TextAreaProps} from "./textarea";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {textAreaVariants} from "../../styles/recipes";

export type {TextAreaVariants} from "../../styles/recipes";
