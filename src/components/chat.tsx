import type { ComponentMeta } from "./types";
import { flatten } from "./helpers";

/**
 * A single message in a conversation.
 *
 * <Message from="junior" badge="🤖">Hey, SMS is working!</Message>
 */
export function Message({ from, badge, timestamp, children: c }: {
  from: string;
  badge?: string;
  timestamp?: string;
  children?: string | string[];
}) {
  const prefix = badge ? `${badge} ` : "";
  const ts = timestamp ? ` <sub>${timestamp}</sub>` : "";
  const body = flatten(c);
  return `> **${prefix}${from}**${ts}\\\n> ${body.split("\n").join("\\\n> ")}\n\n`;
}
Message.meta = {
  usage: '<Message from="alice" badge="🤖">Hello!</Message>',
  output: "> **🤖 alice**\\\n> Hello!",
} satisfies ComponentMeta;

/**
 * A conversation thread — semantic wrapper for a sequence of Messages.
 *
 * <Chat>
 *   <Message from="alice">Hi!</Message>
 *   <Message from="bob">Hey!</Message>
 * </Chat>
 */
export function Chat({ children: c }: { children?: string | string[] }) {
  return flatten(c);
}
Chat.meta = {
  usage: "<Chat><Message ...>...</Message></Chat>",
  output: "Conversation transcript as blockquotes",
} satisfies ComponentMeta;
