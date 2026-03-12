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

## Components

| Component | Output |
| --- | --- |
| `<Heading level={2}>Title</Heading>` | `## Title` |
| `<Paragraph>Text</Paragraph>` | Text block with trailing blank line |
| `<Bold>text</Bold>` | `**text**` |
| `<Italic>text</Italic>` | `*text*` |
| `<Code>text</Code>` | `` `text` `` |
| `<Link href="url">text</Link>` | `[text](url)` |
| `<Image src="..." alt="..." />` | `![alt](src)` or HTML with width |
| `<CodeBlock lang="bash">...</CodeBlock>` | Fenced code block |
| `<Blockquote>text</Blockquote>` | `> text` |
| `<Badge label=... value=... />` | shields.io badge |
| `<Center>...</Center>` | <div align="center"> |
| `<Details summary=...>...</Details>` | Collapsible section |
| `<Table> + <TableHead> + <TableRow>` | GFM table |
| `<Section title=... level=...>` | Heading + content block |

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
