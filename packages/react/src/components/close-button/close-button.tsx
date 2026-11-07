/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: takes its default aria-label from Diba's strings, t.close, instead of a
 * hard-coded English "Close", so a Persian page does not announce English; a caller's aria-label
 * still wins.
 */
"use client";

import type {CloseButtonVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";

import {closeButtonVariants} from "../../styles/recipes";
import {useMemo} from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";

import {useDibaStrings} from "../../i18n/strings";
import {composeTwRenderProps} from "../../utils";
import {CloseIcon} from "../icons";

/* -------------------------------------------------------------------------------------------------
 * Close Button Root
 * -----------------------------------------------------------------------------------------------*/
interface CloseButtonRootProps
  extends ComponentPropsWithRef<typeof ButtonPrimitive>, CloseButtonVariants {}

const CloseButtonRoot = ({
  children,
  className,
  slot,
  style,
  variant,
  ...rest
}: CloseButtonRootProps) => {
  const styles = useMemo(() => closeButtonVariants({variant}), [variant]);
  const t = useDibaStrings();

  return (
    <ButtonPrimitive
      aria-label={t.close}
      className={composeTwRenderProps(className, styles)}
      data-slot="close-button"
      slot={slot}
      style={style}
      type="button"
      {...rest}
    >
      {(renderProps) =>
        typeof children === "function"
          ? children(renderProps)
          : (children ?? <CloseIcon data-slot="close-button-icon" />)
      }
    </ButtonPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {CloseButtonRoot};

export type {CloseButtonRootProps};
