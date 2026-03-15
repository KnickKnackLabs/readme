import type { ComponentMeta } from "./types";
import { flatten } from "./helpers";

export function Table({ children: c }: { children?: string | string[] }) {
  return flatten(c) + "\n";
}
Table.meta = { usage: "<Table>...</Table>", output: "GFM table wrapper" } satisfies ComponentMeta;

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
