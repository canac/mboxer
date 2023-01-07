import { instantiate } from "./lib/parser_lib.generated.js";

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

export type Message = {
  from: string;
  date: Date;
  content: string;
};

// Parse a MIME-encoded message into its parts
export function parseMessage(message: string): Message {
  const parsed = parse_message(message);
  if (!parsed.from) {
    throw new Error("Missing from");
  }
  if (!parsed.date) {
    throw new Error("Missing date");
  }
  if (!parsed.content) {
    throw new Error("Missing content");
  }
  return {
    from: parsed.from,
    date: new Date(parsed.date),
    content: parsed.content,
  };
}
