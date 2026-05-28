// @internal — shared helpers used by component modules.
// Not re-exported from the barrel; import from here only within src/components/.

export function flatten(c: any): string {
  if (c == null) return "";
  if (Array.isArray(c)) return c.map(flatten).join("");
  return String(c);
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function shieldsEncode(s: string): string {
  return encodeURIComponent(s).replaceAll("-", "--").replaceAll("_", "__");
}

const UNICODE_TO_LATEX: [RegExp, string][] = [
  [/&&/g, "\\mathbin{\\&\\&}"],
  [/⟨/g, "\\langle "],
  [/⟩/g, "\\rangle "],
  [/⇓/g, "\\Downarrow "],
  [/⇑/g, "\\Uparrow "],
  [/≠/g, "\\neq "],
  [/∈/g, "\\in "],
  [/σ/g, "\\sigma"],
];

export function unicodeToLatex(s: string): string {
  return UNICODE_TO_LATEX.reduce((acc, [re, latex]) => acc.replace(re, latex), s);
}
