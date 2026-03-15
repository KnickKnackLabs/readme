import type { ComponentMeta } from "./types";
import { shieldsEncode } from "./helpers";

export function Badge({
  label,
  value,
  color,
  logo,
  logoColor,
  href,
}: {
  label: string;
  value: string;
  color: string;
  logo?: string;
  logoColor?: string;
  href?: string;
}) {
  const params = new URLSearchParams({ style: "flat" });
  if (logo) params.set("logo", logo);
  if (logoColor) params.set("logoColor", logoColor);
  const url = `https://img.shields.io/badge/${shieldsEncode(label)}-${shieldsEncode(value)}-${color}?${params}`;
  const img = `![${label}: ${value}](${url})`;
  return href ? `[${img}](${href})` : img;
}
Badge.meta = { usage: "<Badge label=... value=... />", output: "shields.io badge" } satisfies ComponentMeta;

export function Badges({ children: c }: { children?: string | string[] }) {
  const badges = Array.isArray(c) ? c : c ? [c] : [];
  return badges.join("\n") + "\n\n";
}
Badges.meta = { usage: "<Badges>...</Badges>", output: "Badge row with spacing" } satisfies ComponentMeta;
