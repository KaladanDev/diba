/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {TagGroupContext, TagGroupList, TagGroupRoot} from "./tag-group";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const TagGroup = Object.assign(TagGroupRoot, {
  Root: TagGroupRoot,
  List: TagGroupList,
});

export type TagGroup = {
  Props: ComponentProps<typeof TagGroupRoot>;
  RootProps: ComponentProps<typeof TagGroupRoot>;
  ListProps: ComponentProps<typeof TagGroupList>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {TagGroupRoot, TagGroupList, TagGroupContext};

export type {
  TagGroupRootProps,
  TagGroupRootProps as TagGroupProps,
  TagGroupListProps,
} from "./tag-group";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {tagGroupVariants} from "../../styles/recipes";

export type {TagGroupVariants} from "../../styles/recipes";
