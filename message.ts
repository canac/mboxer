import { z } from "zod";

export const schema = z.object({
  id: z.string(),
  sender: z.string(),
  subject: z.string(),
  date: z.coerce.date(),
  content: z.string(),
});

export type Message = z.infer<typeof schema>;
