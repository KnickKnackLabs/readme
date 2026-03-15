// Barrel export — all components re-exported from focused modules.
// `import * as allComponents` preserves alphabetical ordering per ES spec.

export type { ComponentMeta } from "./types";
export { Bold, Italic, Code, Link, Image } from "./inline";
export { Heading, Paragraph, CodeBlock, Blockquote, HR, LineBreak } from "./block";
export { List, Item } from "./list";
export { Table, TableHead, TableRow, Cell } from "./table";
export { Center, Details, Section, Align } from "./layout";
export { Raw, HtmlLink, Sub, HtmlTable, HtmlTr, HtmlTd } from "./html";
export { Badge, Badges } from "./badges";
export type { BoxStyle } from "./box";
export { box, labeledBox, sideBySide } from "./box";
