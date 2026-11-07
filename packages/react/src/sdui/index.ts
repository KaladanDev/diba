/**
 * The SDUI runtime — rendering trees the host did not write.
 *
 * A separate entry point from the component library, because an app that only
 * uses Diba's components should not carry the manifest and the schema with it.
 * Import from `@kaladan/diba-react/sdui`.
 */
export { DibaSurface, DibaFormValues } from './Surface'
export { DibaExtension } from './Extension'
export type { DibaSurfaceProps, DibaSurfaceHandlers, DibaToast } from './Surface'
export type {
  DibaEffect,
  DibaExtensionProps,
  DibaRequest,
  DibaResponse,
  DibaTransport,
} from './Extension'
export { checkTree, isSafeUrl, isSafeImageUrl, DEFAULT_LIMITS } from './guards'
export type { TreeLimits } from './guards'
export { registry, unrenderable, allowedProps, allowedActions, allowedSlots } from './registry'
