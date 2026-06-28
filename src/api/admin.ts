import { apiGet, apiPost, apiDelete } from "./client";
import { sessionStore } from "../utils/sessionStore";

function token() {
  return sessionStore.getUserToken();
}

export type AdminUser = {
  user_id: string;
  username: string;
  name: string;
  email: string;
  tier: string;
  role: string;
  auth_provider: string;
  created_at: string | null;
};

export type AdminStats = {
  total_users: number;
  new_users_month: number;
  users_by_tier: Record<string, number>;
  total_storages: number;
  active_storages: number;
  pending_storages: number;
};

export type UsersResponse = {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
};

export const getAdminStats = () =>
  apiGet<AdminStats>("/api/v1/admin/stats", { token: token() });

export const listAdminUsers = (page = 1, limit = 20, search = "", tier = "") =>
  apiGet<UsersResponse>("/api/v1/admin/users", {
    token: token(),
    query: { page, limit, search: search || undefined, tier: tier || undefined },
  });

export const setUserTier = (userID: string, tier: string) =>
  apiPost<{ message: string }>(`/api/v1/admin/users/${userID}/tier`, { tier }, { token: token() });

export const setUserRole = (userID: string, role: string) =>
  apiPost<{ message: string }>(`/api/v1/admin/users/${userID}/role`, { role }, { token: token() });

export const deleteUser = (userID: string) =>
  apiDelete<{ message: string }>(`/api/v1/admin/users/${userID}`, { token: token() });
