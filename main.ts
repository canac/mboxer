import { readLines } from "https://deno.land/std@0.171.0/io/mod.ts";
import { parseMessage, readMessages } from "./parse.ts";

const mboxFilename = Deno.args[0];
if (!mboxFilename) {
  console.log("Missing MBOX filename argument!");
  Deno.exit(1);
}

const mboxFile = await Deno.open(mboxFilename);
for await (const message of readMessages(readLines(mboxFile))) {
  const parsed = parseMessage(message);
  console.log(parsed);
}
