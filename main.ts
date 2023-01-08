import { serve } from "https://deno.land/std@0.171.0/http/server.ts";
import { readLines } from "https://deno.land/std@0.171.0/io/mod.ts";
import { readerFromStreamReader } from "https://deno.land/std@0.171.0/streams/mod.ts";
import { Hono } from "https://deno.land/x/hono@v3.0.0-rc.4/mod.ts";
import { z } from "https://deno.land/x/zod@v3.20.2/mod.ts";
import { Database } from "./db.ts";
import { parseMessage, readMessages } from "./parse.ts";

const envSchema = z.object({
  PORT: z.coerce.number().optional(),
  POSTGRES_URL: z.string(),
});
const env = envSchema.parse({
  PORT: Deno.env.get("PORT"),
  POSTGRES_URL: Deno.env.get("POSTGRES_URL"),
});

const db = new Database(env.POSTGRES_URL);

const app = new Hono();
app.get("/", async (c) => {
});
app.post("/import", async (c) => {
  const form = await c.req.formData();
  const mbox = form.get("mailbox");
  if (!mbox || typeof mbox === "string") {
    return c.text("mailbox upload is missing or is not a file", 500);
  }

  const reader = readerFromStreamReader(mbox.stream().getReader());
  const messages = readMessages(readLines(reader));

  await db.truncateMessages();

  let count = 0;
  let errors = 0;
  for await (const rawMessage of messages) {
    try {
      db.insertMessage(parseMessage(rawMessage));
      ++count;
    } catch (err) {
      console.error(err);
      ++errors;
    }
  }

  return c.text(`Imported ${count} emails with ${errors} errors`);
});
serve(app.fetch, { port: env.PORT });
