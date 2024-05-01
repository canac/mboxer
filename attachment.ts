import { z } from "zod";

export const schema = z.object({
  id: z.string(),
  message_id: z.string(),
  filename: z.string().optional(),
  mime_type: z.string().optional(),
  contents: z.instanceof(Uint8Array),
});

export type Attachment = z.infer<typeof schema>;
