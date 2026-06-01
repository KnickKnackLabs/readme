import type { ComponentMeta } from "./types";
import { slugify } from "./helpers";

export interface TocHeading {
  text: string;
  id?: string;
  level?: number;
}

export interface TocEntry {
  text: string;
  id: string;
  level?: number;
}

export type TOCProps =
  | { headings: TocHeading[]; entries?: never }
  | { entries: TocEntry[]; headings?: never };

export function TOC(props: TOCProps) {
  const items = "headings" in props ? props.headings : props.entries;
  if (!items || items.length === 0) return "";
  const minLevel = Math.min(...items.map((e) => e.level ?? 1));
  const lines = items.map((e) => {
    const indent = "  ".repeat((e.level ?? 1) - minLevel);
    const id = e.id ?? slugify(e.text);
    return `${indent}- [${e.text}](#${id})`;
  });
  return lines.join("\n") + "\n\n";
}
TOC.meta = {
  usage: '<TOC headings={[{ text: "Usage", level: 2 }]} />',
  output: "Nested heading links; pass id for exact anchors",
} satisfies ComponentMeta;
