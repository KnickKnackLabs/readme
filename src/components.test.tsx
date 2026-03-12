import { expect, test, describe } from "bun:test";
import {
  Bold, Italic, Code, Link, Image,
  Heading, Paragraph, CodeBlock, Blockquote, HR, LineBreak,
  List, Item,
  Table, TableHead, TableRow, Cell,
  Center, Details,
  Raw, Sub, Align, HtmlTable, HtmlTr, HtmlTd,
  Badge, Badges,
  Section,
} from "./components";

// --- Inline elements ---

describe("Bold", () => {
  test("wraps text in double asterisks", () => {
    expect(<Bold>hello</Bold>).toBe("**hello**");
  });
});

describe("Italic", () => {
  test("wraps text in single asterisks", () => {
    expect(<Italic>hello</Italic>).toBe("*hello*");
  });
});

describe("Code", () => {
  test("wraps text in backticks", () => {
    expect(<Code>foo()</Code>).toBe("`foo()`");
  });
});

describe("Link", () => {
  test("renders markdown link", () => {
    expect(<Link href="https://example.com">click here</Link>).toBe("[click here](https://example.com)");
  });
});

describe("Image", () => {
  test("renders markdown image", () => {
    expect(<Image src="logo.png" alt="Logo" />).toBe("![Logo](logo.png)");
  });

  test("renders HTML img with width", () => {
    expect(<Image src="logo.png" alt="Logo" width={200} />).toBe('<img src="logo.png" alt="Logo" width="200" />');
  });
});

// --- Block elements ---

describe("Heading", () => {
  test("defaults to level 1", () => {
    expect(<Heading>Title</Heading>).toBe("# Title\n\n");
  });

  test("respects level prop", () => {
    expect(<Heading level={2}>Subtitle</Heading>).toBe("## Subtitle\n\n");
    expect(<Heading level={3}>Section</Heading>).toBe("### Section\n\n");
  });
});

describe("Paragraph", () => {
  test("renders text with trailing blank line", () => {
    expect(<Paragraph>Hello world</Paragraph>).toBe("Hello world\n\n");
  });

  test("joins array children", () => {
    expect(<Paragraph>Hello <Bold>world</Bold></Paragraph>).toBe("Hello **world**\n\n");
  });
});

describe("CodeBlock", () => {
  test("renders fenced code block", () => {
    expect(<CodeBlock>const x = 1;</CodeBlock>).toBe("```\nconst x = 1;\n```\n\n");
  });

  test("includes language tag", () => {
    expect(<CodeBlock lang="bash">echo hi</CodeBlock>).toBe("```bash\necho hi\n```\n\n");
  });
});

describe("Blockquote", () => {
  test("prefixes lines with >", () => {
    expect(<Blockquote>Hello</Blockquote>).toBe("> Hello\n\n");
  });

  test("handles multiline content", () => {
    expect(<Blockquote>{"line 1\nline 2"}</Blockquote>).toBe("> line 1\n> line 2\n\n");
  });
});

describe("HR", () => {
  test("renders horizontal rule", () => {
    expect(<HR />).toBe("---\n\n");
  });
});

describe("LineBreak", () => {
  test("renders HTML break", () => {
    expect(<LineBreak />).toBe("<br />\n\n");
  });
});

// --- Lists ---

describe("List", () => {
  test("renders unordered list", () => {
    expect(
      <List>
        <Item>one</Item>
        <Item>two</Item>
      </List>
    ).toBe("- one\n- two\n\n");
  });

  test("renders ordered list", () => {
    expect(
      <List ordered>
        <Item>first</Item>
        <Item>second</Item>
      </List>
    ).toBe("1. first\n2. second\n\n");
  });
});

// --- Table ---

describe("Table", () => {
  test("renders a complete table", () => {
    const result = (
      <Table>
        <TableHead>
          <Cell>Name</Cell>
          <Cell>Value</Cell>
        </TableHead>
        <TableRow>
          <Cell>foo</Cell>
          <Cell>bar</Cell>
        </TableRow>
        <TableRow>
          <Cell>baz</Cell>
          <Cell>qux</Cell>
        </TableRow>
      </Table>
    );
    expect(result).toBe(
      "| Name | Value |\n" +
      "| --- | --- |\n" +
      "| foo | bar |\n" +
      "| baz | qux |\n\n"
    );
  });
});

// --- Layout / GitHub-specific ---

describe("Center", () => {
  test("wraps content in center-aligned div", () => {
    expect(<Center><Heading>Hi</Heading></Center>).toBe(
      '<div align="center">\n\n# Hi\n\n</div>\n\n'
    );
  });
});

describe("Details", () => {
  test("renders collapsible section", () => {
    expect(<Details summary="More info"><Paragraph>Hidden content</Paragraph></Details>).toBe(
      "<details>\n<summary><b>More info</b></summary>\n\nHidden content\n\n</details>\n\n"
    );
  });
});

