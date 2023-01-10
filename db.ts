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
  async getMessages(): Promise<Array<MessageWithId>> {
    const client = await this.#client;
    const { rows } = await client.queryObject(
      'SELECT id, "from", subject, date, content FROM message ORDER BY date',
    );
    return messagesSchema.parse(rows);
  }

  // Load one messages from the database by its id
  async getMessage(id: string): Promise<MessageWithId | null> {
    const client = await this.#client;
    try {
      const { rows: [row] } = await client.queryObject(
        'SELECT id, "from", subject, date, content FROM message WHERE id=$id',
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
    const { from, subject, date, content } = message;
    await client.queryObject(
      'INSERT INTO message ("from", subject, date, content) VALUES ($from, $subject, $date, $content)',
      { from, subject, date: date.toISOString(), content },
    );
  }

  // Create a new DB connection and return it after it finishes connecting
  static async #connect(connectionUrl: string): Promise<Client> {
    const client = new Client(connectionUrl);
    await client.connect();
    return client;
  }
}
