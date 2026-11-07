/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import type {ColorSwatchVariants} from "../../styles/recipes";
import type {CSSProperties, ComponentPropsWithRef} from "react";

import {colorSwatchVariants} from "../../styles/recipes";
import {ColorSwatch as ColorSwatchPrimitive} from "react-aria-components/ColorSwatch";

import {composeTwRenderProps} from "../../utils/compose";

/* -------------------------------------------------------------------------------------------------
 * ColorSwatch Root
 * -----------------------------------------------------------------------------------------------*/
interface ColorSwatchRootProps
  extends ComponentPropsWithRef<typeof ColorSwatchPrimitive>, ColorSwatchVariants {}

const ColorSwatchRoot = ({className, shape, size, style, ...props}: ColorSwatchRootProps) => {
  return (
    <ColorSwatchPrimitive
      {...props}
      className={composeTwRenderProps(className, colorSwatchVariants({shape, size}))}
      data-slot="color-swatch"
      style={(renderProps) => {
        const userStyle = typeof style === "function" ? style(renderProps) : style;

        return {
          "--color-swatch-current": renderProps.color.toString("css"),
          ...userStyle,
        } as CSSProperties;
      }}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {ColorSwatchRoot};

export type {ColorSwatchRootProps};
