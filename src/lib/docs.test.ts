// src/lib/docs.test.ts
// Unit tests for the HTML docs renderer.

import { describe, it, expect } from "bun:test";
import { renderDocsHtml } from "./docs";

describe("renderDocsHtml", () => {
  it("renders a minimal page with name and no commands", () => {
    const html = renderDocsHtml({ name: "my-tool", commands: [] });
    expect(html).toContain("<title>my-tool</title>");
    expect(html).toContain("<h1>my-tool</h1>");
    expect(html).toContain("No commands found.");
  });

  it("renders tagline when provided", () => {
    const html = renderDocsHtml({ name: "my-tool", tagline: "A great tool", commands: [] });
    expect(html).toContain("A great tool");
    expect(html).toContain('class="tagline"');
  });

  it("renders repo links when repoUrl is provided", () => {
    const html = renderDocsHtml({
      name: "my-tool",
      repoUrl: "https://github.com/KnickKnackLabs/my-tool",
      commands: [],
    });
    expect(html).toContain("https://github.com/KnickKnackLabs/my-tool");
    expect(html).toContain("GitHub");
    expect(html).toContain("Issues");
  });

  it("omits footer when repoUrl is not provided", () => {
    const html = renderDocsHtml({ name: "my-tool", commands: [] });
    expect(html).not.toContain('class="links"');
  });

  it("renders a command heading and description", () => {
    const html = renderDocsHtml({
      name: "my-tool",
      commands: [
        {
          name: "build",
          description: "Build the project",
          flags: [],
          args: [],
          hidden: false,
        },
      ],
    });
    expect(html).toContain("<h2>build</h2>");
    expect(html).toContain("Build the project");
  });

  it("renders boolean flags", () => {
    const html = renderDocsHtml({
      name: "my-tool",
      commands: [
        {
          name: "check",
          description: "Check for issues",
          flags: [
            { name: "--check", help: "Verify without writing", isBoolean: true, shortFlag: "-c" },
          ],
          args: [],
          hidden: false,
        },
      ],
    });
    expect(html).toContain("-c, --check");
    expect(html).toContain("Verify without writing");
  });

  it("renders flags with value placeholders", () => {
    const html = renderDocsHtml({
      name: "my-tool",
      commands: [
        {
          name: "build",
          description: "Build the project",
          flags: [
            {
              name: "--out-dir",
              help: "Output directory",
              isBoolean: false,
              valueName: "dir",
              required: false,
            },
          ],
          args: [],
          hidden: false,
        },
      ],
    });
    expect(html).toContain("--out-dir &lt;dir&gt;");
    expect(html).toContain("Output directory");
  });

  it("renders required flags with annotation", () => {
    const html = renderDocsHtml({
      name: "my-tool",
      commands: [
        {
          name: "install",
          description: "Install the tool",
          flags: [
            { name: "--path", help: "Installation path", isBoolean: false, valueName: "path", required: true },
          ],
          args: [],
          hidden: false,
        },
      ],
    });
    expect(html).toContain("(required)");
  });

  it("renders flags with default values", () => {
    const html = renderDocsHtml({
      name: "my-tool",
      commands: [
        {
          name: "build",
          description: "Build the project",
          flags: [
            { name: "--format", help: "Output format", isBoolean: false, valueName: "fmt", default: "markdown" },
          ],
          args: [],
          hidden: false,
        },
      ],
    });
    expect(html).toContain("(default: markdown)");
  });

  it("renders args with optional markers", () => {
    const html = renderDocsHtml({
      name: "my-tool",
      commands: [
        {
          name: "run",
          description: "Run a task",
          flags: [],
          args: [
            { name: "task", help: "Task name", optional: false },
            { name: "args", help: "Additional arguments", optional: true },
          ],
          hidden: false,
        },
      ],
    });
    expect(html).toContain("&lt;task&gt;");
    expect(html).toContain("[args]");
    expect(html).toContain("(optional)");
  });

  it("escapes HTML in user-provided content", () => {
    const html = renderDocsHtml({
      name: "my<script>alert(1)</script>-tool",
      tagline: "A <b>bold</b> tool",
      repoUrl: "https://github.com/KnickKnackLabs/my-tool",
      commands: [
        {
          name: "build",
          description: "Build & deploy",
          flags: [
            { name: "--mode", help: "Mode <dev|prod>", isBoolean: false, valueName: "mode" },
          ],
          args: [],
          hidden: false,
        },
      ],
    });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>");
    expect(html).not.toContain("<dev|prod>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;");
    expect(html).toContain("&lt;dev|prod&gt;");
  });

  it("emits valid HTML document structure", () => {
    const html = renderDocsHtml({ name: "my-tool", commands: [] });
    expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(html).toContain("<html lang=\"en\">");
    expect(html).toContain("</html>");
    expect(html).toContain("<head>");
    expect(html).toContain("</head>");
    expect(html).toContain("<body>");
    expect(html).toContain("</body>");
  });
});