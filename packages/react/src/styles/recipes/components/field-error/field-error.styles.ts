/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const fieldErrorVariants = tv({
  base: "field-error",
});

export type FieldErrorVariants = VariantProps<typeof fieldErrorVariants>;
