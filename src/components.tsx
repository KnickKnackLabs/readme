// Markdown components — each one returns a markdown string.
//
// Spacing convention: block elements emit a trailing blank line (\n\n)
// so they naturally separate from whatever follows. Inline elements
// return raw text with no trailing whitespace.
//
// Each component carries a `.meta` property describing its usage and output.
// README.tsx reads these to generate the component reference table.

// --- Types ---

export interface ComponentMeta {
  usage: string;
  output: string;
}

// --- Helpers ---

function flatten(c: any): string {
  if (c == null) return "";
  if (Array.isArray(c)) return c.map(flatten).join("");
  return String(c);
}

function shieldsEncode(s: string): string {
  return encodeURIComponent(s).replaceAll("-", "--").replaceAll("_", "__");
}

// --- Inline elements ---

export function Bold({ children: c }: { children: string }) {
  return `**${c}**`;
}
Bold.meta = { usage: "<Bold>text</Bold>", output: "**text**" } satisfies ComponentMeta;

export function Italic({ children: c }: { children: string }) {
  return `*${c}*`;
}
Italic.meta = { usage: "<Italic>text</Italic>", output: "*text*" } satisfies ComponentMeta;

export function Code({ children: c }: { children: string }) {
  return `\`${c}\``;
}
Code.meta = { usage: "<Code>text</Code>", output: "`` `text` ``" } satisfies ComponentMeta;

export function Link({ href, children: c }: { href: string; children: string }) {
  return `[${c}](${href})`;
}
Link.meta = { usage: '<Link href="url">text</Link>', output: "[text](url)" } satisfies ComponentMeta;

export function Image({ src, alt, width }: { src: string; alt: string; width?: number }) {
  if (width) {
    return `<img src="${src}" alt="${alt}" width="${width}" />`;
  }
  return `![${alt}](${src})`;
}
Image.meta = { usage: '<Image src="..." alt="..." />', output: "![alt](src) or HTML with width" } satisfies ComponentMeta;

// --- Block elements ---

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

// --- Lists ---

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

// --- Table ---

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

// --- Layout / GitHub-specific ---

export function Center({ children: c }: { children?: string | string[] }) {
  return `<div align="center">\n\n${flatten(c)}</div>\n\n`;
}
Center.meta = { usage: "<Center>...</Center>", output: '<div align="center">' } satisfies ComponentMeta;

export function Details({ summary, children: c }: { summary: string; children?: string | string[] }) {
  return `<details>\n<summary><b>${summary}</b></summary>\n\n${flatten(c)}</details>\n\n`;
}
Details.meta = { usage: "<Details summary=...>...</Details>", output: "Collapsible section" } satisfies ComponentMeta;

// --- HTML passthrough ---

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

export function Align({ align = "center", children: c }: { align?: string; children?: string | string[] }) {
  return `<p align="${align}">\n  ${flatten(c)}\n</p>\n\n`;
}
Align.meta = { usage: '<Align align="center">...</Align>', output: '<p align="...">' } satisfies ComponentMeta;

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

// --- Badges ---

export function Badge({
  label,
  value,
  color,
  logo,
  logoColor,
  href,
}: {
  label: string;
  value: string;
  color: string;
  logo?: string;
  logoColor?: string;
  href?: string;
}) {
  const params = new URLSearchParams({ style: "flat" });
  if (logo) params.set("logo", logo);
  if (logoColor) params.set("logoColor", logoColor);
  const url = `https://img.shields.io/badge/${shieldsEncode(label)}-${shieldsEncode(value)}-${color}?${params}`;
  const img = `![${label}: ${value}](${url})`;
  return href ? `[${img}](${href})` : img;
}
Badge.meta = { usage: "<Badge label=... value=... />", output: "shields.io badge" } satisfies ComponentMeta;

export function Badges({ children: c }: { children?: string | string[] }) {
  const badges = Array.isArray(c) ? c : c ? [c] : [];
  return badges.join("\n") + "\n\n";
}
Badges.meta = { usage: "<Badges>...</Badges>", output: "Badge row with spacing" } satisfies ComponentMeta;

// --- Section helper ---

export function Section({ title, level = 2, children: c }: { title: string; level?: number; children?: string | string[] }) {
  return `${"#".repeat(level)} ${title}\n\n${flatten(c)}`;
}
Section.meta = { usage: "<Section title=... level=...>", output: "Heading + content block" } satisfies ComponentMeta;

// --- Box drawing utilities ---

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
 * Draw a labeled box with a title, body lines, and a status line.
 * Returns an array of lines (for use with sideBySide).
 */
export function labeledBox(title: string, body: string[], status: string, { style = "ascii" as BoxStyle } = {}): string[] {
  if (!body.length) body = [""];
  const c = BOX_CHARS[style];
  const maxLen = Math.max(title.length, ...body.map((l) => l.length), status.length);
  const w = maxLen + 2;
  const pad = (s: string) => " " + s + " ".repeat(w - s.length - 1);
  return [
    c.tl + c.h.repeat(w) + c.tr,
    c.v + pad(title) + c.v,
    c.v + " ".repeat(w) + c.v,
    ...body.map((l) => c.v + pad(l) + c.v),
    c.v + " ".repeat(w) + c.v,
    c.v + pad(status) + c.v,
    c.bl + c.h.repeat(w) + c.br,
  ];
}
labeledBox.meta = { usage: "labeledBox(title, body, status)", output: "Box with title, body, and status" } satisfies ComponentMeta;

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
