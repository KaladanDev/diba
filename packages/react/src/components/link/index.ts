/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {LinkIcon, LinkRoot} from "./link";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Link = Object.assign(LinkRoot, {
  Root: LinkRoot,
  Icon: LinkIcon,
});

export type Link = {
  Props: ComponentProps<typeof LinkRoot>;
  RootProps: ComponentProps<typeof LinkRoot>;
  IconProps: ComponentProps<typeof LinkIcon>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {LinkRoot, LinkIcon};

export type {LinkRootProps, LinkIconProps, LinkRootProps as LinkProps} from "./link";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {linkVariants} from "../../styles/recipes";

export type {LinkVariants} from "../../styles/recipes";
