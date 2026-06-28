export type UserType = {
  user_id: string;
  username: string;
  name: string;
  email: string;
  phone?: string | null;
  api_key?: string | null;
  tier?: string | null;
  tier_name?: string | null;
  tier_updated_at?: string | null;
  extra_storage_enabled: boolean;
  two_fa_enabled?: boolean;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string | null;
};
