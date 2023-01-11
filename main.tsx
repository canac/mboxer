/** @jsx h */
import { serve } from "std/http/server.ts";
import { readLines } from "std/io/mod.ts";
import { readerFromStreamReader } from "std/streams/mod.ts";
import html, { h, JSX } from "htm";
import { Hono } from "hono";
import { serveStatic } from "hono/middleware";
import { isAuthenticated, login } from "./auth.ts";
import { Database } from "./db.ts";
import { env } from "./env.ts";
import { Layout } from "./pages/Layout.tsx";
import { Login } from "./pages/Login.tsx";
import { Messages } from "./pages/Messages.tsx";
import { Message } from "./pages/Message.tsx";
import { parseMessage, readMessages } from "./parse.ts";

const db = new Database(env.POSTGRES_URL);

function document(body: JSX.Element): Promise<Response> {
  return html({
    body,
    scripts: [{ src: "/static/script.js" }],
    links: [
      { rel: "stylesheet", href: "/static/styles.css" },
    ],
  });
}

const app = new Hono();
app.use(
  "*",
  async (c, next) => {
    if (
      new URL(c.req.url).pathname === "/login" || await isAuthenticated(c.req)
    ) {
      return next();
    } else {
      return c.redirect("/login");
    }
  },
);
app.use("/static/*", serveStatic({ root: "./" }));
app.get("/login", (_) => {
  return document(
    <Layout>
      <Login />
    </Layout>,
  );
});
app.post("/login", async (c) => {
  const form = await c.req.formData();
  const password = form.get("password");
  if (typeof password !== "string") {
    return c.status(400);
  }
  try {
    return await login(password);
  } catch (err) {
    return new Response(err.toString() ?? "Forbidden", { status: 403 });
  }
});
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
