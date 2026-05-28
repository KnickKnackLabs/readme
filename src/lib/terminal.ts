import ansiToSvg from "ansi-to-svg";
import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";

export interface TerminalOptions {
  title?: string;
  theme?: "dark" | "light";
  width?: number;
  padding?: number;
  outDir?: string;
}

export function terminalAssetPath(content: string, outDir = "docs/assets/terminal"): string {
  const hash = createHash("sha1").update(content).digest("hex").slice(0, 8);
  return `${outDir}/${hash}.svg`;
}

export async function generateTerminalSvg(content: string, opts: TerminalOptions = {}): Promise<string> {
  return ansiToSvg(content, {
    colors: opts.theme === "light" ? "solarized" : "github",
    ...(opts.width ? { width: opts.width } : {}),
    ...(opts.padding ? { paddingTop: opts.padding, paddingBottom: opts.padding } : {}),
  });
}

export async function writeTerminalAsset(content: string, opts: TerminalOptions = {}): Promise<string> {
  const path = terminalAssetPath(content, opts.outDir);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, await generateTerminalSvg(content, opts));
  return path;
}
