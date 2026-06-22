// Bun's --tsconfig-override flag is broken (oven-sh/bun#22023), so when this
// file lives outside the readme repo, auto-discovery won't find the right
// tsconfig. The pragma below ensures our custom JSX runtime is used regardless.
/** @jsxImportSource jsx-md */

import {
  Heading, Paragraph, CodeBlock, Blockquote, LineBreak, HR,
  Bold, Code, Link,
  Badge, Badges, Center, Details, Section,
  Table, TableHead, TableRow, Cell,
  List, Item,
} from "readme";

import type { ComponentMeta } from "readme";
import * as allComponents from "readme";
import { escapeHtml } from "readme/src/components/helpers";

// Build component reference from exports — each export with .meta is documented,
// those without are shown with a warning
const componentRows = Object.entries(allComponents)
  .filter(([name]) => name !== "ComponentMeta") // skip the type re-export
  .map(([name, value]) => {
    const meta = (value as any)?.meta as ComponentMeta | undefined;
    if (meta) return { name, ...meta };
    console.error(`warning: export "${name}" has no .meta — add .meta to the component in src/components/`);
    return { name, usage: name, output: "⚠️ undocumented" };
  });

// Count lint rules from mise.toml's [_.codebase] lint list for the lints badge.
function countLints(): number {
  try {
    const toml = readFileSync(new URL("../mise.toml", import.meta.url), "utf-8");
    const inSection = toml.match(/\[_\.codebase\]\s*\n([\s\S]*?)(?=\n\[|$)/);
    if (!inSection) return 0;
    const lintMatch = inSection[1].match(/lint\s*=\s*\[([\s\S]*?)\]/);
    if (!lintMatch) return 0;
    return lintMatch[1].split(",").filter(s => s.trim()).length;
  } catch {
    return 0;
  }
}

const readme = (
  <>
    <Center>
      <Heading level={1}>readme</Heading>

      <Paragraph>
        <Bold>Generate README.md files from JSX.</Bold>
      </Paragraph>

      <Paragraph>
        Write your README as a TSX file with composable components.{"\n"}
        Build it to markdown. Keep it honest in CI.
      </Paragraph>

      <Badges>
        <Badge label="runtime" value="Bun" color="f472b6" logo="bun" logoColor="white" href="https://bun.sh" />
        <Badge label="output" value="GitHub Flavored Markdown" color="blue" />
        <Badge label="License" value="MIT" color="blue" href="LICENSE" />
        <Badge label="lints" value={String(countLints())} color="0ea5e9" />
      </Badges>
    </Center>

    <Section title="How it works">
      <Paragraph>
        A custom JSX runtime where every component returns a markdown string
        instead of a DOM element. You author <Code>README.tsx</Code>, run{" "}
        <Code>readme build</Code>, and get a clean <Code>README.md</Code>.
      </Paragraph>

      <Paragraph>
        No React. No bundler. Just Bun's native JSX support pointed at a
        tiny runtime that outputs text.
      </Paragraph>
    </Section>

    <Section title="Install">
      <CodeBlock lang="bash">{`shiv install KnickKnackLabs/readme`}</CodeBlock>
    </Section>

    <Section title="Usage">
      <Paragraph>
        Create a <Code>README.tsx</Code> in your project root:
      </Paragraph>

      <CodeBlock lang="tsx">{`import { Heading, Paragraph, Bold, Section, CodeBlock } from "readme";

const readme = (
  <>
    <Heading level={1}>My Project</Heading>
    <Paragraph><Bold>A short description.</Bold></Paragraph>

    <Section title="Install">
      <CodeBlock lang="bash">{\`npm install my-project\`}</CodeBlock>
    </Section>
  </>
);

console.log(readme);`}</CodeBlock>

      <Paragraph>Then build:</Paragraph>

      <CodeBlock lang="bash">{`readme build              # README.tsx → README.md
readme build --check      # Exit 1 if README.md is stale (for CI)`}</CodeBlock>
    </Section>

    <Section title="GitHub Action">
      <Paragraph>
        Use the composite action to keep generated READMEs honest in CI:
      </Paragraph>

      <CodeBlock lang="yaml">{`- uses: KnickKnackLabs/readme@v0.3.1
  with:
    check: true`}</CodeBlock>

      <Paragraph>
        For READMEs outside the workspace root, set <Code>working-directory</Code>
        {" to the directory containing "}<Code>README.tsx</Code>:
      </Paragraph>

      <CodeBlock lang="yaml">{`- uses: KnickKnackLabs/readme@v0.3.1
  with:
    check: true
    working-directory: docs`}</CodeBlock>
    </Section>

    <Section title={`Components (${componentRows.length})`}>
      <Paragraph>
        {"Auto-generated from "}
        <Code>src/components/</Code>
        {" exports. Each component carries a "}
        <Code>.meta</Code>
        {" property describing its usage."}
      </Paragraph>

      <Table>
        <TableHead>
          <Cell>Component</Cell>
          <Cell>Output</Cell>
        </TableHead>
        {componentRows.map(row => (
          <TableRow>
            <Cell><Code>{row.usage}</Code></Cell>
            <Cell>{escapeHtml(row.output)}</Cell>
          </TableRow>
        ))}
      </Table>
    </Section>

    <Section title="Why JSX?">
      <List>
        <Item><Bold>Composable</Bold> — build custom components from primitives, share across repos</Item>
        <Item><Bold>Programmable</Bold> — use loops, conditionals, imports, any TypeScript you want</Item>
        <Item><Bold>Type-safe</Bold> — your editor knows what props each component accepts</Item>
        <Item><Bold>Agent-native</Bold> — agents generate and edit TSX fluently; the output is just code</Item>
      </List>
    </Section>

    <Section title="Development">
      <CodeBlock lang="bash">{`git clone https://github.com/KnickKnackLabs/readme.git
cd readme && mise trust && mise install
README_CALLER_PWD="$PWD" mise run build`}</CodeBlock>

      <Paragraph>
        This README is itself generated from <Code>README.tsx</Code> — dogfooding all the way down.
      </Paragraph>
    </Section>

    <Section title="Validation">
      <Paragraph>
        Before merging, run the full validation suite:
      </Paragraph>

      <CodeBlock lang="bash">{`mise run test
codebase lint "$PWD"
readme build --check
git diff --check
mise run doctor`}</CodeBlock>
    </Section>

    <Center>
      <Section title="License">
        <Paragraph>MIT</Paragraph>
      </Section>
    </Center>
  </>
);

console.log(readme);
