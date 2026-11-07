/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
export const isDrawerDragTargetOwnedBy = (target: HTMLElement, dialog: HTMLElement) =>
  target.closest('[data-slot="drawer-dialog"]') === dialog;
