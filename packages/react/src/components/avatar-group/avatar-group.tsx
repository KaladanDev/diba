/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: the count of avatars past `max` is written in the locale's digits, +۲ in
 * Persian.
 */
"use client";

import type {AvatarGroupContextValue} from "./avatar-group-context";
import type {DOMRenderProps} from "../../utils/dom";
import type {AvatarGroupVariants, AvatarVariants} from "../../styles/recipes";
import type {ReactElement, ReactNode} from "react";

import {avatarGroupVariants} from "../../styles/recipes";
import React, {Children, isValidElement, use, useMemo} from "react";
import {useNumberFormatter} from "react-aria";

import {composeSlotClassName} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {Avatar} from "../avatar";

import {AVATAR_GROUP_CHILD, AvatarGroupContext} from "./avatar-group-context";

/* -------------------------------------------------------------------------------------------------
 * AvatarGroup Count
 * -----------------------------------------------------------------------------------------------*/
interface AvatarGroupCountProps extends Omit<
  React.ComponentPropsWithRef<typeof Avatar>,
  "color" | "children"
> {
  children?: ReactNode;
  color?: AvatarVariants["color"];
}

const AvatarGroupCount = ({
  children,
  className,
  color,
  size,
  variant,
  ...props
}: AvatarGroupCountProps) => {
  const group = use(AvatarGroupContext);
  const finalSize = size ?? group.size;
  const finalColor = color ?? group.color;
  const finalVariant = variant ?? group.variant;

  return (
    <Avatar
      className={composeSlotClassName(group.slots?.count, className)}
      color={finalColor}
      data-slot="avatar-group-count"
      size={finalSize}
      variant={finalVariant}
      {...props}
    >
      <Avatar.Fallback>{children}</Avatar.Fallback>
    </Avatar>
  );
};

AvatarGroupCount.displayName = "Diba.AvatarGroup.Count";

const isCountElement = (el: ReactElement) => el.type === AvatarGroupCount;

/* -------------------------------------------------------------------------------------------------
 * AvatarGroup Root
 * -----------------------------------------------------------------------------------------------*/
interface AvatarGroupRootProps<E extends keyof React.JSX.IntrinsicElements = "div">
  extends DOMRenderProps<E, undefined>, AvatarGroupVariants {
  children?: ReactNode;
  className?: string;
  /**
   * Size applied to child Avatars (and the overflow count) when they omit size.
   * Defaults to `md` to stay in sync with Avatar.
   * @default "md"
   */
  size?: AvatarVariants["size"];
  /** Color applied to child Avatars (and the overflow count) when they omit color. */
  color?: AvatarVariants["color"];
  /** Variant applied to child Avatars (and the overflow count) when they omit variant. */
  variant?: AvatarVariants["variant"];
  /**
   * Maximum number of avatar children to render.
   * Omit to show all children (no truncation).
   */
  max?: number;
  /**
   * How stacked avatars overlap visually.
   * - `"clip"` — crescent mask (transparent seam; no box-shadow)
   * - `"ring"` — solid box-shadow outline via `--background`
   * Has no effect when `isGrid` is true.
   * @default "clip"
   */
  overlap?: AvatarGroupVariants["overlap"];
}

const AvatarGroupRoot = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  color,
  isGrid = false,
  max,
  overlap = "clip",
  size = "md",
  variant,
  ...props
}: AvatarGroupRootProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof AvatarGroupRootProps<E>>) => {
  const slots = useMemo(() => avatarGroupVariants({isGrid, overlap}), [isGrid, overlap]);
  const formatter = useNumberFormatter();

  const context = useMemo<AvatarGroupContextValue>(
    () => ({slots, size, color, variant}),
    [slots, size, color, variant],
  );

  const avatarChildren: ReactElement[] = [];
  const countChildren: ReactElement[] = [];

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;
    if (isCountElement(child)) countChildren.push(child);
    else avatarChildren.push(child);
  }

  const visibleChildren = max == null ? avatarChildren : avatarChildren.slice(0, Math.max(0, max));

  const remaining = max == null ? 0 : Math.max(0, avatarChildren.length - visibleChildren.length);

  const wrappedChildren = visibleChildren.map((child) =>
    React.cloneElement(child, {
      [AVATAR_GROUP_CHILD]: true,
    } as any),
  );

  const hasExplicitCount = countChildren.length > 0;

  const countContent = hasExplicitCount ? (
    countChildren
  ) : remaining > 0 ? (
    <AvatarGroupCount>+{formatter.format(remaining)}</AvatarGroupCount>
  ) : null;

  return (
    <AvatarGroupContext value={context}>
      <dom.div className={slots.base({className})} data-slot="avatar-group" {...(props as any)}>
        {wrappedChildren}
        {countContent}
      </dom.div>
    </AvatarGroupContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {AvatarGroupRoot, AvatarGroupCount, AvatarGroupContext, AVATAR_GROUP_CHILD};

export type {AvatarGroupRootProps, AvatarGroupCountProps};
export type {AvatarGroupContextValue} from "./avatar-group-context";
