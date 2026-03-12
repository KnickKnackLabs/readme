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
} from "./src/components";

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

      <CodeBlock lang="tsx">{`import { Heading, Paragraph, Bold, Section, CodeBlock } from "./src/components";

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

    <Section title="Components">
      <Table>
        <TableHead>
          <Cell>Component</Cell>
          <Cell>Output</Cell>
        </TableHead>
        <TableRow>
          <Cell><Code>{"<Heading level={2}>Title</Heading>"}</Code></Cell>
          <Cell><Code>## Title</Code></Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{"<Paragraph>Text</Paragraph>"}</Code></Cell>
          <Cell>Text block with trailing blank line</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{"<Bold>text</Bold>"}</Code></Cell>
          <Cell><Code>**text**</Code></Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{"<Italic>text</Italic>"}</Code></Cell>
          <Cell><Code>*text*</Code></Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{"<Code>text</Code>"}</Code></Cell>
          <Cell>`` `text` ``</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{'<Link href="url">text</Link>'}</Code></Cell>
          <Cell><Code>[text](url)</Code></Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{'<Image src="..." alt="..." />'}</Code></Cell>
          <Cell><Code>![alt](src)</Code> or HTML with width</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{'<CodeBlock lang="bash">...</CodeBlock>'}</Code></Cell>
          <Cell>Fenced code block</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{"<Blockquote>text</Blockquote>"}</Code></Cell>
          <Cell><Code>{"> text"}</Code></Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{"<Badge label=... value=... />"}</Code></Cell>
          <Cell>shields.io badge</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{"<Center>...</Center>"}</Code></Cell>
          <Cell>{'<div align="center">'}</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{"<Details summary=...>...</Details>"}</Code></Cell>
          <Cell>Collapsible section</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{"<Table> + <TableHead> + <TableRow>"}</Code></Cell>
          <Cell>GFM table</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{"<Section title=... level=...>"}</Code></Cell>
          <Cell>Heading + content block</Cell>
        </TableRow>
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
mise run build`}</CodeBlock>

      <Paragraph>
        This README is itself generated from <Code>README.tsx</Code> — dogfooding all the way down.
      </Paragraph>
    </Section>

    <Center>
      <Section title="License">
        <Paragraph>MIT</Paragraph>
      </Section>
    </Center>
  </>
);

console.log(readme);
