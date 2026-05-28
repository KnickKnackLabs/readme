// Barrel export — public API for readme.
//
// Usage from a README.tsx file:
//   import { Heading, Paragraph, Bold, Code, Link } from "readme";

export * from "./components/index";
export type { TerminalOptions } from "./lib/terminal";
export { terminalAssetPath, generateTerminalSvg, writeTerminalAsset } from "./lib/terminal";
