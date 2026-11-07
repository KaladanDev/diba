/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {
  ToastActionButton,
  ToastCloseButton,
  ToastContent,
  ToastDescription,
  ToastIndicator,
  ToastProvider,
  Toast as ToastRoot,
  ToastTitle,
} from "./toast";
import {ToastQueue, toast, toastQueue} from "./toast-queue";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Toast = Object.assign(ToastRoot, {
  Provider: ToastProvider,
  Content: ToastContent,
  Indicator: ToastIndicator,
  Title: ToastTitle,
  Description: ToastDescription,
  ActionButton: ToastActionButton,
  CloseButton: ToastCloseButton,
  Queue: ToastQueue,
  toast,
});

export type Toast = {
  Props: ComponentProps<typeof ToastRoot>;
  ProviderProps: ComponentProps<typeof ToastProvider>;
  ContentProps: ComponentProps<typeof ToastContent>;
  IndicatorProps: ComponentProps<typeof ToastIndicator>;
  TitleProps: ComponentProps<typeof ToastTitle>;
  DescriptionProps: ComponentProps<typeof ToastDescription>;
  ActionProps: ComponentProps<typeof ToastActionButton>;
  CloseButtonProps: ComponentProps<typeof ToastCloseButton>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {
  ToastProvider,
  ToastContent,
  ToastIndicator,
  ToastTitle,
  ToastDescription,
  ToastActionButton,
  ToastCloseButton,
};

export type {
  ToastCloseButtonProps,
  ToastProviderProps,
  ToastContentProps,
  ToastDescriptionProps,
  ToastIndicatorProps,
  ToastProps,
  ToastTitleProps,
} from "./toast";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {toastVariants} from "../../styles/recipes";

export type {ToastVariants} from "../../styles/recipes";

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * -----------------------------------------------------------------------------------------------*/
export {ToastQueue, toast, toastQueue};

/* -------------------------------------------------------------------------------------------------
 * Constants
 * -----------------------------------------------------------------------------------------------*/
export {
  DEFAULT_EXIT_DURATION,
  DEFAULT_GAP,
  DEFAULT_HOTKEY,
  DEFAULT_MAX_VISIBLE_TOAST,
  DEFAULT_TOAST_TIMEOUT,
} from "./constants";

export type {
  ToastOptions,
  ToastContentValue,
  ToastPromiseOptions,
  ToastQueueOptions,
} from "./toast-queue";
