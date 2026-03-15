import type { ComponentMeta } from "./types";
import { flatten } from "./helpers";

export function Raw({ children: c }: { children?: string | string[] }) {
  return flatten(c);
}
Raw.meta = { usage: "<Raw>html</Raw>", output: "HTML passthrough" } satisfies ComponentMeta;

export function HtmlLink({ href, children: c }: { href: string; children: string }) {
  return `<a href="${href}">${c}</a>`;
}
HtmlLink.meta = { usage: '<HtmlLink href="url">text</HtmlLink>', output: "<a> tag" } satisfies ComponentMeta;

export function Sub({ children: c }: { children?: string | string[] }) {
  return `<sub>\n${flatten(c)}\n</sub>`;
}
Sub.meta = { usage: "<Sub>text</Sub>", output: "<sub> tag" } satisfies ComponentMeta;

export function HtmlTable({ children: c }: { children?: string | string[] }) {
  return `<table>\n${flatten(c)}</table>\n\n`;
}
HtmlTable.meta = { usage: "<HtmlTable>...</HtmlTable>", output: "<table> for layout" } satisfies ComponentMeta;

export function HtmlTr({ children: c }: { children?: string | string[] }) {
  return `  <tr>\n${flatten(c)}  </tr>\n`;
}
HtmlTr.meta = { usage: "<HtmlTr>...</HtmlTr>", output: "<tr> row" } satisfies ComponentMeta;

export function HtmlTd({ width, valign, children: c }: { width?: string; valign?: string; children?: string | string[] }) {
  const attrs = [
    width ? `width="${width}"` : "",
    valign ? `valign="${valign}"` : "",
  ].filter(Boolean).join(" ");
  return `    <td${attrs ? ` ${attrs}` : ""}>\n\n${flatten(c)}\n</td>\n`;
}
HtmlTd.meta = { usage: "<HtmlTd width=... valign=...>", output: "<td> cell with optional sizing" } satisfies ComponentMeta;
