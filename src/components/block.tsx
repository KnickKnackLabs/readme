import type { ComponentMeta } from "./types";
import { flatten } from "./helpers";

export function Heading({ level = 1, children: c }: { level?: number; children: string }) {
  return `${"#".repeat(level)} ${c}\n\n`;
}
Heading.meta = { usage: "<Heading level={2}>Title</Heading>", output: "## Title" } satisfies ComponentMeta;

export function Paragraph({ children: c }: { children?: string | string[] }) {
  return `${flatten(c)}\n\n`;
}
Paragraph.meta = { usage: "<Paragraph>Text</Paragraph>", output: "Text with trailing blank line" } satisfies ComponentMeta;

export function CodeBlock({ lang, children: c }: { lang?: string; children: string }) {
  return `\`\`\`${lang ?? ""}\n${c}\n\`\`\`\n\n`;
}
CodeBlock.meta = { usage: '<CodeBlock lang="bash">...</CodeBlock>', output: "Fenced code block" } satisfies ComponentMeta;

export function Blockquote({ children: c }: { children?: string | string[] }) {
  const text = flatten(c);
  const lines = text.split("\n").map((l) => `> ${l}`);
  return lines.join("\n") + "\n\n";
}
Blockquote.meta = { usage: "<Blockquote>text</Blockquote>", output: "> text" } satisfies ComponentMeta;

export function HR() {
  return `---\n\n`;
}
HR.meta = { usage: "<HR />", output: "---" } satisfies ComponentMeta;

export function LineBreak() {
  return `<br />\n\n`;
}
LineBreak.meta = { usage: "<LineBreak />", output: "<br />" } satisfies ComponentMeta;
