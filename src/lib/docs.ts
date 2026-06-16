// src/lib/docs.ts
// HTML docs generator for mise file-task command references.
//
// Produces a single self-contained HTML file (shiv aesthetic: GitHub-dark,
// monospace, zero dependencies) from parsed mise task metadata.
//
//   import { renderDocsHtml } from "readme/src/lib/docs";
//   import { parseTasks } from "readme/src/lib/mise";
//
//   const commands = parseTasks(".mise/tasks");
//   const html = renderDocsHtml({ name: "my-tool", commands });

import type { MiseCommand, MiseFlag, MiseArg } from "./mise";

export interface DocsOptions {
  /** Tool/project name (shown as h1). */
  name: string;
  /** Optional one-line tagline. */
  tagline?: string;
  /** Optional GitHub repo URL for the footer link. */
  repoUrl?: string;
  /** Parsed mise commands to document. */
  commands: MiseCommand[];
}

function css(): string {
  return `body {
      font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
      background: #0d1117;
      color: #c9d1d9;
      max-width: 720px;
      margin: 4rem auto;
      padding: 0 2rem;
      line-height: 1.6;
    }
    h1 { color: #f0f6fc; font-size: 2rem; margin-bottom: 0.25rem; }
    h2 { color: #f0f6fc; font-size: 1.2rem; margin-top: 2rem; }
    .tagline { color: #8b949e; margin-top: 0; }
    .dim { color: #8b949e; margin-bottom: 0.25rem; }
    a { color: #58a6ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .links { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #30363d; }
    code {
      background: #161b22;
      padding: 0.8rem 1.2rem;
      display: block;
      border-radius: 6px;
      border: 1px solid #30363d;
      margin: 0.5rem 0 1rem;
      white-space: pre-wrap;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.5rem 0 1rem;
    }
    th, td {
      text-align: left;
      padding: 0.4rem 0.6rem;
      border-bottom: 1px solid #21262d;
    }
    th { color: #8b949e; font-weight: normal; font-size: 0.85rem; }
    td:first-child { font-weight: bold; color: #f0f6fc; white-space: nowrap; }
    .optional { color: #8b949e; font-size: 0.85rem; }`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderFlagName(flag: MiseFlag): string {
  let result = flag.shortFlag ? `${flag.shortFlag}, ` : "";
  result += flag.name;
  if (flag.valueName) result += ` <${flag.valueName}>`;
  return result;
}

function renderCommandHtml(cmd: MiseCommand): string {
  const parts: string[] = [];

  // Command heading
  parts.push(`<h2>${escapeHtml(cmd.name)}</h2>`);

  // Description
  if (cmd.description) {
    parts.push(`<p class="dim">${escapeHtml(cmd.description)}</p>`);
  }

  // Usage line
  const usageParts = [escapeHtml(cmd.name)];
  // Flags always appear optional in usage synopsis
  for (const flag of cmd.flags) {
    if (flag.isBoolean) {
      usageParts.push(`[${escapeHtml(flag.name)}]`);
    } else {
      const placeholder = flag.valueName ? ` <${flag.valueName}>` : "";
      usageParts.push(`[${escapeHtml(flag.name)}${placeholder}]`);
    }
  }
  for (const arg of cmd.args) {
    if (arg.optional) {
      usageParts.push(escapeHtml(`[${arg.name}]`));
    } else {
      usageParts.push(escapeHtml(`<${arg.name}>`));
    }
  }
  parts.push(`<code>${usageParts.join(" ")}</code>`);

  // Flags table
  if (cmd.flags.length > 0) {
    parts.push(`<table>`);
    parts.push(`<tr><th>Flag</th><th>Description</th></tr>`);
    for (const flag of cmd.flags) {
      const flagStr = renderFlagName(flag);
      const helpParts: string[] = [escapeHtml(flag.help)];
      if (flag.default) helpParts.push(`(default: ${escapeHtml(flag.default)})`);
      if (flag.required) helpParts.push("(required)");
      parts.push(`<tr><td>${escapeHtml(flagStr)}</td><td>${helpParts.join(" ")}</td></tr>`);
    }
    parts.push(`</table>`);
  }

  // Args
  if (cmd.args.length > 0) {
    parts.push(`<table>`);
    parts.push(`<tr><th>Arg</th><th>Description</th></tr>`);
    for (const arg of cmd.args) {
      const desc = arg.optional
        ? `${escapeHtml(arg.help)} <span class="optional">(optional)</span>`
        : escapeHtml(arg.help);
      parts.push(`<tr><td>${escapeHtml(arg.name)}</td><td>${desc}</td></tr>`);
    }
    parts.push(`</table>`);
  }

  return parts.join("\n");
}

/**
 * Generate a self-contained HTML document listing mise commands
 * as a command reference, matching the shiv GitHub-dark aesthetic.
 */
export function renderDocsHtml(opts: DocsOptions): string {
  const { name, tagline, repoUrl, commands } = opts;

  const bodyParts: string[] = [];

  // Header
  bodyParts.push(`<h1>${escapeHtml(name)}</h1>`);
  if (tagline) {
    bodyParts.push(`<p class="tagline">${escapeHtml(tagline)}</p>`);
  }

  // Commands
  if (commands.length === 0) {
    bodyParts.push(`<p class="dim">No commands found.</p>`);
  } else {
    for (const cmd of commands) {
      bodyParts.push(renderCommandHtml(cmd));
    }
  }

  // Footer
  if (repoUrl) {
    bodyParts.push(`<div class="links">` +
      `<a href="${escapeHtml(repoUrl)}">GitHub</a>` +
      ` &middot; ` +
      `<a href="${escapeHtml(repoUrl)}/issues">Issues</a>` +
      `</div>`);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(name)}</title>
  <style>${css()}</style>
</head>
<body>
${bodyParts.join("\n")}
</body>
</html>
`;
}