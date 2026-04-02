import type { ComponentMeta } from "./types";
import { flatten } from "./helpers";

export function Table({ children: c }: { children?: string | string[] }) {
  const raw = flatten(c);
  const lines = raw.split("\n").filter((l) => l.trim() !== "");
  if (lines.length === 0) return "\n";

  // Only pad if all lines are valid table rows (start and end with |).
  // Multi-line cell content breaks row parsing, so fall back to raw output.
  const isTableRow = (l: string) => /^\|.*\|$/.test(l.trim());
  if (!lines.every(isTableRow)) return raw + "\n";

  // Parse each row into cells
  const rows = lines.map((line) =>
    line
      .trim()
      .replace(/^\|\s*/, "")
      .replace(/\s*\|$/, "")
      .split(/\s*\|\s*/)
  );

  // Compute max width per column
  const colCount = Math.max(...rows.map((r) => r.length));
  const widths: number[] = Array(colCount).fill(3); // minimum "---" width
  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      if (!row[i].match(/^-+$/)) {
        widths[i] = Math.max(widths[i], row[i].length);
      }
    }
  }

  // Re-render with padding
  const padded = rows.map((row) => {
    const cells = row.map((cell, i) => {
      if (cell.match(/^-+$/)) return "-".repeat(widths[i]);
      return cell.padEnd(widths[i]);
    });
    return `| ${cells.join(" | ")} |`;
  });

  return padded.join("\n") + "\n\n";
}
Table.meta = { usage: "<Table>...</Table>", output: "GFM table (Prettier-compatible padding)" } satisfies ComponentMeta;

export function TableHead({ children: c }: { children?: string | string[] }) {
  const cells = Array.isArray(c) ? c : c ? [c] : [];
  const header = `| ${cells.join(" | ")} |`;
  const separator = `| ${cells.map(() => "---").join(" | ")} |`;
  return header + "\n" + separator + "\n";
}
TableHead.meta = { usage: "<TableHead><Cell>...</Cell></TableHead>", output: "Header row + separator" } satisfies ComponentMeta;

export function TableRow({ children: c }: { children?: string | string[] }) {
  const cells = Array.isArray(c) ? c : c ? [c] : [];
  return `| ${cells.join(" | ")} |\n`;
}
TableRow.meta = { usage: "<TableRow><Cell>...</Cell></TableRow>", output: "Table data row" } satisfies ComponentMeta;

export function Cell({ children: c }: { children?: string | string[] }) {
  return flatten(c);
}
Cell.meta = { usage: "<Cell>text</Cell>", output: "Table cell content" } satisfies ComponentMeta;
