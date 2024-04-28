import { load } from "std/dotenv/mod.ts";
import { z } from "zod";

const envVars = ["JWT_SECRET", "MBOX_PASSWORD", "PORT", "POSTGRES_URL"];
await load({ export: true });

const envSchema = z.object({
  JWT_SECRET: z.string(),
  MBOX_PASSWORD: z.string(),
  PORT: z.coerce.number().optional(),
  POSTGRES_URL: z.string(),
});
export const env = envSchema.parse(
  Object.fromEntries(
    envVars.map((varName) => [varName, Deno.env.get(varName)]),
  ),
);
