import { Client } from "postgres";
import { z } from "zod";
import {
  Message,
  MessageWithId,
  schemaWithId as messageSchema,
} from "./message.ts";

const messagesSchema = z.array(messageSchema);

export class Database {
  #client: Promise<Client>;

  constructor(connectionUrl: string) {
    this.#client = Database.#connect(connectionUrl);
  }

  // Load all messages from the database
  async getMessages(search: string | null): Promise<Array<MessageWithId>> {
    const client = await this.#client;
    const filter = search
      ? "WHERE sender ILIKE '%' || $search || '%' OR subject ILIKE '%' || $search || '%' OR content ILIKE '%' || $search || '%'"
      : "";
    const { rows } = await client.queryObject(
      `SELECT id, sender, subject, date, content FROM message ${filter} ORDER BY date LIMIT 100`,
      { search },
    );
    return messagesSchema.parse(rows);
  }

  // Load one messages from the database by its id
  async getMessage(id: string): Promise<MessageWithId | null> {
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

  // Remove all messages from the database
  async truncateMessages(): Promise<void> {
    const client = await this.#client;
    await client.queryObject("TRUNCATE message");
  }

  // Insert a new message into the database
  async insertMessage(message: Message): Promise<void> {
    const client = await this.#client;
    const { sender, subject, date, content } = message;
    await client.queryObject(
      "INSERT INTO message (sender, subject, date, content) VALUES ($sender, $subject, $date, $content)",
      { sender, subject, date: date.toISOString(), content },
    );
  }

  // Create a new DB connection and return it after it finishes connecting
  static async #connect(connectionUrl: string): Promise<Client> {
    const client = new Client(connectionUrl);
    await client.connect();
    return client;
  }
}
