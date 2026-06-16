import type { ComponentMeta } from "./types";
import { flatten, unicodeToLatex } from "./helpers";

export function Rule({
  premises,
  conclusion,
  name,
}: {
  premises: string[];
  conclusion: string;
  name?: string;
}) {
  const latexPremises = premises.map(unicodeToLatex).join(" \\quad ");
  const latexConclusion = unicodeToLatex(conclusion);
  const label = name ? ` \\text{ (${name})}` : "";
  return `\`\`\`math\n\\frac{${latexPremises}}{${latexConclusion}}${label}\n\`\`\`\n\n`;
}
Rule.meta = {
  usage: '<Rule premises={["A"]} conclusion="B" name="MyRule" />',
  output: "```math block with \\frac{A}{B} \\text{ (MyRule)}",
} satisfies ComponentMeta;

export function RuleSet({ title, children: c }: { title?: string; children?: any }) {
  const body = flatten(c);
  return title ? `## ${title}\n\n${body}` : body;
}
RuleSet.meta = {
  usage: '<RuleSet title="Rules"><Rule ... /></RuleSet>',
  output: "Optional heading followed by grouped Rule blocks",
} satisfies ComponentMeta;
