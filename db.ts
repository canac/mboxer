import { Client } from "postgres";
import { z } from "zod";
import { Message, schema as messageSchema } from "./message.ts";

const messagesSchema = z.array(messageSchema);

export class Database {
  #client: Promise<Client>;

  constructor(connectionUrl: string) {
    this.#client = Database.#connect(connectionUrl);
  }

  // Load all messages from the database
  async getMessages(search: string | null): Promise<Array<Message>> {
    const client = await this.#client;
    const filter = search
      ? "WHERE sender ILIKE '%' || $search || '%' OR subject ILIKE '%' || $search || '%' OR content ILIKE '%' || $search || '%'"
      : "";
    const { rows } = await client.queryObject(
      `SELECT id, sender, subject, date, content FROM message ${filter} ORDER BY date DESC LIMIT 100`,
      { search },
    );
    return messagesSchema.parse(rows);
  }

  // Load one messages from the database by its id
  async getMessage(id: string): Promise<Message | null> {
    const client = await this.#client;
    try {
      const { rows: [row] } = await client.queryObject(
        "SELECT id, sender, subject, date, content FROM message WHERE id=$id",
        { id },
      );
      return row ? messageSchema.parse(row) : null;
    } catch (_) {
      return null;
    }
  }

  // Insert a new message into the database
  async insertMessage(message: Message): Promise<void> {
    const client = await this.#client;
    const { id, sender, subject, date, content } = message;
    await client.queryObject(
      "INSERT INTO message (id, sender, subject, date, content) VALUES ($id, $sender, $subject, $date, $content) ON CONFLICT (id) DO NOTHING;",
      { id, sender, subject, date: date.toISOString(), content },
    );
  }

  // Create a new DB connection and return it after it finishes connecting
  static async #connect(connectionUrl: string): Promise<Client> {
    const client = new Client(connectionUrl);
    await client.connect();
    return client;
  }
}
