import type { ComponentMeta } from "./types";

export function TerminalImage({ src, alt, width }: { src: string; alt: string; width?: number }) {
  if (width) {
    return `<img src="${src}" alt="${alt}" width="${width}" />`;
  }
  return `![${alt}](${src})`;
}
TerminalImage.meta = {
  usage: '<TerminalImage src="docs/assets/terminal/abc123.svg" alt="demo" />',
  output: "![demo](docs/assets/terminal/abc123.svg)",
} satisfies ComponentMeta;
