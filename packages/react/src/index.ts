export { DibaProvider } from './provider/DibaProvider'
export { useDibaStrings, dibaStrings } from './i18n/strings'
export type { DibaStrings } from './i18n/strings'
export type { DibaProviderProps, DibaTheme, DibaDir } from './provider/DibaProvider'

// Foundation
export { Stack } from './components/stack/Stack'
export type { StackProps } from './components/stack/Stack'
export { Snippet, snippetOptions } from './components/snippet/Snippet'
export type { SnippetProps, SnippetVariant, SnippetSize } from './components/snippet/Snippet'
export { Text } from './components/text/Text'
export type { TextProps } from './components/text/Text'

// Third-party code, a group at a time (see THIRD-PARTY-NOTICES.txt). Their stylesheet is
// `@kaladan/diba-react/tailwind.css`, and their recipes are also on `@kaladan/diba-react/variants`.
// Diba's earlier components they replaced are gone, and so is the earlier stylesheet they drew
// with.

// Group 1, actions.
export * from './components/button'
export * from './components/button-group'
export * from './components/toggle-button'
export * from './components/toggle-button-group'
export * from './components/link'

// Group 2, text fields. CloseButton and Surface are shared pieces, public there and
// here.
export * from './components/textfield'
export * from './components/input'
export * from './components/input-group'
export * from './components/label'
export * from './components/description'
export * from './components/field-error'
export * from './components/textarea'
export * from './components/search-field'
export * from './components/number-field'
export * from './components/date-field'
export * from './components/close-button'
export * from './components/surface'

// Group 3, pickers. They replace Diba's earlier Select, Autocomplete, Listbox and Menu. Header
// (a section's title) and Separator are shared pieces, which sections and menus use.
export * from './components/select'
export * from './components/combo-box'
export * from './components/list-box'
export * from './components/list-box-item'
export * from './components/list-box-section'
export * from './components/dropdown'
export * from './components/menu-item'
export * from './components/menu-section'
export * from './components/header'
export * from './components/separator'

// Group 4, choices. They replace Diba's earlier Checkbox, CheckboxGroup, Radio, RadioGroup,
// Switch and Slider. They draw in the choices' roles, and the slider is Flutter's.
export * from './components/checkbox'
export * from './components/checkbox-group'
export * from './components/radio'
export * from './components/radio-group'
export * from './components/switch'
export * from './components/slider'

// Group 5, status. They replace Diba's earlier Alert, Chip, ChipGroup and ChipItem (TagGroup and
// Tag now), Spinner, Avatar and AvatarGroup, and its ToastProvider and useToast (the copied
// ToastProvider and its `toast` queue now), and its Progress and ProgressRing.
export * from './components/alert'
export * from './components/toast'
export * from './components/chip'
export * from './components/tag-group'
export * from './components/tag'
export * from './components/spinner'
export * from './components/progress-bar'
export * from './components/avatar'
export * from './components/avatar-group'

// Group 6, containers. They replace Diba's earlier Card, Table, Popover, Form, FormActions and
// Dialog.
export * from './components/card'
export * from './components/table'
export * from './components/modal'
export * from './components/alert-dialog'
export * from './components/popover'
export * from './components/form'

// Dates. They replace Diba's earlier calendars, date pickers and time field.
export * from './components/calendar'
export * from './components/calendar-year-picker'
export * from './components/range-calendar'
export * from './components/date-picker'
export * from './components/date-range-picker'
export * from './components/time-field'
// Kaladan: Diba's own time picker, Material 3's as Flutter draws it.
export * from './components/time-picker'

// The extras' structure: tabs, an accordion of disclosures, a fieldset and a drawer. Diba's
// earlier Tabs, Accordion, Drawer and Divider gave way to them, the Divider to Separator.
export * from './components/tabs'
export * from './components/accordion'
export * from './components/disclosure'
export * from './components/disclosure-group'
export * from './components/fieldset'
export * from './components/drawer'

// The extras' status and hints. Diba's earlier Tooltip and Badge gave way to them.
export * from './components/tooltip'
export * from './components/badge'
export * from './components/progress-circle'
export * from './components/meter'
// Copied for hosts drawing a tree while it loads; a tree never needs one, so it has no block.
export * from './components/skeleton'

// The extras' inputs: a one-time code, pagination and swatches. Diba's earlier InputOTP and
// Pagination gave way to them; their digit and page helpers stay, in utils.
export * from './components/input-otp'
export * from './components/pagination'
export * from './components/color-swatch'
export * from './components/color-swatch-picker'
export { toLatinDigits } from './utils/digits'
export { pageItems } from './utils/page-items'
export type { PageItem } from './utils/page-items'

// The last six worth having, copied so the apps need no other kit:
// breadcrumbs, a menu standing on its own, a group of switches, a collection's error message and
// a toolbar from v3.2.6, and v3.2.7's sheet, an overlay that swipes and stops at snap points. The
// apps draw them; a tree has no block for them.
export * from './components/breadcrumbs'
export * from './components/menu'
export * from './components/switch-group'
export * from './components/error-message'
export * from './components/toolbar'
export * from './components/sheet'

// Surfaces
export { Image, imageOptions } from './components/image/Image'
export type { ImageProps, ImageFit, ImageRadius } from './components/image/Image'
export { Spacer, spacerOptions } from './components/spacer/Spacer'
export type { SpacerProps, SpacerSize, SpacerAxis } from './components/spacer/Spacer'
export { installPersianAriaStrings, ariaStringsFa } from './i18n/aria-fa'

export { cn } from './utils/cn'
