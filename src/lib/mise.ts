// Shared parsing helpers for mise file-tasks.
//
// mise file-tasks carry metadata in `#MISE` and `#USAGE` comment headers (the
// jdx/usage spec). README.tsx files across repos kept reimplementing the same
// parser to auto-generate a command/flags table, plus a `@test` counter for a
// "tests passing" badge. This consolidates both.
//
// mise-specific, so it lives in src/lib and is deliberately NOT re-exported from
// the main "readme" barrel — codebases that aren't mise-based don't need it.
//
//   import { parseTasks, countBatsTests } from "readme/src/lib/mise";
//
//   const tasks = parseTasks(".mise/tasks");          // MiseCommand[]
//   const { count, files } = countBatsTests("test");  // { count, files }

import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join } from "path";

export interface MiseFlag {
  /** Long form, e.g. "--check". */
  name: string;
  /** Short form if declared, e.g. "-c". */
  shortFlag?: string;
  /** Value placeholder for flags that take an argument, e.g. "dir" for `--out-dir <dir>`. */
  valueName?: string;
  help: string;
  required?: boolean;
  default?: string;
  /** True when the flag takes no value (`valueName` is absent). */
  isBoolean: boolean;
}

export interface MiseArg {
  name: string;
  help: string;
  optional: boolean;
}

export interface MiseCommand {
  /** Nested directories are joined with ":", e.g. "pre-commit:install". */
  name: string;
  description: string;
  flags: MiseFlag[];
  args: MiseArg[];
  hidden: boolean;
}

export interface BatsTestCount {
  count: number;
  files: string[];
}

type UsageAttrs = Record<string, string | boolean>;

// Parse the trailing attributes of a #USAGE line, order-independently:
//   help="..."   default="..."   required=#true
function parseUsageAttrs(rest: string): UsageAttrs {
  const attrs: UsageAttrs = {};
  const attrRe = /(\w[\w-]*)=(?:"([^"]*)"|#(true|false)|([^\s]+))/g;
  for (const match of rest.matchAll(attrRe)) {
    const [, key, quoted, bool, bare] = match;
    if (bool) {
      attrs[key] = bool === "true";
    } else {
      attrs[key] = quoted ?? bare ?? "";
    }
  }
  return attrs;
}

function stringAttr(attrs: UsageAttrs, key: string): string | undefined {
  const value = attrs[key];
  return typeof value === "string" ? value : undefined;
}

function isExecutableFile(filepath: string): boolean {
  return (statSync(filepath).mode & 0o111) !== 0;
}

function parseTaskFile(filepath: string, name: string): MiseCommand {
  const lines = readFileSync(filepath, "utf-8").split("\n");

  const description =
    lines.find((l) => /^\s*(?:#|\/\/)MISE description=/.test(l))
      ?.match(/^\s*(?:#|\/\/)MISE description="(.+)"/)?.[1] ?? "";

  const hidden = lines.some((l) => /^\s*(?:#|\/\/)MISE hide=true\b/.test(l));

  const flags: MiseFlag[] = [];
  const args: MiseArg[] = [];

  for (const line of lines) {
    const flagMatch = line.match(
      /^\s*(?:#|\/\/)USAGE flag "(-[\w-]+ )?--(\w[\w-]*)(?:\s+<([\w-]+)>)?"(.*)$/,
    );
    if (flagMatch) {
      const shortFlag = flagMatch[1]?.trim();
      const flagName = flagMatch[2].replace(/_/g, "-");
      const valueName = flagMatch[3];
      const attrs = parseUsageAttrs(flagMatch[4] || "");
      const required = attrs.required === true;
      flags.push({
        name: `--${flagName}`,
        shortFlag,
        valueName,
        help: stringAttr(attrs, "help") ?? "",
        required: required || undefined,
        default: stringAttr(attrs, "default"),
        isBoolean: !valueName,
      });
      continue;
    }

    const argMatch = line.match(/^\s*(?:#|\/\/)USAGE arg "([<\[])([\w-]+)([>\]])"(.*)$/);
    if (argMatch) {
      const attrs = parseUsageAttrs(argMatch[4] || "");
      args.push({
        name: argMatch[2],
        help: stringAttr(attrs, "help") ?? "",
        optional: argMatch[1] === "[",
      });
    }
  }

  return { name, description, flags, args, hidden };
}

// Recursively collect commands. Nested directories become a ":"-joined prefix
// (matching mise's own task naming, e.g. pre-commit/install → pre-commit:install).
function walkTasks(dir: string, prefix: string): MiseCommand[] {
  const results: MiseCommand[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const taskName = prefix ? `${prefix}:${entry.name}` : entry.name;
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walkTasks(fullPath, taskName));
    } else if (entry.isFile() && isExecutableFile(fullPath)) {
      results.push(parseTaskFile(fullPath, taskName));
    }
  }

  return results;
}

/**
 * Parse every mise file-task under `taskDir` (e.g. ".mise/tasks").
 * Walks nested directories, skips dotfiles / underscore-prefixed helpers and
 * hidden tasks (`#MISE hide=true`), and returns commands sorted by name.
 * Returns `[]` if the directory does not exist.
 */
export function parseTasks(taskDir: string): MiseCommand[] {
  if (!existsSync(taskDir)) return [];
  return walkTasks(taskDir, "")
    .filter((command) => !command.hidden)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Count `@test` declarations across the `.bats` files in `testDir`.
 * Returns the total `count` and the list of `.bats` `files` found.
 * Returns `{ count: 0, files: [] }` if the directory does not exist.
 */
function walkBatsFiles(dir: string, prefix = ""): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkBatsFiles(fullPath, relPath));
    } else if (entry.isFile() && entry.name.endsWith(".bats")) {
      files.push(relPath);
    }
  }

  return files;
}

export function countBatsTests(testDir: string): BatsTestCount {
  if (!existsSync(testDir)) return { count: 0, files: [] };

  const files = walkBatsFiles(testDir).sort();
  const count = files.reduce((total, file) => {
    const src = readFileSync(join(testDir, file), "utf-8");
    return total + (src.match(/@test "/g)?.length ?? 0);
  }, 0);

  return { count, files };
}
