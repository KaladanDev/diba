/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
"use client";

import {composeRenderProps} from "react-aria-components/composeRenderProps";
import {cx} from "tailwind-variants";

// Re-export utility classes from the styles for backward compatibility
export {disabledClasses, focusRingClasses, ariaDisabledClasses} from "../styles/recipes";

function composeTwRenderProps<T>(
  className: string | ((v: T) => string) | undefined,
  tailwind?: string | ((v: T) => string | undefined),
): string | ((v: T) => string) {
  return composeRenderProps(className, (className, renderProps): string => {
    const tw = typeof tailwind === "function" ? (tailwind(renderProps) ?? "") : (tailwind ?? "");
    const cls = className ?? "";

    return cx(tw, cls) ?? "";
  });
}

export const composeSlotClassName = (
  slotFn: ((args?: {className?: string; [key: string]: any}) => string) | undefined,
  className?: string,
  variants?: Record<string, any>,
): string | undefined => {
  return typeof slotFn === "function" ? slotFn({...(variants ?? {}), className}) : className;
};

export {composeTwRenderProps};
