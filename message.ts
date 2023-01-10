import { z } from "zod";

export const schema = z.object({
  sender: z.string(),
  subject: z.string(),
  date: z.coerce.date(),
  content: z.string(),
});

export const schemaWithId = schema.extend({
  id: z.string(),
});

export type Message = z.infer<typeof schema>;
export type MessageWithId = z.infer<typeof schemaWithId>;
