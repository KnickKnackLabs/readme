import type { ComponentMeta } from "./types";
import { flatten } from "./helpers";

export function Center({ children: c }: { children?: string | string[] }) {
  return `<div align="center">\n\n${flatten(c)}</div>\n\n`;
}
Center.meta = { usage: "<Center>...</Center>", output: '<div align="center">' } satisfies ComponentMeta;

export function Details({ summary, children: c }: { summary: string; children?: string | string[] }) {
  return `<details>\n<summary><b>${summary}</b></summary>\n\n${flatten(c)}</details>\n\n`;
}
Details.meta = { usage: "<Details summary=...>...</Details>", output: "Collapsible section" } satisfies ComponentMeta;

export function Section({ title, level = 2, children: c }: { title: string; level?: number; children?: string | string[] }) {
  return `${"#".repeat(level)} ${title}\n\n${flatten(c)}`;
}
Section.meta = { usage: "<Section title=... level=...>", output: "Heading + content block" } satisfies ComponentMeta;

export function Align({ align = "center", children: c }: { align?: string; children?: string | string[] }) {
  return `<p align="${align}">\n  ${flatten(c)}\n</p>\n\n`;
}
Align.meta = { usage: '<Align align="center">...</Align>', output: '<p align="...">' } satisfies ComponentMeta;
