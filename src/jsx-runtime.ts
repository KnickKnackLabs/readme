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

export function Fragment({ children }: { children?: string | string[] }): string {
  if (!children) return "";
  if (Array.isArray(children)) return children.join("");
  return children;
}
