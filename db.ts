import { Client, PostgresError } from "postgres";
import { z } from "zod";
import { Attachment, schema as attachmentSchema } from "./attachment.ts";
import { Message, schema as messageSchema } from "./message.ts";

const getAttachmentSchema = attachmentSchema.nullable();
const getMessageAttachmentsSchema = z.array(
  attachmentSchema.pick({ "id": true, "filename": true }),
);
const getMessageSchema = messageSchema.nullable();
const messagesSchema = z.array(messageSchema);

export type GetMessageAttachmentsResult = z.infer<
  typeof getMessageAttachmentsSchema
>;

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

  // Load one attachment from the database
  async getAttachment(
    id: string,
  ): Promise<z.infer<typeof getAttachmentSchema>> {
    const client = await this.#client;
    try {
      const { rows: [row] } = await client.queryObject(
        "SELECT id, message_id, filename, mime_type, contents FROM attachment WHERE id = $id",
        { id },
      );
      return row ? attachmentSchema.parse(row) : null;
    } catch (err) {
      if (err instanceof PostgresError && err.fields.code === "22P02") {
        return null;
      }
      throw err;
    }
  }

  // Load all attachments for a message from the database
  async getMessageAttachments(
    messageId: string,
  ): Promise<GetMessageAttachmentsResult> {
    const client = await this.#client;
    const { rows } = await client.queryObject(
      "SELECT id, filename FROM attachment WHERE message_id = $message_id",
      { message_id: messageId },
    );
    return getMessageAttachmentsSchema.parse(rows);
  }

  // Load one message from the database by its id
  async getMessage(id: string): Promise<z.infer<typeof getMessageSchema>> {
    const client = await this.#client;
    try {
      const { rows: [row] } = await client.queryObject(
        "SELECT id, sender, subject, date, content FROM message WHERE id = $id",
        { id },
      );
      return row ? getMessageSchema.parse(row) : null;
    } catch (err) {
      if (err instanceof PostgresError && err.fields.code === "22P02") {
        return null;
      }
      throw err;
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

  // Insert a new message into the database
  async insertAttachment(
    message: Message,
    attachment: Omit<Attachment, "message_id">,
  ): Promise<void> {
    const client = await this.#client;
    const { id, filename, mime_type, contents } = attachment;
    await client.queryObject(
      "INSERT INTO attachment (id, message_id, filename, mime_type, contents) VALUES ($id, $message_id, $filename, $mime_type, $contents) ON CONFLICT (id) DO NOTHING;",
      {
        id,
        message_id: message.id,
        filename,
        mime_type,
        contents,
      },
    );
  }

  // Create a new DB connection and return it after it finishes connecting
  static async #connect(connectionUrl: string): Promise<Client> {
    const client = new Client(connectionUrl);
    await client.connect();
    return client;
  }
}
