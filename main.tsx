/** @jsx h */
import { load } from "std/dotenv/mod.ts";
import { serve } from "std/http/server.ts";
import { readLines } from "std/io/mod.ts";
import { readerFromStreamReader } from "std/streams/mod.ts";
import html, { h, JSX } from "htm";
import { Hono } from "hono";
import { serveStatic } from "hono/middleware";
import { z } from "zod";
import { Database } from "./db.ts";
import { Layout } from "./pages/Layout.tsx";
import { Messages } from "./pages/Messages.tsx";
import { Message } from "./pages/Message.tsx";
import { parseMessage, readMessages } from "./parse.ts";

await load({
  export: true,
  examplePath: "",
  restrictEnvAccessTo: ["PORT", "POSTGRES_URL"],
});

const envSchema = z.object({
  PORT: z.coerce.number().optional(),
  POSTGRES_URL: z.string(),
});
const env = envSchema.parse({
  PORT: Deno.env.get("PORT"),
  POSTGRES_URL: Deno.env.get("POSTGRES_URL"),
});

const db = new Database(env.POSTGRES_URL);

function document(body: JSX.Element): Promise<Response> {
  return html({
    body,
    links: [
      { rel: "stylesheet", href: "/static/styles.css" },
    ],
  });
}

const app = new Hono();
app.use("/static/*", serveStatic({ root: "./" }));
app.get("/", async (c) => {
  const search = c.req.query("search") ?? null;
  const messages = await db.getMessages(search);
  return document(
    <Layout>
      <Messages messages={messages} search={search} />
    </Layout>,
  );
});
app.get("/message/:id", async (c) => {
  const id = c.req.param("id");
  const message = await db.getMessage(id);
  if (!message) {
    return c.notFound();
  }
  return document(
    <Layout>
      <Message message={message} />
    </Layout>,
  );
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
