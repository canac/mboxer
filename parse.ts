import { instantiate } from "./lib/parser_lib.generated.js";
import { Message } from "./message.ts";

const { parse_message } = await instantiate();

// Given an iterator of lines, return an iterator of messages
export async function* readMessages(
  lines: AsyncIterableIterator<string>,
): AsyncIterableIterator<string> {
  let firstLine = true;
  let message = "";
  for await (const line of lines) {
    if (line.startsWith("From ")) {
      if (!firstLine) {
        yield message;
        message = "";
      }
    } else if (firstLine) {
      // The first line must start a new message
      throw new Error("Malformed MBOX file");
    } else {
      message += line + "\n";
    }

    firstLine = false;
  }

  if (!firstLine) {
    yield message;
  }
}

// Parse a MIME-encoded message into its parts
export function parseMessage(message: string): Message {
  const parsed = parse_message(message);
  if (!parsed.sender) {
    throw new Error("Missing sender");
  }
  if (!parsed.subject) {
    throw new Error("Missing subject");
  }
  if (!parsed.date) {
    throw new Error("Missing date");
  }
  if (!parsed.content) {
    throw new Error("Missing content");
  }
  return {
    id: parsed.id,
    sender: parsed.sender,
    subject: parsed.subject,
    date: new Date(parsed.date),
    content: parsed.content,
  };
}
