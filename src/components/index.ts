// Barrel export — all components re-exported from focused modules.
// `import * as allComponents` preserves alphabetical ordering per ES spec.
//
// Spacing convention:
//   Block elements (Heading, Paragraph, CodeBlock, etc.) emit a trailing
//   blank line (\n\n) so they naturally separate from whatever follows.
//   Inline elements (Bold, Code, Link, etc.) return raw text with no
//   trailing whitespace.
//
// Each component carries a `.meta` property ({ usage, output }) used by
// README.tsx to auto-generate the component reference table.

export type { ComponentMeta } from "./types";
export { Bold, Italic, Code, Link, Image } from "./inline";
export { Heading, Paragraph, CodeBlock, Blockquote, HR, LineBreak } from "./block";
export { List, Item } from "./list";
export { Table, TableHead, TableRow, Cell } from "./table";
export { Center, Details, Section, Align } from "./layout";
export { Raw, HtmlLink, Sub, HtmlTable, HtmlTr, HtmlTd } from "./html";
export { Badge, Badges } from "./badges";
export { Alert } from "./alert";
export { Chat, Message } from "./chat";
export type { BoxStyle } from "./box";
export { box, labeledBox, sideBySide } from "./box";
