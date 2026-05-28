import type { ComponentMeta } from "./types";
import { slugify } from "./helpers";

export interface TocEntry {
  text: string;
  id?: string;
  level?: number;
}

export function TOC({ entries }: { entries: TocEntry[] }) {
  if (entries.length === 0) return "";
  const minLevel = Math.min(...entries.map((e) => e.level ?? 1));
  const lines = entries.map((e) => {
    const indent = "  ".repeat((e.level ?? 1) - minLevel);
    const id = e.id ?? slugify(e.text);
    return `${indent}- [${e.text}](#${id})`;
  });
  return lines.join("\n") + "\n\n";
}
TOC.meta = {
  usage: '<TOC entries={[{ text: "Usage", level: 2 }]} />',
  output: "Nested markdown list of in-page links",
} satisfies ComponentMeta;
