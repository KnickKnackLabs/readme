// @internal — shared helpers used by component modules.
// Not re-exported from the barrel; import from here only within src/components/.

export function flatten(c: any): string {
  if (c == null) return "";
  if (Array.isArray(c)) return c.map(flatten).join("");
  return String(c);
}

export function shieldsEncode(s: string): string {
  return encodeURIComponent(s).replaceAll("-", "--").replaceAll("_", "__");
}
