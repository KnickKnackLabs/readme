import { expect, test, describe } from "bun:test";
import {
  Bold, Italic, Code, Link, Image,
  Heading, Paragraph, CodeBlock, Blockquote, HR, LineBreak,
  List, Item,
  Table, TableHead, TableRow, Cell,
  Center, Details,
  Raw, HtmlLink, Sub, Align, HtmlTable, HtmlTr, HtmlTd,
  Badge, Badges,
  Chat, Message,
  Section,
  Alert,
  Chat, Message,
  box, labeledBox, sideBySide,
} from "./components";
import { escapeHtml } from "./components/helpers";

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

describe("HtmlLink", () => {
  test("renders an anchor tag", () => {
    expect(<HtmlLink href="https://example.com">click</HtmlLink>).toBe('<a href="https://example.com">click</a>');
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

// --- Helpers ---

describe("escapeHtml", () => {
  test("escapes angle brackets", () => {
    expect(escapeHtml("<table>")).toBe("&lt;table&gt;");
  });

  test("escapes ampersands", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  test("escapes ampersands before angle brackets", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });

  test("passes through plain text unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });

  test("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });

  test("escapes complex HTML", () => {
    expect(escapeHtml('<div align="center">')).toBe('&lt;div align="center"&gt;');
  });
});

// --- Table cells with HTML content (regression) ---

describe("table with HTML in cells", () => {
  test("escaped HTML in cells does not break table structure", () => {
    const result = (
      <Table>
        <TableHead>
          <Cell>Component</Cell>
          <Cell>Output</Cell>
        </TableHead>
        <TableRow>
          <Cell><Code>{"<Center>...</Center>"}</Code></Cell>
          <Cell>{escapeHtml('<div align="center">')}</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{"<HtmlTable>...</HtmlTable>"}</Code></Cell>
          <Cell>{escapeHtml("<table> for layout")}</Cell>
        </TableRow>
      </Table>
    );
    // Escaped HTML should not contain raw tags
    expect(result).not.toContain("| <div");
    expect(result).not.toContain("| <table>");
    expect(result).toContain("&lt;div");
    expect(result).toContain("&lt;table&gt;");
    // Table structure should be intact — exactly 4 lines (header, separator, 2 rows)
    // plus trailing newline
    const lines = result.trimEnd().split("\n");
    expect(lines).toHaveLength(4);
    expect(lines.every(l => l.startsWith("|") && l.endsWith("|"))).toBe(true);
  });
});

<<<<<<< HEAD
// --- Alerts ---

describe("Alert", () => {
  test("defaults to NOTE type", () => {
    expect(<Alert>Some info here.</Alert>).toBe("> [!NOTE]\n> Some info here.\n\n");
  });

  test("renders WARNING type", () => {
    expect(<Alert type="WARNING">Be careful.</Alert>).toBe("> [!WARNING]\n> Be careful.\n\n");
  });

  test("renders all alert types", () => {
    for (const type of ["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"] as const) {
      const result = <Alert type={type}>text</Alert>;
      expect(result).toStartWith(`> [!${type}]`);
    }
  });

  test("handles multiline content", () => {
    expect(<Alert>{"line 1\nline 2"}</Alert>).toBe("> [!NOTE]\n> line 1\n> line 2\n\n");
  });

  test("handles inline children", () => {
    expect(<Alert>Use <Code>npm install</Code> first.</Alert>).toBe(
      "> [!NOTE]\n> Use `npm install` first.\n\n"
    );
  });
});

// --- Box drawing utilities ---

describe("box", () => {
  test("draws ASCII box by default", () => {
    const result = box(["hello"]);
    expect(result).toEqual([
      "+-------+",
      "| hello |",
      "+-------+",
    ]);
  });

  test("draws Unicode box with style option", () => {
    const result = box(["hello"], { style: "unicode" });
    expect(result).toEqual([
      "┌───────┐",
      "│ hello │",
      "└───────┘",
    ]);
  });

  test("pads lines to equal width", () => {
    const result = box(["hi", "longer"]);
    expect(result).toEqual([
      "+--------+",
      "| hi     |",
      "| longer |",
      "+--------+",
    ]);
  });

  test("respects custom padding", () => {
    const result = box(["hi"], { padding: 3 });
    expect(result).toEqual([
      "+--------+",
      "|   hi   |",
      "+--------+",
    ]);
  });

  test("handles empty lines", () => {
    const result = box(["a", "", "b"]);
    expect(result).toHaveLength(5); // top + 3 content + bottom
    expect(result[2]).toBe("|   |"); // empty line gets padded to max width
  });

  test("returns empty array for empty input", () => {
    expect(box([])).toEqual([]);
  });
});

describe("labeledBox", () => {
  test("creates box with title, body, and status", () => {
    const lines = labeledBox("Title", ["line 1", "line 2"], "ok");
    expect(lines[0]).toBe("+--------+"); // top border
    expect(lines[1]).toBe("| Title  |"); // title
    expect(lines[2]).toBe("|        |"); // gap
    expect(lines[3]).toBe("| line 1 |"); // body
    expect(lines[4]).toBe("| line 2 |"); // body
    expect(lines[5]).toBe("|        |"); // gap
    expect(lines[6]).toBe("| ok     |"); // status
    expect(lines[7]).toBe("+--------+"); // bottom border
  });

  test("supports unicode style", () => {
    const lines = labeledBox("T", ["b"], "s", { style: "unicode" });
    expect(lines[0]).toStartWith("┌");
    expect(lines[0]).toEndWith("┐");
    expect(lines[lines.length - 1]).toStartWith("└");
  });

  test("sizes to longest content", () => {
    const lines = labeledBox("A", ["very long body line"], "B");
    // All lines should have the same length
    const lengths = new Set(lines.map(l => l.length));
    expect(lengths.size).toBe(1);
  });

  test("omits status section when status is undefined", () => {
    const lines = labeledBox("Title", ["body"]);
    // Should be: top, title, gap, body, bottom = 5 lines
    expect(lines).toHaveLength(5);
    expect(lines[0]).toBe("+-------+");
    expect(lines[1]).toBe("| Title |");
    expect(lines[2]).toBe("|       |");
    expect(lines[3]).toBe("| body  |");
    expect(lines[4]).toBe("+-------+");
  });

  test("omits status section when status is empty string", () => {
    const withoutStatus = labeledBox("T", ["b"]);
    const withStatus = labeledBox("T", ["b"], "s");
    // Without status should be shorter (no gap + status lines)
    expect(withoutStatus.length).toBe(withStatus.length - 2);
  });
});

describe("sideBySide", () => {
  test("places columns next to each other", () => {
    const left = ["aaa", "bbb"];
    const right = ["111", "222"];
    const result = sideBySide([left, right]);
    expect(result).toEqual(["aaa  111", "bbb  222"]);
  });

  test("pads shorter columns with spaces", () => {
    const left = ["a", "b", "c"];
    const right = ["1"];
    const result = sideBySide([left, right]);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("a  1");
    expect(result[1]).toBe("b   "); // right column padded
    expect(result[2]).toBe("c   ");
  });

  test("respects custom gap", () => {
    const result = sideBySide([["aa"], ["bb"]], 4);
    expect(result).toEqual(["aa    bb"]);
  });

  test("works with labeledBox output", () => {
    const a = labeledBox("A", ["x"], "ok");
    const b = labeledBox("B", ["y"], "ok");
    const result = sideBySide([a, b]);
    // Every line should have the same length
    const lengths = new Set(result.map(l => l.length));
    expect(lengths.size).toBe(1);
  });

  test("returns empty array for empty input", () => {
    expect(sideBySide([])).toEqual([]);
  });
});

// --- Chat components ---

describe("Message", () => {
  test("renders sender name in bold blockquote", () => {
    const result = <Message from="alice">hello</Message>;
    expect(result).toContain("**alice**");
    expect(result).toContain("> hello");
  });

  test("renders badge prefix before name", () => {
    const result = <Message from="junior" badge="R">test</Message>;
    expect(result).toContain("**R junior**");
  });

  test("renders timestamp as subscript", () => {
    const result = <Message from="alice" timestamp="10:58 PM">hi</Message>;
    expect(result).toContain("<sub>10:58 PM</sub>");
  });

  test("omits badge when not provided", () => {
    const result = <Message from="alice">hi</Message>;
    expect(result).not.toContain("undefined");
    expect(result).toMatch(/\*\*alice\*\*/);
  });

  test("omits timestamp when not provided", () => {
    const result = <Message from="alice">hi</Message>;
    expect(result).not.toContain("<sub>");
  });

  test("handles multiline body", () => {
    const result = <Message from="alice">{"line1\nline2"}</Message>;
    expect(result).toContain("> line1");
    expect(result).toContain("> line2");
  });
});

describe("Chat", () => {
  test("passes children through", () => {
    const result = <Chat>{"hello"}</Chat>;
    expect(result).toBe("hello");
  });

  test("composes multiple messages", () => {
    const result = (
      <Chat>
        <Message from="alice">hi</Message>
        <Message from="bob">hey</Message>
      </Chat>
    );
    expect(result).toContain("**alice**");
    expect(result).toContain("**bob**");
    expect(result).toContain("> hi");
    expect(result).toContain("> hey");
  });
});
