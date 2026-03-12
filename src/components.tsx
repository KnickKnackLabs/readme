// Markdown components — each one returns a markdown string.
//
// Spacing convention: block elements emit a trailing blank line (\n\n)
// so they naturally separate from whatever follows. Inline elements
// return raw text with no trailing whitespace.

// --- Helpers ---

function flatten(c: string | string[] | undefined): string {
  if (!c) return "";
  if (Array.isArray(c)) return c.join("");
  return c;
}

function shieldsEncode(s: string): string {
  return encodeURIComponent(s).replaceAll("-", "--").replaceAll("_", "__");
}

// --- Inline elements ---

export function Bold({ children: c }: { children: string }) {
  return `**${c}**`;
}

export function Italic({ children: c }: { children: string }) {
  return `*${c}*`;
}

export function Code({ children: c }: { children: string }) {
  return `\`${c}\``;
}

export function Link({ href, children: c }: { href: string; children: string }) {
  return `[${c}](${href})`;
}

export function Image({ src, alt, width }: { src: string; alt: string; width?: number }) {
  if (width) {
    return `<img src="${src}" alt="${alt}" width="${width}" />`;
  }
  return `![${alt}](${src})`;
}

// --- Block elements ---

export function Heading({ level = 1, children: c }: { level?: number; children: string }) {
  return `${"#".repeat(level)} ${c}\n\n`;
}

export function Paragraph({ children: c }: { children?: string | string[] }) {
  return `${flatten(c)}\n\n`;
}

export function CodeBlock({ lang, children: c }: { lang?: string; children: string }) {
  return `\`\`\`${lang ?? ""}\n${c}\n\`\`\`\n\n`;
}

export function Blockquote({ children: c }: { children?: string | string[] }) {
  const text = flatten(c);
  const lines = text.split("\n").map((l) => `> ${l}`);
  return lines.join("\n") + "\n\n";
}

export function HR() {
  return `---\n\n`;
}

export function LineBreak() {
  return `<br />\n\n`;
}

// --- Lists ---

export function List({ ordered, children: c }: { ordered?: boolean; children?: string | string[] }) {
  const items = Array.isArray(c) ? c : c ? [c] : [];
  return items
    .map((item, i) => (ordered ? `${i + 1}. ${item}` : `- ${item}`))
    .join("\n") + "\n\n";
}

export function Item({ children: c }: { children?: string | string[] }) {
  return flatten(c);
}

// --- Table ---

export function Table({ children: c }: { children?: string | string[] }) {
  return flatten(c) + "\n";
}

export function TableHead({ children: c }: { children?: string | string[] }) {
  const cells = Array.isArray(c) ? c : c ? [c] : [];
  const header = `| ${cells.join(" | ")} |`;
  const separator = `| ${cells.map(() => "---").join(" | ")} |`;
  return header + "\n" + separator + "\n";
}

export function TableRow({ children: c }: { children?: string | string[] }) {
  const cells = Array.isArray(c) ? c : c ? [c] : [];
  return `| ${cells.join(" | ")} |\n`;
}

export function Cell({ children: c }: { children?: string | string[] }) {
  return flatten(c);
}

// --- Layout / GitHub-specific ---

export function Center({ children: c }: { children?: string | string[] }) {
  return `<div align="center">\n\n${flatten(c)}</div>\n\n`;
}

export function Details({ summary, children: c }: { summary: string; children?: string | string[] }) {
  return `<details>\n<summary><b>${summary}</b></summary>\n\n${flatten(c)}</details>\n\n`;
}

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

export function Badges({ children: c }: { children?: string | string[] }) {
  const badges = Array.isArray(c) ? c : c ? [c] : [];
  return badges.join("\n") + "\n\n";
}

// --- Section helper ---

export function Section({ title, level = 2, children: c }: { title: string; level?: number; children?: string | string[] }) {
  return `${"#".repeat(level)} ${title}\n\n${flatten(c)}`;
}
