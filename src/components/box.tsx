import type { ComponentMeta } from "./types";

export type BoxStyle = "ascii" | "unicode";

const BOX_CHARS = {
  ascii:   { tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" },
  unicode: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
} as const;

/**
 * Draw a box around lines of text, auto-sized to content.
 * Returns an array of lines (consistent with labeledBox, composable with sideBySide).
 */
export function box(lines: string[], { padding = 1, style = "ascii" as BoxStyle } = {}): string[] {
  if (!lines.length) return [];
  const c = BOX_CHARS[style];
  const maxLen = Math.max(...lines.map((l) => l.length));
  const w = maxLen + padding * 2;
  const pad = (s: string) => " ".repeat(padding) + s + " ".repeat(w - s.length - padding);
  const top = c.tl + c.h.repeat(w) + c.tr;
  const bot = c.bl + c.h.repeat(w) + c.br;
  return [top, ...lines.map((l) => c.v + pad(l) + c.v), bot];
}
box.meta = { usage: "box(lines, { style, padding })", output: "ASCII or Unicode box around text (string[])" } satisfies ComponentMeta;

/**
 * Draw a labeled box with a title, body lines, and an optional status line.
 * Returns an array of lines (for use with sideBySide).
 */
export function labeledBox(title: string, body: string[], status?: string, { style = "ascii" as BoxStyle } = {}): string[] {
  if (!body.length) body = [""];
  const c = BOX_CHARS[style];
  const parts = [title, ...body];
  if (status) parts.push(status);
  const maxLen = Math.max(...parts.map((l) => l.length));
  const w = maxLen + 2;
  const pad = (s: string) => " " + s + " ".repeat(w - s.length - 1);
  const lines = [
    c.tl + c.h.repeat(w) + c.tr,
    c.v + pad(title) + c.v,
    c.v + " ".repeat(w) + c.v,
    ...body.map((l) => c.v + pad(l) + c.v),
  ];
  if (status) {
    lines.push(c.v + " ".repeat(w) + c.v);
    lines.push(c.v + pad(status) + c.v);
  }
  lines.push(c.bl + c.h.repeat(w) + c.br);
  return lines;
}
labeledBox.meta = { usage: "labeledBox(title, body, status?)", output: "Box with title, body, and optional status" } satisfies ComponentMeta;

/**
 * Combine arrays of lines side-by-side with a gap between columns.
 * Useful for placing multiple labeledBox results next to each other.
 */
export function sideBySide(columns: string[][], gap = 2): string[] {
  if (!columns.length) return [];
  const maxHeight = Math.max(...columns.map((c) => c.length));
  const widths = columns.map((c) => Math.max(...c.map((l) => l.length)));
  const result: string[] = [];
  for (let i = 0; i < maxHeight; i++) {
    result.push(
      columns
        .map((col, ci) => (col[i] ?? " ".repeat(widths[ci])).padEnd(widths[ci]))
        .join(" ".repeat(gap))
    );
  }
  return result;
}
sideBySide.meta = { usage: "sideBySide(columns, gap)", output: "Place line arrays side by side" } satisfies ComponentMeta;
