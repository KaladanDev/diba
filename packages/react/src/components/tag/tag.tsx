/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: takes the remove button's default aria-label from Diba's strings,
 * t.removeTag, instead of a hard-coded English "Remove tag", so a Persian page does not announce
 * English; a caller's aria-label still wins; a chosen tag in a group of several choices starts with
 * a tick, as Flutter's filter chip does; the tick and the remove button's cross are
 * Material's.
 */
"use client";

import type {TagVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";
import type {Button as ButtonPrimitive} from "react-aria-components/Button";

import {tagVariants} from "../../styles/recipes";
import React, {Children, createContext, use, useMemo} from "react";
import {Tag as TagPrimitive} from "react-aria-components/TagGroup";

import {useDibaStrings} from "../../i18n/strings";
import {pickChildren} from "../../utils/children";
import {composeTwRenderProps} from "../../utils/compose";
import {CloseButton} from "../close-button";
import {TagGroupContext} from "../tag-group";

/* -------------------------------------------------------------------------------------------------
 * Tag Context
 * -----------------------------------------------------------------------------------------------*/
type TagContext = {
  slots?: ReturnType<typeof tagVariants>;
};

const TagContext = createContext<TagContext>({});

/* -------------------------------------------------------------------------------------------------
 * Tag Root
 * -----------------------------------------------------------------------------------------------*/
interface TagRootProps extends ComponentPropsWithRef<typeof TagPrimitive>, TagVariants {}

const TagRoot = ({children, className, ...restProps}: TagRootProps) => {
  const {size, variant} = use(TagGroupContext);

  const slots = useMemo(() => tagVariants({size, variant}), [size, variant]);

  const textValue = useMemo(() => {
    if (typeof children === "string") {
      return children;
    }

    if (typeof children === "object") {
      return Children.toArray(children)
        .filter((node) => typeof node === "string")
        .at(0);
    }

    return undefined;
  }, [children]);

  // Extract custom RemoveButton from children if present
  const [childrenWithoutRemoveButton, removeButtonChildren] = useMemo(() => {
    if (typeof children === "function") {
      return [children, undefined];
    }

    return pickChildren(children, TagRemoveButton);
  }, [children]);

  const contextValue = useMemo(() => ({slots}), [slots]);

  return (
    <TagPrimitive
      className={composeTwRenderProps(className, slots.base())}
      data-slot="tag"
      textValue={textValue}
      {...restProps}
    >
      {(renderProps) => (
        <TagContext value={contextValue}>
          {typeof children === "function" ? (
            children(renderProps)
          ) : (
            <>
              {renderProps.isSelected && renderProps.selectionMode === "multiple" ? (
                <TagCheck />
              ) : null}
              {childrenWithoutRemoveButton}
              {!!renderProps.allowsRemoving &&
                (removeButtonChildren && removeButtonChildren.length > 0 ? (
                  removeButtonChildren
                ) : (
                  <TagRemoveButton />
                ))}
            </>
          )}
        </TagContext>
      )}
    </TagPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tag Remove Button
 * -----------------------------------------------------------------------------------------------*/
/** Flutter's chip checkmark, Material's `check` glyph. */
/**
 * Kaladan: Material's tick, in a square as wide as the label's line: from 0.2375, 0.4625
 * through 0.425, 0.65 to 0.7625, 0.3125 of it, a stroke a twelfth of it wide. `pathLength` lets the
 * stylesheet draw it in.
 */
const TagCheck = () => (
  <svg
    aria-hidden="true"
    data-slot="tag-check"
    fill="none"
    role="presentation"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path d="M5.7 11.1L10.2 15.6L18.3 7.5" pathLength={1} />
  </svg>
);

/** Kaladan: Material's clear icon, the cross Flutter's chip removes with. */
const TagRemoveIcon = () => (
  <svg aria-hidden="true" data-slot="tag-remove-icon" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

type TagRemoveButtonProps = ComponentPropsWithRef<typeof ButtonPrimitive> & {
  children?: React.ReactNode;
};

const TagRemoveButton = ({children, className, ...restProps}: TagRemoveButtonProps) => {
  const {slots} = use(TagContext);
  const t = useDibaStrings();

  return (
    <CloseButton
      aria-label={t.removeTag}
      className={composeTwRenderProps(className, slots?.removeButton())}
      data-slot="tag-remove-button"
      slot="remove"
      {...restProps}
    >
      {children ?? <TagRemoveIcon />}
    </CloseButton>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {TagRoot, TagRemoveButton};

export type {TagRootProps, TagRemoveButtonProps};
