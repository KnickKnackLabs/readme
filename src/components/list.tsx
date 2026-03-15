import type { ComponentMeta } from "./types";
import { flatten } from "./helpers";

export function List({ ordered, children: c }: { ordered?: boolean; children?: string | string[] }) {
  const items = Array.isArray(c) ? c : c ? [c] : [];
  return items
    .map((item, i) => (ordered ? `${i + 1}. ${item}` : `- ${item}`))
    .join("\n") + "\n\n";
}
List.meta = { usage: "<List><Item>...</Item></List>", output: "Bulleted or numbered list" } satisfies ComponentMeta;

export function Item({ children: c }: { children?: string | string[] }) {
  return flatten(c);
}
Item.meta = { usage: "<Item>text</Item>", output: "List item content" } satisfies ComponentMeta;
