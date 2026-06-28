import type { UserType } from "../@types/UserTypes";
import { apiGet, apiPost } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import {
  loginPayloadSchema,
  loginResponseSchema,
  parseContract,
  registerPayloadSchema,
  userSchema,
} from "../api/contracts";
import { REQUEST_LIMITS, assertMaxLength } from "../utils/requestLimits";

export type LoginPayload = {
  username: string;
  password: string;
  two_fa_code?: string;
};

export type LoginResponse = {
  token: string;
};

export type RegisterPayload = {
  username: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
};

// ── Auth ─────────────────────────────────────────────────────────────────────

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  assertMaxLength(payload.username, REQUEST_LIMITS.auth.usernameMax, "Username");
  assertMaxLength(payload.password, REQUEST_LIMITS.auth.passwordMax, "Senha");

  const validated = parseContract(
    loginPayloadSchema,
    payload,
    "POST /auth/login payload",
  );

  const response = await apiPost<unknown>(API_ENDPOINTS.auth.login, {
    username: validated.username,
    password: validated.password,
    ...(payload.two_fa_code ? { two_fa_code: payload.two_fa_code } : {}),
  });

  return parseContract(loginResponseSchema, response, "POST /auth/login");
};

export const registerUser = async (payload: RegisterPayload): Promise<void> => {
  assertMaxLength(payload.username, REQUEST_LIMITS.auth.usernameMax, "Username");
  assertMaxLength(payload.name, REQUEST_LIMITS.auth.nameMax, "Nome");
  assertMaxLength(payload.email, REQUEST_LIMITS.auth.emailMax, "Email");
  assertMaxLength(payload.password, REQUEST_LIMITS.auth.passwordMax, "Senha");
  if (payload.phone) {
    assertMaxLength(payload.phone, REQUEST_LIMITS.auth.phoneMax, "Telefone");
  }

  const validated = parseContract(
    registerPayloadSchema,
    payload,
    "POST /user/ payload",
  );

  await apiPost<unknown>(API_ENDPOINTS.user.create, validated);
};

export const googleLoginRedirect = (): void => {
  const base = (import.meta.env.VITE_SERVER_URL ?? "").replace(/\/api\/v1\/?$/, "");
  window.location.href = `${base}/api/v1/auth/google`;
};

export const discordLoginRedirect = (): void => {
  const base = (import.meta.env.VITE_SERVER_URL ?? "").replace(/\/api\/v1\/?$/, "");
  window.location.href = `${base}/api/v1/auth/discord`;
};

// ── User ─────────────────────────────────────────────────────────────────────

export const verifyCurrentUser = async (token: string): Promise<UserType> => {
  const response = await apiGet<unknown>(API_ENDPOINTS.user.me, { token });
  return parseContract(userSchema, response, "GET /user/");
};
