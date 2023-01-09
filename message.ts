import { z } from "https://deno.land/x/zod@v3.20.2/mod.ts";

export const schema = z.object({
  from: z.string(),
  subject: z.string(),
  date: z.coerce.date(),
  content: z.string(),
});

export const schemaWithId = schema.extend({
  id: z.string(),
});

export type Message = z.infer<typeof schema>;
export type MessageWithId = z.infer<typeof schemaWithId>;
