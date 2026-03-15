export function flatten(c: any): string {
  if (c == null) return "";
  if (Array.isArray(c)) return c.map(flatten).join("");
  return String(c);
}

export function shieldsEncode(s: string): string {
  return encodeURIComponent(s).replaceAll("-", "--").replaceAll("_", "__");
}
