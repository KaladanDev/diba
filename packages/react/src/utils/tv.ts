/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {TV} from "tailwind-variants";

import {tv as tvBase} from "tailwind-variants";

export type {VariantProps} from "tailwind-variants";

export const tv: TV = (options, config) =>
  tvBase(options, {
    ...config,
    twMerge: config?.twMerge ?? false,
    twMergeConfig: {
      ...config?.twMergeConfig,
      classGroups: {
        ...config?.twMergeConfig?.classGroups,
      },
      theme: {
        ...config?.twMergeConfig?.theme,
      },
    },
  });
