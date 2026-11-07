/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import type {AvatarVariants, avatarGroupVariants} from "../../styles/recipes";

import {createContext} from "react";

/* -------------------------------------------------------------------------------------------------
 * AvatarGroup Context
 * -----------------------------------------------------------------------------------------------*/
type AvatarGroupContextValue = {
  slots?: ReturnType<typeof avatarGroupVariants>;
  size?: AvatarVariants["size"];
  color?: AvatarVariants["color"];
  variant?: AvatarVariants["variant"];
};

const AvatarGroupContext = createContext<AvatarGroupContextValue>({});

/** Marks direct children of AvatarGroup so nested Avatars do not inherit group props. */
const AVATAR_GROUP_CHILD = "__avatar_group_child";

export {AvatarGroupContext, AVATAR_GROUP_CHILD};
export type {AvatarGroupContextValue};
