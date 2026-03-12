import { expect, test, describe } from "bun:test";
import { mkdtemp, writeFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const REPO_DIR = join(import.meta.dir, "..");

// Simulate a README.tsx that lives outside the readme repo, like in a consumer
// project (e.g. wallpapers). The pragma handles jsxImportSource while
// --tsconfig-override provides paths for module resolution.
// This catches regressions in the workaround for oven-sh/bun#22023.

describe("cross-repo build", () => {
  let dir: string;

  test("pragma + tsconfig-override produces markdown, not raw JSX", async () => {
    dir = await mkdtemp(join(tmpdir(), "readme-cross-repo-"));

    // A minimal README.tsx with the pragma, importing from the readme repo
    await writeFile(
      join(dir, "README.tsx"),
      `/** @jsxImportSource jsx-md */
import { Heading, Paragraph, Bold } from "readme/src/components";

const readme = (
  <>
    <Heading>Hello</Heading>
    <Paragraph>This is <Bold>cross-repo</Bold>.</Paragraph>
  </>
);
console.log(readme);
`,
    );

    // A tsconfig with only paths (no jsxImportSource — the pragma handles that)
    const tsconfig = join(dir, "tsconfig.json");
    await writeFile(
      tsconfig,
      JSON.stringify({
        compilerOptions: {
          paths: {
            "jsx-md/jsx-runtime": [`${REPO_DIR}/src/jsx-runtime.ts`],
            "jsx-md/jsx-dev-runtime": [`${REPO_DIR}/src/jsx-dev-runtime.ts`],
            "readme/*": [`${REPO_DIR}/*`],
          },
        },
      }),
    );

    const proc = Bun.spawn(
      ["bun", "--tsconfig-override", tsconfig, join(dir, "README.tsx")],
      { stdout: "pipe", stderr: "pipe" },
    );

    const output = await new Response(proc.stdout).text();
    await proc.exited;

    // Should be rendered markdown, not raw JSX
    expect(output).toContain("# Hello");
    expect(output).toContain("**cross-repo**");
    expect(output).not.toContain("<Heading>");
    expect(output).not.toContain("<Bold>");
  });

  test("without pragma, cross-repo build outputs raw JSX (regression guard)", async () => {
    dir = await mkdtemp(join(tmpdir(), "readme-cross-repo-"));

    // Same file but WITHOUT the pragma — should fail to use our runtime
    await writeFile(
      join(dir, "README.tsx"),
      `import { Heading, Paragraph, Bold } from "readme/src/components";

const readme = (
  <>
    <Heading>Hello</Heading>
    <Paragraph>This is <Bold>cross-repo</Bold>.</Paragraph>
  </>
);
console.log(readme);
`,
    );

    const tsconfig = join(dir, "tsconfig.json");
    await writeFile(
      tsconfig,
      JSON.stringify({
        compilerOptions: {
          jsxImportSource: "jsx-md",
          paths: {
            "jsx-md/jsx-runtime": [`${REPO_DIR}/src/jsx-runtime.ts`],
            "jsx-md/jsx-dev-runtime": [`${REPO_DIR}/src/jsx-dev-runtime.ts`],
            "readme/*": [`${REPO_DIR}/*`],
          },
        },
      }),
    );

    const proc = Bun.spawn(
      ["bun", "--tsconfig-override", tsconfig, join(dir, "README.tsx")],
      { stdout: "pipe", stderr: "pipe" },
    );

    const output = await new Response(proc.stdout).text();
    await proc.exited;

    // This demonstrates the Bun bug — jsxImportSource in the override is ignored,
    // so the output is raw JSX instead of markdown.
    // When Bun fixes oven-sh/bun#22023, this test should start failing —
    // that's our signal that the pragma workaround is no longer needed.
    expect(output).toContain("<Heading>");
  });
});
