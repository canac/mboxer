import { readLines } from "https://deno.land/std@0.171.0/io/mod.ts";
import { Database } from "./db.ts";
import { parseMessage, readMessages } from "./parse.ts";

const mboxFilename = Deno.args[0];
if (!mboxFilename) {
  console.log("Missing MBOX filename argument!");
  Deno.exit(1);
}

const postgresUrl = Deno.env.get("POSTGRES_URL");
if (!postgresUrl) {
  throw new Error("$POSTGRES_URL environment variable is missing!");
}

const db = new Database(postgresUrl);
await db.truncateMessages();

const mboxFile = await Deno.open(mboxFilename);
for await (const message of readMessages(readLines(mboxFile))) {
  db.insertMessage(parseMessage(message));
}
