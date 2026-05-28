import { expect, test, describe } from "bun:test";
import { mkdtemp, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { terminalAssetPath, generateTerminalSvg, writeTerminalAsset } from "./terminal";

describe("terminalAssetPath", () => {
  test("returns path under default outDir", () => {
    const path = terminalAssetPath("hello");
    expect(path).toStartWith("docs/assets/terminal/");
    expect(path).toEndWith(".svg");
  });

  test("is deterministic for same content", () => {
    expect(terminalAssetPath("hello")).toBe(terminalAssetPath("hello"));
  });

  test("differs for different content", () => {
    expect(terminalAssetPath("hello")).not.toBe(terminalAssetPath("world"));
  });

  test("respects custom outDir", () => {
    expect(terminalAssetPath("hello", "out/svgs")).toStartWith("out/svgs/");
  });

  test("hash is 8 hex chars", () => {
    const path = terminalAssetPath("hello");
    const filename = path.split("/").at(-1)!.replace(".svg", "");
    expect(filename).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe("generateTerminalSvg", () => {
  test("returns an SVG string", async () => {
    const svg = await generateTerminalSvg("$ echo hello\nhello");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  test("includes the terminal content", async () => {
    const svg = await generateTerminalSvg("hello world");
    expect(svg).toContain("hello");
  });

  test("accepts dark theme", async () => {
    const svg = await generateTerminalSvg("hello", { theme: "dark" });
    expect(svg).toContain("<svg");
  });

  test("accepts light theme", async () => {
    const svg = await generateTerminalSvg("hello", { theme: "light" });
    expect(svg).toContain("<svg");
  });
});

describe("writeTerminalAsset", () => {
  test("writes SVG file and returns path", async () => {
    const dir = await mkdtemp(join(tmpdir(), "terminal-test-"));
    try {
      const path = await writeTerminalAsset("$ echo hi", { outDir: dir });
      expect(path).toStartWith(dir);
      expect(path).toEndWith(".svg");
      const file = Bun.file(path);
      expect(await file.exists()).toBe(true);
      const content = await file.text();
      expect(content).toContain("<svg");
    } finally {
      await rm(dir, { recursive: true });
    }
  });

  test("creates output directory if it does not exist", async () => {
    const dir = await mkdtemp(join(tmpdir(), "terminal-test-"));
    try {
      const nested = join(dir, "deep", "nested");
      const path = await writeTerminalAsset("hello", { outDir: nested });
      const file = Bun.file(path);
      expect(await file.exists()).toBe(true);
    } finally {
      await rm(dir, { recursive: true });
    }
  });
});
