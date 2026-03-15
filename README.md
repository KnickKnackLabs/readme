<div align="center">

# readme

**Generate README.md files from JSX.**

Write your README as a TSX file with composable components.
Build it to markdown. Keep it honest in CI.

[![runtime: Bun](https://img.shields.io/badge/runtime-Bun-f472b6?style=flat&logo=bun&logoColor=white)](https://bun.sh)
![output: GitHub Flavored Markdown](https://img.shields.io/badge/output-GitHub%20Flavored%20Markdown-blue?style=flat)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat)](LICENSE)

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
import { Heading, Paragraph, Bold, Section, CodeBlock } from "./src/components";

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

## Components (32)

Auto-generated from `src/components/` exports. Each component carries a `.meta` property describing its usage.

| Component | Output |
| --- | --- |
| `<Align align="center">...</Align>` | <p align="..."> |
| `<Badge label=... value=... />` | shields.io badge |
| `<Badges>...</Badges>` | Badge row with spacing |
| `<Blockquote>text</Blockquote>` | > text |
| `<Bold>text</Bold>` | **text** |
| `<Cell>text</Cell>` | Table cell content |
| `<Center>...</Center>` | <div align="center"> |
| `<Code>text</Code>` | `` `text` `` |
| `<CodeBlock lang="bash">...</CodeBlock>` | Fenced code block |
| `<Details summary=...>...</Details>` | Collapsible section |
| `<HR />` | --- |
| `<Heading level={2}>Title</Heading>` | ## Title |
| `<HtmlLink href="url">text</HtmlLink>` | <a> tag |
| `<HtmlTable>...</HtmlTable>` | <table> for layout |
| `<HtmlTd width=... valign=...>` | <td> cell with optional sizing |
| `<HtmlTr>...</HtmlTr>` | <tr> row |
| `<Image src="..." alt="..." />` | ![alt](src) or HTML with width |
| `<Italic>text</Italic>` | *text* |
| `<Item>text</Item>` | List item content |
| `<LineBreak />` | <br /> |
| `<Link href="url">text</Link>` | [text](url) |
| `<List><Item>...</Item></List>` | Bulleted or numbered list |
| `<Paragraph>Text</Paragraph>` | Text with trailing blank line |
| `<Raw>html</Raw>` | HTML passthrough |
| `<Section title=... level=...>` | Heading + content block |
| `<Sub>text</Sub>` | <sub> tag |
| `<Table>...</Table>` | GFM table wrapper |
| `<TableHead><Cell>...</Cell></TableHead>` | Header row + separator |
| `<TableRow><Cell>...</Cell></TableRow>` | Table data row |
| `box(lines, { style, padding })` | ASCII or Unicode box around text (string[]) |
| `labeledBox(title, body, status)` | Box with title, body, and status |
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
mise run build
```

This README is itself generated from `README.tsx` — dogfooding all the way down.

<div align="center">

## License

MIT

</div>