// --- HTML passthrough ---

describe("Raw", () => {
  test("passes content through unchanged", () => {
    expect(<Raw>{'<div class="custom">hello</div>'}</Raw>).toBe('<div class="custom">hello</div>');
  });
});

describe("Sub", () => {
  test("wraps in sub tags", () => {
    expect(<Sub>small text</Sub>).toBe("<sub>\nsmall text\n</sub>");
  });
});

describe("Align", () => {
  test("defaults to center alignment", () => {
    const result = <Align><Image src="test.png" alt="test" width={400} /></Align>;
    expect(result).toContain('align="center"');
    expect(result).toContain('<img src="test.png"');
  });
});

describe("HtmlTable", () => {
  test("renders two-column layout", () => {
    const result = (
      <HtmlTable>
        <HtmlTr>
          <HtmlTd width="50%"><Paragraph>Left</Paragraph></HtmlTd>
          <HtmlTd width="50%"><Paragraph>Right</Paragraph></HtmlTd>
        </HtmlTr>
      </HtmlTable>
    );
    expect(result).toContain("<table>");
    expect(result).toContain('width="50%"');
    expect(result).toContain("Left");
    expect(result).toContain("Right");
    expect(result).toContain("</table>");
  });
});

// --- Badges ---

describe("Badge", () => {
  test("renders shields.io badge", () => {
    const result = <Badge label="license" value="MIT" color="blue" />;
    expect(result).toContain("img.shields.io/badge/license-MIT-blue");
    expect(result).toStartWith("![license: MIT]");
  });

  test("wraps in link when href provided", () => {
    const result = <Badge label="license" value="MIT" color="blue" href="LICENSE" />;
    expect(result).toStartWith("[!");
    expect(result).toEndWith("](LICENSE)");
  });

  test("includes logo params", () => {
    const result = <Badge label="Swift" value="5.9" color="F05138" logo="swift" logoColor="white" />;
    expect(result).toContain("logo=swift");
    expect(result).toContain("logoColor=white");
  });

  test("escapes dashes for shields.io", () => {
    const result = <Badge label="x" value="foo-bar" color="blue" />;
    expect(result).toContain("foo--bar");
    expect(result).not.toMatch(/foo-bar-blue/);
  });

  test("escapes underscores for shields.io", () => {
    const result = <Badge label="x" value="foo_bar" color="blue" />;
    expect(result).toContain("foo__bar");
  });
});

describe("Badges", () => {
  test("joins badges with newlines", () => {
    const result = (
      <Badges>
        <Badge label="a" value="1" color="red" />
        <Badge label="b" value="2" color="blue" />
      </Badges>
    );
    expect(result).toContain("\n");
    expect(result).toEndWith("\n\n");
  });
});

// --- Section ---

describe("Section", () => {
  test("renders heading and content", () => {
    expect(
      <Section title="Install"><Paragraph>Run this.</Paragraph></Section>
    ).toBe("## Install\n\nRun this.\n\n");
  });

  test("respects level prop", () => {
    expect(
      <Section title="Sub" level={3}><Paragraph>Details.</Paragraph></Section>
    ).toBe("### Sub\n\nDetails.\n\n");
  });
});

// --- Composition ---

describe("composition", () => {
  test("inline elements nest inside paragraphs", () => {
    expect(
      <Paragraph>Use <Code>npm install</Code> to get started.</Paragraph>
    ).toBe("Use `npm install` to get started.\n\n");
  });

  test("bold and code compose", () => {
    expect(<Bold><Code>hello</Code></Bold>).toBe("**`hello`**");
  });

  test("fragments join children", () => {
    const result = (
      <>
        <Heading>Title</Heading>
        <Paragraph>Body</Paragraph>
      </>
    );
    expect(result).toBe("# Title\n\nBody\n\n");
  });

  test("sections nest inside center", () => {
    const result = (
      <Center>
        <Section title="License"><Paragraph>MIT</Paragraph></Section>
      </Center>
    );
    expect(result).toBe('<div align="center">\n\n## License\n\nMIT\n\n</div>\n\n');
  });

  test("map() inside table produces clean rows (no stray commas)", () => {
    const items = [{ name: "a", desc: "first" }, { name: "b", desc: "second" }];
    const result = (
      <Table>
        <TableHead>
          <Cell>Name</Cell>
          <Cell>Desc</Cell>
        </TableHead>
        {items.map(i => (
          <TableRow>
            <Cell>{i.name}</Cell>
            <Cell>{i.desc}</Cell>
          </TableRow>
        ))}
      </Table>
    );
    expect(result).not.toContain(",|");
    expect(result).toBe(
      "| Name | Desc |\n" +
      "| --- | --- |\n" +
      "| a | first |\n" +
      "| b | second |\n\n"
    );
  });
});
