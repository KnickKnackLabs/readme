// Custom JSX runtime that renders to Markdown strings.
//
// Bun calls jsx() / jsxs() for every <Tag> in a .tsx file.
// Instead of building a DOM tree, we return plain strings.

export function jsx(
  tag: string | Function,
  props: Record<string, any>,
): string {
  if (typeof tag === "function") {
    return tag(props);
  }
  throw new Error(`Unknown intrinsic element: <${tag}>. Use a component instead.`);
}

export const jsxs = jsx;

function flatten(c: any): string {
  if (c == null) return "";
  if (Array.isArray(c)) return c.map(flatten).join("");
  return String(c);
}

export function Fragment({ children }: { children?: any }): string {
  return flatten(children);
}
