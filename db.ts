import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { Message } from "./message.ts";

export class Database {
  #client: Promise<Client>;

  constructor(connectionUrl: string) {
    this.#client = Database.#connect(connectionUrl);
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
