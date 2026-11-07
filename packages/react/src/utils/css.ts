/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
export const parseCSSTime = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  const val = parseFloat(trimmed);

  if (Number.isNaN(val)) return undefined;
  if (trimmed.endsWith("ms")) return val;
  if (trimmed.endsWith("s")) return val * 1000;

  return val;
};
