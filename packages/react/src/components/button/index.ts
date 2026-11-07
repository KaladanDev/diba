/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: types Button explicitly, because TypeScript 5.7 cannot write ButtonRoot's
 * destructured BUTTON_GROUP_CHILD key into a declaration file.
 */
import type {ComponentProps} from "react";

import {BUTTON_GROUP_CHILD} from "../button-group";

import {ButtonRoot} from "./button";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Button: typeof ButtonRoot & {Root: typeof ButtonRoot} = Object.assign(ButtonRoot, {
  Root: ButtonRoot,
});

export type Button = {
  Props: ComponentProps<typeof ButtonRoot>;
  RootProps: ComponentProps<typeof ButtonRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {ButtonRoot};

export type {ButtonRootProps, ButtonRootProps as ButtonProps} from "./button";

/* -------------------------------------------------------------------------------------------------
 * Re-export BUTTON_GROUP_CHILD for type declarations
 * -----------------------------------------------------------------------------------------------*/
export {BUTTON_GROUP_CHILD};

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {buttonVariants} from "../../styles/recipes";

export type {ButtonVariants} from "../../styles/recipes";
