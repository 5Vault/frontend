import { z } from "zod";
import { logger } from "../utils/logger";

// ── User ─────────────────────────────────────────────────────────────────────

export const userSchema = z
  .object({
    user_id: z.string(),
    username: z.string(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable().optional(),
    api_key: z.string().nullable().optional(),
    tier: z.string().nullable().optional(),
    tier_name: z.string().nullable().optional(),
    tier_updated_at: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string().nullable().optional(),
  })
  .passthrough();

// ── Auth ─────────────────────────────────────────────────────────────────────

export const loginPayloadSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const loginResponseSchema = z
  .object({
    token: z.string(),
  })
  .passthrough();

export const registerPayloadSchema = z.object({
  username: z.string().min(1).max(64),
  name: z.string().min(1).max(128),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres."),
  phone: z.string().optional(),
});

// ── Storage / Bucket ─────────────────────────────────────────────────────────

export const storageConfigSchema = z
  .object({
    bucket_name: z.string(),
    domain: z.string(),
    domain_type: z.string(),
    status: z.string(),
    public_url: z.string(),
  })
  .passthrough();

export const fileEntrySchema = z
  .object({
    key: z.string(),
    size: z.number(),
    last_modified: z.string(),
    public_url: z.string(),
  })
  .passthrough();

export const fileListSchema = z.object({
  files: z.array(fileEntrySchema),
  total: z.number(),
});

export const domainCheckSchema = z
  .object({
    domain: z.string(),
    available: z.boolean(),
    price_usd: z.number(),
    price_brl: z.number(),
    purchase_url: z.string(),
  })
  .passthrough();

// ── Parser ───────────────────────────────────────────────────────────────────

export const parseContract = <T>(
  schema: z.ZodType<T>,
  payload: unknown,
  contractName: string,
): T => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    logger.error(
      `Invalid API contract for ${contractName}`,
      result.error.flatten(),
    );
    throw new Error(`Resposta inválida recebida em ${contractName}.`);
  }
  return result.data;
};
