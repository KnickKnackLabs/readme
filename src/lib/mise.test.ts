import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm, chmod } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

import { parseTasks, countBatsTests } from "./mise";

describe("parseTasks", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "readme-mise-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const task = async (rel: string, body: string, opts: { executable?: boolean } = {}) => {
    const full = join(dir, rel);
    await mkdir(join(full, ".."), { recursive: true });
    await writeFile(full, body);
    if (opts.executable !== false) {
      await chmod(full, 0o755);
    }
  };

  test("parses description, a boolean flag, and a valued flag with short/required/default", async () => {
    await task(
      "build",
      `#!/usr/bin/env bash
#MISE description="Build the thing"
#USAGE flag "--check" help="Exit 1 if stale"
#USAGE flag "-o --out-dir <dir>" help="Where to write" default="dist" required=#true
set -e
`,
    );

    const [cmd] = parseTasks(dir);
    expect(cmd.name).toBe("build");
    expect(cmd.description).toBe("Build the thing");

    const check = cmd.flags.find((f) => f.name === "--check")!;
    expect(check.isBoolean).toBe(true);
    expect(check.help).toBe("Exit 1 if stale");
    expect(check.valueName).toBeUndefined();

    const out = cmd.flags.find((f) => f.name === "--out-dir")!;
    expect(out.isBoolean).toBe(false);
    expect(out.shortFlag).toBe("-o");
    expect(out.valueName).toBe("dir");
    expect(out.default).toBe("dist");
    expect(out.required).toBe(true);
  });

  test("distinguishes required <arg> from optional [arg]", async () => {
    await task(
      "run",
      `#MISE description="Run it"
#USAGE arg "<input>" help="Source file"
#USAGE arg "[output]" help="Destination"
`,
    );

    const [cmd] = parseTasks(dir);
    expect(cmd.args).toEqual([
      { name: "input", help: "Source file", optional: false },
      { name: "output", help: "Destination", optional: true },
    ]);
  });

  test("parses TypeScript-style //MISE and //USAGE headers", async () => {
    await task(
      "docs",
      `#!/usr/bin/env bun
//MISE description="Generate docs"
//USAGE flag "--name <name>" help="Project name" default="readme"
//USAGE arg "[target]" help="Target directory"
`,
    );

    const [cmd] = parseTasks(dir);
    expect(cmd.description).toBe("Generate docs");
    expect(cmd.flags).toEqual([
      {
        name: "--name",
        valueName: "name",
        help: "Project name",
        default: "readme",
        isBoolean: false,
      },
    ]);
    expect(cmd.args).toEqual([{ name: "target", help: "Target directory", optional: true }]);
  });

  test("walks nested dirs into ':'-joined names", async () => {
    await task("pre-commit/install", `#MISE description="Install hook"\n`);
    await task("pre-commit/remove", `#MISE description="Remove hook"\n`);

    const names = parseTasks(dir).map((c) => c.name);
    expect(names).toContain("pre-commit:install");
    expect(names).toContain("pre-commit:remove");
  });

  test("excludes hidden tasks, helpers, and dot/underscore-prefixed entries", async () => {
    await task("visible", `#MISE description="Shown"\n`);
    await task("secret", `#MISE description="Nope"\n#MISE hide=true\n`);
    await task("_helper", `#MISE description="Helper"\n`);
    await task(".dotfile", `#MISE description="Dotfile"\n`);
    await task("lib.sh", `#MISE description="Sourced helper"\n`, { executable: false });

    const names = parseTasks(dir).map((c) => c.name);
    expect(names).toEqual(["visible"]);
  });

  test("returns results sorted by name", async () => {
    await task("zebra", `#MISE description="z"\n`);
    await task("apple", `#MISE description="a"\n`);
    await task("mango", `#MISE description="m"\n`);

    expect(parseTasks(dir).map((c) => c.name)).toEqual(["apple", "mango", "zebra"]);
  });

  test("returns [] for a missing directory", () => {
    expect(parseTasks(join(dir, "does-not-exist"))).toEqual([]);
  });

  test("parses this repo's own .mise/tasks (dogfood)", () => {
    const tasks = parseTasks(join(import.meta.dir, "../../.mise/tasks"));
    const names = tasks.map((t) => t.name);
    expect(names).toContain("build");
    expect(names).toContain("pre-commit:install");

    const build = tasks.find((t) => t.name === "build")!;
    expect(build.flags.some((f) => f.name === "--check")).toBe(true);
  });
});

describe("countBatsTests", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "readme-bats-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  test("counts @test across nested .bats files and lists only .bats", async () => {
    await mkdir(join(dir, "nested"), { recursive: true });
    await writeFile(
      join(dir, "a.bats"),
      `@test "one" {\n  true\n}\n@test "two" {\n  true\n}\n`,
    );
    await writeFile(join(dir, "nested", "b.bats"), `@test "three" {\n  true\n}\n`);
    await writeFile(join(dir, "helpers.bash"), `@test "not counted" {}\n`);

    const { count, files } = countBatsTests(dir);
    expect(count).toBe(3);
    expect(files).toEqual(["a.bats", "nested/b.bats"]);
  });

  test("returns zero for a missing directory", () => {
    expect(countBatsTests(join(dir, "nope"))).toEqual({ count: 0, files: [] });
  });
});
