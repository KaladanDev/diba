/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const errorMessageVariants = tv({
  base: "error-message",
});

export type ErrorMessageVariants = VariantProps<typeof errorMessageVariants>;
