/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {FieldGroup, FieldsetActions, FieldsetLegend, FieldsetRoot} from "./fieldset";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Fieldset = Object.assign(FieldsetRoot, {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
  Group: FieldGroup,
  Actions: FieldsetActions,
});

export type Fieldset = {
  Props: ComponentProps<typeof FieldsetRoot>;
  RootProps: ComponentProps<typeof FieldsetRoot>;
  LegendProps: ComponentProps<typeof FieldsetLegend>;
  GroupProps: ComponentProps<typeof FieldGroup>;
  ActionsProps: ComponentProps<typeof FieldsetActions>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {FieldsetRoot, FieldsetLegend, FieldGroup, FieldsetActions};

export type {
  FieldsetRootProps,
  FieldsetRootProps as FieldsetProps,
  FieldsetLegendProps,
  FieldGroupProps,
  FieldsetActionsProps,
} from "./fieldset";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {fieldsetVariants} from "../../styles/recipes";

export type {FieldsetVariants} from "../../styles/recipes";
