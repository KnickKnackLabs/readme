<div align="center">

# readme

**Generate README.md files from JSX.**

Write your README as a TSX file with composable components.
Build it to markdown. Keep it honest in CI.

[![runtime: Bun](https://img.shields.io/badge/runtime-Bun-f472b6?style=flat&logo=bun&logoColor=white)](https://bun.sh)
![output: GitHub Flavored Markdown](https://img.shields.io/badge/output-GitHub%20Flavored%20Markdown-blue?style=flat)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat)](LICENSE)
![lints: 0](https://img.shields.io/badge/lints-0-0ea5e9?style=flat)

</div>

## How it works

A custom JSX runtime where every component returns a markdown string instead of a DOM element. You author `README.tsx`, run `readme build`, and get a clean `README.md`.

No React. No bundler. Just Bun's native JSX support pointed at a tiny runtime that outputs text.

## Install

```bash
shiv install KnickKnackLabs/readme
```

## Usage

Create a `README.tsx` in your project root:

```tsx
import { Heading, Paragraph, Bold, Section, CodeBlock } from "readme";

const readme = (
  <>
    <Heading level={1}>My Project</Heading>
    <Paragraph><Bold>A short description.</Bold></Paragraph>

    <Section title="Install">
      <CodeBlock lang="bash">{`npm install my-project`}</CodeBlock>
    </Section>
  </>
);

console.log(readme);
```

Then build:

```bash
readme build              # README.tsx → README.md
readme build --check      # Exit 1 if README.md is stale (for CI)
```

## GitHub Action

Use the composite action to keep generated READMEs honest in CI:

```yaml
- uses: KnickKnackLabs/readme@v0.3.1
  with:
    check: true
```

For READMEs outside the workspace root, set `working-directory` to the directory containing `README.tsx`:

```yaml
- uses: KnickKnackLabs/readme@v0.3.1
  with:
    check: true
    working-directory: docs
```

## Components (39)

Auto-generated from `src/components/` exports. Each component carries a `.meta` property describing its usage.

| Component | Output |
| --- | --- |
| `<Alert type="WARNING">text</Alert>` | &gt; [!WARNING]
&gt; text |
| `<Align align="center">...</Align>` | &lt;p align="..."&gt; |
| `<Anchor id="section">text</Anchor>` | [text](#section) |
| `<Badge label=... value=... />` | shields.io badge |
| `<Badges>...</Badges>` | Badge row with spacing |
| `<Blockquote>text</Blockquote>` | &gt; text |
| `<Bold>text</Bold>` | **text** |
| `<Cell>text</Cell>` | Table cell content |
| `<Center>...</Center>` | &lt;div align="center"&gt; |
| `<Chat><Message ...>...</Message></Chat>` | Conversation transcript as blockquotes |
| `<Code>text</Code>` | `` `text` `` |
| `<CodeBlock lang="bash">...</CodeBlock>` | Fenced code block |
| `<Details summary=...>...</Details>` | Collapsible section |
| `<HR />` | --- |
| `<Heading level={2}>Title</Heading>` | ## Title |
| `<HtmlLink href="url">text</HtmlLink>` | &lt;a&gt; tag |
| `<HtmlTable>...</HtmlTable>` | &lt;table&gt; for layout |
| `<HtmlTd width=... valign=...>` | &lt;td&gt; cell with optional sizing |
| `<HtmlTr>...</HtmlTr>` | &lt;tr&gt; row |
| `<Image src="..." alt="..." />` | ![alt](src) or HTML with width |
| `<Italic>text</Italic>` | _text_ |
| `<Item>text</Item>` | List item content |
| `<LineBreak />` | &lt;br /&gt; |
| `<Link href="url">text</Link>` | [text](url) |
| `<List><Item>...</Item></List>` | Bulleted or numbered list |
| `<Message from="alice" badge="🤖">Hello!</Message>` | &gt; **🤖 alice**\
&gt; Hello! |
| `<Paragraph>Text</Paragraph>` | Text with trailing blank line |
| `<Raw>html</Raw>` | HTML passthrough |
| `<Rule premises={["A"]} conclusion="B" name="MyRule" />` | ```math block with \frac{A}{B} \text{ (MyRule)} |
| `<RuleSet title="Rules"><Rule ... /></RuleSet>` | Optional heading followed by grouped Rule blocks |
| `<Section title=... level=...>` | Heading + content block |
| `<Sub>text</Sub>` | &lt;sub&gt; tag |
| `<TOC headings={[{ text: "Usage", level: 2 }]} />` | Nested heading links; pass id for exact anchors |
| `<Table>...</Table>` | GFM table (Prettier-compatible padding) |
| `<TableHead><Cell>...</Cell></TableHead>` | Header row + separator |
| `<TableRow><Cell>...</Cell></TableRow>` | Table data row |
| `box(lines, { style, padding })` | ASCII or Unicode box around text (string[]) |
| `labeledBox(title, body, status?)` | Box with title, body, and optional status |
| `sideBySide(columns, gap)` | Place line arrays side by side |

## Why JSX?

- **Composable** — build custom components from primitives, share across repos
- **Programmable** — use loops, conditionals, imports, any TypeScript you want
- **Type-safe** — your editor knows what props each component accepts
- **Agent-native** — agents generate and edit TSX fluently; the output is just code

## Development

```bash
git clone https://github.com/KnickKnackLabs/readme.git
cd readme && mise trust && mise install
README_CALLER_PWD="$PWD" mise run build
```

This README is itself generated from `README.tsx` — dogfooding all the way down.

## Validation

Before merging, run the full validation suite:

```bash
mise run test
codebase lint "$PWD"
readme build --check
git diff --check
mise run doctor
```

<div align="center">

## License

MIT

</div>
