// src/docs-generate.ts
// Entry point for `readme docs` mise task.
//
// Reads README_CALLER_PWD, loads mise task metadata, generates a
// self-contained command-reference HTML page, and prints the result to stdout.
//
// The mise task captures stdout, compares with existing output, and
// writes only on content change (content-aware write per #15).

import { existsSync } from "fs";
import { execFileSync } from "child_process";
import { basename, join } from "path";
import { parseTasks } from "./lib/mise";
import { renderDocsHtml } from "./lib/docs";

function normalizeRepoUrl(url: string): string {
  return url.replace(/^git@([^:]+):/, "https://$1/").replace(/\.git$/, "");
}

function getDefaultRepoUrl(targetDir: string): string | undefined {
  try {
    const url = execFileSync("git", ["-C", targetDir, "config", "--get", "remote.origin.url"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return url ? normalizeRepoUrl(url) : undefined;
  } catch {
    return undefined;
  }
}

function getDefaultName(targetDir: string): string {
  return basename(targetDir) || "project";
}

const targetDir = process.env.README_CALLER_PWD;
if (!targetDir) {
  console.error(
    "Error: README_CALLER_PWD is not set.\n" +
    "readme docs must be run through the installed readme shim, or with\n" +
    "README_CALLER_PWD set to the target project directory."
  );
  process.exit(1);
}

const taskDir = join(targetDir, ".mise/tasks");
if (!existsSync(taskDir)) {
  console.log(`No .mise/tasks found in ${targetDir} — nothing to document.`);
  process.exit(0);
}

const commands = parseTasks(taskDir);

const name = process.env.DOCS_NAME || getDefaultName(targetDir);
const tagline = process.env.DOCS_TAGLINE || undefined;
const repoUrl = process.env.DOCS_REPO_URL || getDefaultRepoUrl(targetDir);

const html = renderDocsHtml({ name, tagline, repoUrl, commands });

process.stdout.write(html);