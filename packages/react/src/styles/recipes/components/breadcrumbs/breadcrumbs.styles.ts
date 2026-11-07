/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const breadcrumbsVariants = tv({
  slots: {
    base: "breadcrumbs",
    item: "breadcrumbs__item",
    link: "breadcrumbs__link",
    separator: "breadcrumbs__separator",
  },
});

export type BreadcrumbsVariants = VariantProps<typeof breadcrumbsVariants>;
