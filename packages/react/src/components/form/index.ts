/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {ComponentProps} from "react";

import {FormRoot} from "./form";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Form = Object.assign(FormRoot, {
  Root: FormRoot,
});

export type Form = {
  Props: ComponentProps<typeof FormRoot>;
  RootProps: ComponentProps<typeof FormRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {FormRoot};

export type {FormRootProps, FormRootProps as FormProps} from "./form";
