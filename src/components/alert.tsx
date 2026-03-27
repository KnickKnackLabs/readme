import type { ComponentMeta } from "./types";
import { flatten } from "./helpers";

type AlertType = "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";

export function Alert({
  type = "NOTE",
  children: c,
}: {
  type?: AlertType;
  children?: string | string[];
}) {
  const text = flatten(c).replace(/\n$/, "");
  const lines = text.split("\n").map((l) => `> ${l}`);
  return `> [!${type}]\n${lines.join("\n")}\n\n`;
}
Alert.meta = {
  usage: '<Alert type="WARNING">text</Alert>',
  output: "> [!WARNING]\n> text",
} satisfies ComponentMeta;
