import type { ComponentMeta } from "./types";

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
